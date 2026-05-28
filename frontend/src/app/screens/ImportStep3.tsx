import { ArrowLeft, Save, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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
            // Bulk response might not exactly match the order if AI messed up, 
            // but we usually assume AI returns the array in order or we match by word.
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
          // Fallback to original
          setWords(initialWords);
          setIsEnriching(false);
          
          const errMsg = err?.message || '';
          if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit') || errMsg.includes('429') || errMsg.toLowerCase().includes('temporarily unavailable')) {
            setError('AI enrichment is temporarily unavailable. You can still save the words manually, or try again later.');
          } else {
            setError('AI enrichment failed. You can still save the words manually.');
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
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-2" strokeWidth={1.5} />
        <h2 className="text-[20px] font-medium tracking-tight text-foreground">AI is enriching your vocabulary...</h2>
        <p className="text-muted-foreground text-[14px] leading-relaxed">
          AI is generating definitions and example sentences for your selected words...
        </p>
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden relative">
          <div className="h-full bg-primary rounded-full animate-pulse w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/import/step2')}
          className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-medium">
              3
            </div>
            <h1 className="text-[28px] font-medium tracking-tight">Review & Save</h1>
          </div>
          <p className="text-muted-foreground text-[14px] ml-11">
            AI has enriched {words.length} words with definitions and examples
          </p>
        </div>

        {isSaving && (
          <div className="mb-6 bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[14px]">
              <div className="font-medium text-foreground">
                Saving {saveProgressCount} of {words.length}: <span className="font-semibold text-primary">{currentSavingWord}</span>
              </div>
              <div className="text-muted-foreground text-[12px]">
                {Math.round((saveProgressCount / words.length) * 100)}%
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 rounded-full" 
                style={{ width: `${(saveProgressCount / words.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        {/* Batch Settings */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="font-medium text-[15px] mb-4">Batch Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] mb-2">Add to Collection</label>
              {isCreatingCollection ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name..."
                    className="flex-1 h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                    autoFocus
                  />
                  <button
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
                    className="h-10 px-3 bg-primary text-primary-foreground rounded-lg text-[13px]"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setIsCreatingCollection(false)}
                    className="h-10 px-3 border border-border rounded-lg text-[13px]"
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
                  className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                >
                  <option value="">None</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="___CREATE_NEW___">+ Create new collection...</option>
                </select>
              )}
            </div>
            <div>
              <label className="block text-[13px] mb-2">Add Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., imported, article"
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </div>

        {/* Word Preview */}
        <div className="space-y-3">
          {words.map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleExpand(i)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  <div className="text-left">
                    <div className="font-medium text-[15px] mb-0.5 flex items-baseline gap-2">
                      <span>{item.word}</span>
                      {item.ipa && <span className="text-[12.5px] font-mono text-muted-foreground font-normal">/{item.ipa.replace(/^\/|\/$/g, '')}/</span>}
                    </div>
                    <div className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary uppercase mb-1">
                      {item.pos || 'Noun'}
                    </div>
                    <div className="text-[13px] text-muted-foreground">{item.translation}</div>
                  </div>
                </div>
                {expanded.has(i) ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </button>

              {expanded.has(i) && (
                <div className="px-6 pb-5 pt-2 border-t border-border space-y-4">
                  {item.ipa && (
                    <div>
                      <div className="text-[12px] text-muted-foreground mb-1.5 uppercase tracking-wide">IPA Transcription</div>
                      <div className="text-[14.5px] font-mono leading-relaxed text-foreground">/{item.ipa.replace(/^\/|\/$/g, '')}/</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1.5 uppercase tracking-wide">Definition</div>
                    <div className="text-[14px] leading-relaxed">{item.definition || 'No definition available.'}</div>
                  </div>
                  {item.examples && item.examples.length > 0 && (
                    <div>
                      <div className="text-[12px] text-muted-foreground mb-1.5 uppercase tracking-wide">Examples</div>
                      <div className="space-y-2">
                        {item.examples.map((ex: any, j: number) => (
                          <div key={j} className="text-[14px] pl-3 border-l-2 border-primary/20">
                            <div className="leading-relaxed">{ex.sentence || ex}</div>
                            {ex.translation && (
                              <div className="text-[13px] text-muted-foreground mt-1">{ex.translation}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate('/import/step2')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
            disabled={isSaving}
          >
            Back
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Save className="w-4 h-4" strokeWidth={2} />}
            {isSaving ? `Saving ${saveProgressCount}/${words.length}...` : `Save ${words.length} Words`}
          </button>
        </div>
      </div>
    </div>
  );
}
