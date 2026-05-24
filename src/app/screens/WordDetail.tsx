import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, Edit2, Trash2, Tag, FolderOpen, Clock, TrendingUp, Loader2, Volume2 } from 'lucide-react';
import { fetchWordById, updateWord, deleteWord, type VocabularyWord } from '../../lib/api';
import { speakWord } from '../../lib/speech';

interface WordDetailProps {
  data?: Partial<VocabularyWord>;
}

export function WordDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  
  const initialWord: VocabularyWord = {
    id: data?.id ?? '',
    word: '...',
    translation: '...',
    pos: 'noun',
    language: 'English',
    tags: [],
    nextReview: 'Today',
    mastery: 'Learning',
    definition: '',
    examples: [],
    collocations: [],
    synonyms: [],
    relatedWords: [],
    collection: '',
    source: '',
    addedAt: '',
    reviewCount: 0,
  };

  const [word, setWord] = useState<VocabularyWord>({ ...initialWord, ...data });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(data?.id));
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<VocabularyWord>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!data?.id) {
      setWord((current) => ({ ...current, ...data }));
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadWord = async () => {
      try {
        const result = await fetchWordById(data.id);
        if (!isMounted) return;
        
        // Ensure defaults for arrays to prevent mapping errors
        const safeResult = {
          ...result,
          tags: Array.isArray(result.tags) ? result.tags : [],
          examples: Array.isArray(result.examples) ? result.examples : [],
          collocations: Array.isArray(result.collocations) ? result.collocations : [],
          synonyms: Array.isArray(result.synonyms) ? result.synonyms : [],
          relatedWords: Array.isArray(result.relatedWords) ? result.relatedWords : [],
        };
        
        setWord(safeResult);
        setLoadError(null);
      } catch (error) {
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

  const handleDelete = async () => {
    if (!word.id) return;
    if (!confirm('Are you sure you want to delete this word?')) return;
    
    setIsDeleting(true);
    try {
      await deleteWord(word.id);
      navigate('/vocabulary');
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete word');
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      word: word.word,
      translation: word.translation,
      pos: word.pos,
      language: word.language,
      definition: word.definition
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!word.id) return;
    setIsSaving(true);
    setLoadError(null);
    try {
      const updated = await updateWord(word.id, editForm);
      // Backend returns full word including relation IDs, but we might need to map it properly or just fetch again.
      // Easiest is to update the simple fields locally and re-fetch to be safe.
      setWord(prev => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to update word');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/vocabulary')}
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
          <div className="col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  {isEditing ? (
                    <div className="space-y-3 mb-2">
                      <input 
                        value={editForm.word || ''}
                        onChange={e => setEditForm({ ...editForm, word: e.target.value })}
                        className="text-[30px] font-medium w-full bg-input-background border border-border rounded px-2 focus:outline-none"
                        placeholder="Word"
                      />
                      <div className="flex gap-2">
                        <input 
                          value={editForm.pos || ''}
                          onChange={e => setEditForm({ ...editForm, pos: e.target.value })}
                          className="px-2 py-1 bg-input-background border border-border rounded text-[13px] w-24 focus:outline-none"
                          placeholder="Part of speech"
                        />
                        <input 
                          value={editForm.language || ''}
                          onChange={e => setEditForm({ ...editForm, language: e.target.value })}
                          className="px-2 py-1 bg-input-background border border-border rounded text-[13px] w-24 focus:outline-none"
                          placeholder="Language"
                        />
                      </div>
                      <input 
                        value={editForm.translation || ''}
                        onChange={e => setEditForm({ ...editForm, translation: e.target.value })}
                        className="text-[16px] text-muted-foreground w-full bg-input-background border border-border rounded px-2 focus:outline-none"
                        placeholder="Translation"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="text-[36px] font-medium">{word.word}</div>
                        <button
                          onClick={() => speakWord(word.word, word.language)}
                          className="w-9 h-9 inline-flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors translate-y-[3.5px]"
                          title="Pronounce"
                        >
                          <Volume2 className="w-5.5 h-5.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-muted rounded-lg text-[13px] font-medium text-muted-foreground">{word.pos || 'Unknown'}</span>
                        <span className="px-3 py-1 bg-muted rounded-lg text-[13px] text-muted-foreground">{word.language}</span>
                      </div>
                      <div className="text-[18px] font-medium text-foreground mt-1">{word.translation}</div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="px-3 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors text-[13px]"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="px-3 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-[13px] disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                      </button>
                    </>
                  ) : (
                    <button onClick={handleEditClick} className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-accent transition-colors">
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  )}
                  {!isEditing && (
                    <button 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" strokeWidth={1.5} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {isEditing ? (
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Definition
                    </div>
                    <textarea 
                      value={editForm.definition || ''}
                      onChange={e => setEditForm({ ...editForm, definition: e.target.value })}
                      className="w-full bg-input-background border border-border rounded-lg p-3 text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring/20 min-h-[100px]"
                    />
                  </div>
                ) : word.definition && (
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Definition
                    </div>
                    <div className="text-[15px] leading-relaxed">{word.definition}</div>
                  </div>
                )}

                {word.examples.length > 0 && (
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                      Example Sentences
                    </div>
                    <div className="space-y-3">
                      {word.examples.map((example, index) => (
                        <div key={index} className="pl-4 border-l-2 border-primary/30">
                          <div className="text-[15px] leading-relaxed">{example.sentence}</div>
                          {example.translation && (
                            <div className="text-[14px] text-muted-foreground mt-1">{example.translation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {word.collocations.length > 0 && (
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
                )}

                <div className="grid grid-cols-2 gap-6">
                  {word.synonyms.length > 0 && (
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
                  )}

                  {word.relatedWords.length > 0 && (
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
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-medium text-[15px] mb-4">Learning Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-[13px] text-muted-foreground mb-1">Mastery Level</div>
                  <div className="text-[15px] font-medium">{word.mastery || 'Learning'}</div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div
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
                    <div className="text-[14px] font-medium">{word.nextReview || 'Not scheduled'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                  <div>
                    <div className="text-[13px] text-muted-foreground">Review Count</div>
                    <div className="text-[14px] font-medium">{word.reviewCount || 0} times</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-medium text-[15px] mb-4">Organization</h3>
              <div className="space-y-4">
                {word.collection && (
                  <div>
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
                      <FolderOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Collections
                    </div>
                    <div className="space-y-1.5">
                      <div className="px-3 py-2 bg-muted rounded-lg text-[13px]">{word.collection}</div>
                    </div>
                  </div>
                )}

                {word.tags.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
                      <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(word.tags || []).map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded text-[12px] font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5">
              <h3 className="font-medium text-[15px] mb-4">Source</h3>
              <div className="text-[13px] text-muted-foreground mb-1">Added from</div>
              <div className="text-[14px]">{word.source || 'Manual input'}</div>
              {word.addedAt && <div className="text-[13px] text-muted-foreground mt-3">{word.addedAt}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
