import { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Trash2, Tag, FolderOpen, Clock, TrendingUp } from 'lucide-react';
import { fetchWordById, type VocabularyWord } from '../../lib/api';

interface WordDetailProps {
  onNavigate: (page: string) => void;
  data?: Partial<VocabularyWord>;
}

export function WordDetail({ onNavigate, data }: WordDetailProps) {
  // initialWord 的作用是提供一个“兜底结构”。
  // 为什么需要它：
  // 1. 避免页面在请求返回前出现大量 undefined
  // 2. 保证 TypeScript 知道 word 始终是完整对象
  // 3. 保留项目原本的原型展示能力
  const initialWord: VocabularyWord = {
    id: data?.id ?? 0,
    word: 'Verantwortung',
    translation: 'responsibility',
    pos: 'noun',
    language: 'German',
    tags: ['Business', 'Ethics', 'Advanced'],
    nextReview: 'Today',
    mastery: 'Learning',
    definition:
      'The state or fact of having a duty to deal with something or of having control over someone. A moral obligation to behave correctly toward or in respect of something.',
    examples: [
      'Er trägt die volle Verantwortung für das Projekt.',
      'Die Verantwortung liegt bei der Geschäftsführung.',
      'Jeder muss Verantwortung für sein Handeln übernehmen.',
    ],
    collocations: [
      'große Verantwortung',
      'volle Verantwortung',
      'Verantwortung übernehmen',
      'Verantwortung tragen',
      'soziale Verantwortung',
    ],
    synonyms: ['Zuständigkeit', 'Pflicht', 'Aufgabe'],
    relatedWords: ['verantwortlich', 'verantworten'],
    collection: 'Business German',
    source: 'Article import',
    addedAt: '2 days ago',
    reviewCount: 5,
  };

  // 这里的状态设计体现了详情页常见的三件事：
  // 1. 当前展示的数据
  // 2. 是否正在加载
  // 3. 是否请求失败
  const [word, setWord] = useState<VocabularyWord>({ ...initialWord, ...data });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(data?.id));

  useEffect(() => {
    // 如果没有 id，说明当前页面拿到的只是临时数据，
    // 那就直接用传进来的 data 展示，不再请求后端。
    if (!data?.id) {
      setWord((current) => ({ ...current, ...data }));
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadWord = async () => {
      try {
        // 如果有 id，就优先用 id 去后端拿“完整详情”。
        // 这比只依赖上一页传来的对象更可靠，因为详情页需要的字段更多。
        const result = await fetchWordById(data.id);
        if (!isMounted) return;
        setWord(result);
        setLoadError(null);
      } catch (error) {
        // 请求失败时，不直接让页面白屏，而是给出错误提示。
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load word details');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadWord();

    return () => {
      isMounted = false;
    };
  }, [data]);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => onNavigate('vocabulary')}
          className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back to Vocabulary
        </button>

        {(isLoading || loadError) && (
          <div
            className={`mb-6 rounded-lg border px-4 py-3 text-[13px] ${
              loadError
                ? 'border-destructive/20 bg-destructive/5 text-destructive'
                : 'border-border bg-muted/30 text-muted-foreground'
            }`}
          >
            {loadError || 'Loading word details from the Flask service...'}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          {/* 左侧是这个词的主要语义信息。 */}
          <div className="col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-[36px] font-medium mb-2">{word.word}</div>
                  <div className="text-[16px] text-muted-foreground">{word.translation}</div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="px-3 py-1 bg-muted rounded-lg text-[13px]">{word.pos}</span>
                    <span className="px-3 py-1 bg-muted rounded-lg text-[13px]">{word.language}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
                    <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Definition
                  </div>
                  <div className="text-[15px] leading-relaxed">{word.definition}</div>
                </div>

                <div>
                  <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Example Sentences
                  </div>
                  <div className="space-y-3">
                    {word.examples.map((example, index) => (
                      <div key={index} className="pl-4 border-l-2 border-primary/30 text-[15px] leading-relaxed">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Common Collocations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {word.collocations.map((item, i) => (
                      <span key={i} className="px-3 py-2 bg-muted rounded-lg text-[14px]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Synonyms
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {word.synonyms.map((item, i) => (
                        <span key={i} className="px-3 py-2 bg-muted rounded-lg text-[14px]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Related Words
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {word.relatedWords.map((item, i) => (
                        <span key={i} className="px-3 py-2 bg-muted rounded-lg text-[14px]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          {/* 右侧是补充信息：学习状态、组织信息、来源信息。 */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-medium text-[15px] mb-4">Learning Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[13px] text-muted-foreground mb-1">Mastery Level</div>
                  <div className="text-[15px] font-medium">{word.mastery}</div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      // 用不同颜色和宽度表达掌握程度，是一种很常见的视觉编码方式。
                      className={`h-full ${
                        word.mastery === 'Mastered'
                          ? 'bg-green-500 w-full'
                          : word.mastery === 'Familiar'
                          ? 'bg-blue-500 w-2/3'
                          : 'bg-primary w-1/3'
                      }`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <div className="text-[13px] text-muted-foreground">Next Review</div>
                    <div className="text-[14px] font-medium">{word.nextReview}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <div className="text-[13px] text-muted-foreground">Review Count</div>
                    <div className="text-[14px] font-medium">{word.reviewCount} times</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-medium text-[15px] mb-4">Organization</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
                    <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Collections
                  </div>
                  <div className="space-y-1.5">
                    <div className="px-3 py-2 bg-muted rounded-lg text-[13px]">{word.collection}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
                    <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {word.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded text-[12px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-medium text-[15px] mb-4">Source</h3>
              <div className="text-[13px] text-muted-foreground mb-1">Added from</div>
              <div className="text-[14px]">{word.source}</div>
              <div className="text-[13px] text-muted-foreground mt-3">{word.addedAt}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
