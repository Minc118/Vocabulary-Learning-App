import { ArrowLeft, Save, Sparkles, ChevronDown, ChevronUp, Loader2, Plus, Tag, FolderOpen } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from 'react';
import { enrichWord, bulkEnrichWords, createWord, fetchCollections, createCollection, type Collection } from '../../lib/api';

export function ImportStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  
  const text = data?.text || '';
  const language = data?.language || 'English';
  const title = data?.title || '';
  const initialWords = data?.words || [];

  const [words, setWords] = useState<any[]>(initialWords);
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  
  const [tags, setTags] = useState('');
  
  const [isEnriching, setIsEnriching] = useState(true);
  const [enrichedCount, setEnrichedCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [saveProgressCount, setSaveProgressCount] = useState(0);
  const [currentSavingWord, setCurrentSavingWord] = useState('');

  // Load collections
  useEffect(() => {
    fetchCollections().then(setCollections).catch(console.error);
  }, []);

  // Bulk Enrich Words
  useEffect(() => {
    if (!initialWords.length) {
      setIsEnriching(false);
      return;
    }

    let isMounted = true;

    const performEnrichment = async () => {
      try {
        const aiDataList = await bulkEnrichWords(initialWords, language);
        
        if (isMounted) {
          const enriched = initialWords.map((item, i) => {
            const aiData = aiDataList.find(a => a.word?.toLowerCase() === item.word?.toLowerCase()) || aiDataList[i] || {};
            return {
              ...item,
              ...aiData,
              translation: aiData.translation || item.translation,
              pos: aiData.pos || item.pos || 'Noun'
            };
          });
          setWords(enriched);
          setEnrichedCount(enriched.length);
          setIsEnriching(false);
        }
      } catch (err: any) {
        console.error("Bulk enrichment failed", err);
        if (isMounted) {
          setWords(initialWords);
          setIsEnriching(false);
          
          const errMsg = err?.message || '';
          if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit') || errMsg.includes('429') || errMsg.toLowerCase().includes('temporarily unavailable')) {
            setError('AI enrichment is temporarily unavailable. You can still save the words manually, or try again later.');
          } else {
            setError('AI enrichment failed. You can still save the words manually without AI assistance.');
          }
        }
      }
    };

    performEnrichment();

    return () => {
      isMounted = false;
    };
  }, [initialWords, language]);

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        setSaveProgressCount(i + 1);
        setCurrentSavingWord(word.word);
        
        await createWord({
          word: word.word,
          ipa: word.ipa,
          translation: word.translation || '',
          language,
          pos: word.pos || 'Noun',
          source: title || 'Article import',
          collection: selectedCollection || undefined,
          definition: word.definition,
          examples: word.examples || [],
          collocations: word.collocations || [],
          synonyms: word.synonyms || [],
          relatedWords: word.relatedWords || []
        });
      }
      navigate('/vocabulary');
    } catch (err) {
      const failedWordStr = currentSavingWord ? ` (failed at "${currentSavingWord}")` : '';
      setError((err instanceof Error ? err.message : 'Failed to save words') + failedWordStr);
      setIsSaving(false);
    }
  };

  if (isEnriching) {
    return (
      <div className="fixed inset-0 bg-[#f8fafb] dark:bg-slate-900 flex flex-col items-center justify-center p-8 z-50">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md shadow-lg space-y-5 animate-in fade-in-50 duration-200">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto text-[#002434]" strokeWidth={1.5} />
          <h2 className="text-[20px] font-bold tracking-tight text-foreground">Enriching Vocabulary</h2>
          <p className="text-muted-foreground text-[14px] leading-relaxed font-semibold">
            Voca AI is dynamically parsing the vocabulary library list to generate precise phonetic IPAs, dictionary definitions, and contextual samples.
          </p>
          <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mx-auto border border-border/20">
            <div className="h-full bg-primary rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <button
        onClick={() => navigate('/import/step2')}
        className="flex items-center gap-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to Selection
      </button>

      {/* Stepper Header */}
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[#002434] text-white flex items-center justify-center text-[15px] font-bold shadow-md shadow-black/5 shrink-0">
          3
        </div>
        <div className="space-y-1">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">Review & Save</h1>
          <p className="text-muted-foreground text-[14px] font-medium pt-1">
            Validate translations, assign custom collections, and save newly imported terms to your library dictionary.
          </p>
        </div>
      </div>

      {isSaving && (
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between text-[14px] font-semibold text-slate-700 dark:text-slate-200">
            <div>
              Saving {saveProgressCount} of {words.length}: <span className="font-bold text-primary font-mono">{currentSavingWord}</span>
            </div>
            <div className="font-mono">
              {Math.round((saveProgressCount / words.length) * 100)}%
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border/20">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full" 
              style={{ width: `${(saveProgressCount / words.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-3 text-[13.5px] font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* Batch configuration settings card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-[15px] text-foreground">Save Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Add to Collection */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-slate-550 flex items-center gap-1.5">
              <FolderOpen className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <span>Assigned Collection</span>
            </label>
            {isCreatingCollection ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="New collection name..."
                  className="flex-1 h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCollectionName.trim()) return;
                    try {
                      const created = await createCollection({ name: newCollectionName.trim(), description: '' });
                      setCollections([...collections, created]);
                      setSelectedCollection(created.name);
                      setIsCreatingCollection(false);
                      setNewCollectionName('');
                    } catch (err) {
                      setError('Failed to create collection');
                    }
                  }}
                  className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-[13px] cursor-pointer hover:bg-primary/95"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingCollection(false)}
                  className="h-10 px-4 border border-border font-semibold rounded-xl text-[13px] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select 
                value={selectedCollection}
                onChange={(e) => {
                  if (e.target.value === '___CREATE_NEW___') {
                    setIsCreatingCollection(true);
                  } else {
                    setSelectedCollection(e.target.value);
                  }
                }}
                className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer font-semibold text-slate-700 dark:text-slate-305"
              >
                <option value="">None (Library Root)</option>
                {collections.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="___CREATE_NEW___">+ Create new collection...</option>
              </select>
            )}
          </div>

          {/* Add tags */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-slate-550 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <span>Study Tags</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., imported, TOEFL, reading (comma separated)"
              className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Accordion previews list */}
      <div className="space-y-3.5">
        {words.map((item, i) => {
          const isExpanded = expanded.has(i);

          return (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => toggleExpand(i)}
                className="w-full px-6 py-4.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-center text-teal-600">
                    <Sparkles className="w-4.5 h-4.5 animate-pulse" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-bold text-[15.5px] text-slate-900 dark:text-slate-100 flex items-baseline gap-2.5">
                      <span>{item.word}</span>
                      {item.ipa && (
                        <span className="text-[12.5px] font-mono text-primary font-bold bg-primary/5 px-2 rounded border border-primary/5">
                          /{item.ipa.replace(/^\/|\/$/g, '')}/
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-555 uppercase border border-border/50">
                        {item.pos || 'Noun'}
                      </span>
                      <span className="text-[13px] text-slate-500 font-semibold">{item.translation}</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-slate-450" strokeWidth={2} />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-450" strokeWidth={2} />
                )}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 pt-3 border-t border-border/60 bg-slate-50/20 space-y-5 animate-in slide-in-from-top-1 duration-150">
                  {item.ipa && (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">IPA Phonetics</div>
                      <div className="text-[13.5px] font-mono font-semibold text-primary">/{item.ipa.replace(/^\/|\/$/g, '')}/</div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">Linguistic Definition</div>
                    <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {item.definition || 'No AI-generated definition available.'}
                    </p>
                  </div>
                  {item.examples && item.examples.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">Context Examples</div>
                      <div className="space-y-3">
                        {item.examples.map((ex: any, j: number) => (
                          <div key={j} className="text-[14px] pl-3.5 border-l-2 border-teal-500/40 py-0.5 space-y-0.5">
                            <div className="leading-relaxed font-semibold text-slate-900 dark:text-white">{ex.sentence || ex}</div>
                            {ex.translation && (
                              <div className="text-[13px] text-muted-foreground font-semibold">{ex.translation}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.collocations && item.collocations.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-450 font-bold uppercase tracking-wider">Collocations</div>
                      <div className="flex flex-wrap gap-1.5">
                        {item.collocations.map((col: string, j: number) => (
                          <span key={j} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-border/40 text-[12.5px] font-semibold text-slate-700 dark:text-slate-300">
                            {col}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3.5 pt-4 border-t border-border/80 mt-2">
        <button
          onClick={() => navigate('/import/step2')}
          className="h-10 px-5 border border-border rounded-xl hover:bg-slate-50 font-semibold transition-colors text-[14px] cursor-pointer"
          disabled={isSaving}
        >
          Back
        </button>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="h-10 px-5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-[#0a3346] transition-all text-[14px] flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-primary/5 active:scale-95"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Save className="w-4 h-4" strokeWidth={2} />}
          <span>{isSaving ? `Saving ${saveProgressCount}/${words.length}...` : `Save ${words.length} Words to Voca`}</span>
        </button>
      </div>
    </div>
  );
}
