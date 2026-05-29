import { Sparkles, Save, X, Loader2, Volume2 } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from 'react';
import { createWord, enrichWord, fetchCollections, createCollection, type VocabularyWord, type Collection } from '../../lib/api';
import { speakWord } from '../../lib/speech';

export function AddWord() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [word, setWord] = useState('');
  const [ipa, setIpa] = useState('');
  const [translation, setTranslation] = useState('');
  const [language, setLanguage] = useState('English');
  const [pos, setPos] = useState('Noun');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  
  const [aiData, setAiData] = useState<Partial<VocabularyWord> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    fetchCollections().then(setCollections).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!word.trim()) {
      setError('Please enter a word first');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const result = await enrichWord(word.trim(), language);
      setAiData(result);
      if (result.translation && !translation) setTranslation(result.translation);
      if (result.pos && pos === 'Noun') setPos(result.pos);
      if (result.ipa && !ipa) setIpa(result.ipa);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI Enrichment failed';
      if (msg.includes('manually') || msg.includes('temporarily unavailable')) {
        setError(msg);
      } else {
        setError(`${msg}. You can still save the word manually without AI enrichment by clicking "Save Word" below.`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!word.trim()) {
      setError('Word is required');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      await createWord({
        word,
        ipa,
        translation,
        language,
        pos,
        source: 'Manual input',
        collection: selectedCollection || undefined,
        definition: aiData?.definition,
        examples: aiData?.examples || [],
        collocations: aiData?.collocations || [],
        synonyms: aiData?.synonyms || [],
        relatedWords: aiData?.relatedWords || [],
      });
      navigate('/vocabulary');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save word');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Add Word</h1>
          <p className="text-muted-foreground text-[14px] mt-1 font-medium">Create a new vocabulary entry for your personal dictionary</p>
        </div>
        <button
          onClick={() => navigate('/vocabulary')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
          title="Back to library"
        >
          <X className="w-4.5 h-4.5" strokeWidth={2} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-3 text-[13.5px] font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Panel: Manual Input */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-[15px] text-foreground">Core Information</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-semibold text-slate-550">Word *</label>
                  {word.trim() && (
                    <button
                      onClick={() => speakWord(word, language)}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-350 rounded transition-all active:scale-95 cursor-pointer"
                      type="button"
                      title="Preview Pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>Listen</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Enter word..."
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-550 mb-2">Phonetic / IPA (Optional)</label>
                <input
                  type="text"
                  value={ipa}
                  onChange={(e) => setIpa(e.target.value)}
                  placeholder="e.g. /ˈtrɪɡər/"
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-550 mb-2">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer font-semibold text-slate-700 dark:text-slate-305"
                  >
                    <option>English</option>
                    <option>German</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-550 mb-2">Part of Speech</label>
                  <select 
                    value={pos}
                    onChange={(e) => setPos(e.target.value)}
                    className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer font-semibold text-slate-700 dark:text-slate-305"
                  >
                    <option>Noun</option>
                    <option>Verb</option>
                    <option>Adjective</option>
                    <option>Adverb</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-550 mb-2">Translation</label>
                <input
                  type="text"
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  placeholder="Enter native translation..."
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-550 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add custom study definitions or learning notes..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !word.trim()}
              className="w-full h-10 mt-3.5 bg-[#002434] hover:bg-[#0a3346] text-white rounded-xl font-bold transition-all text-[14px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-black/10 active:scale-95"
            >
              {isGenerating ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Sparkles className="w-4.5 h-4.5 text-teal-400" strokeWidth={2} />}
              <span>{isGenerating ? 'AI is enriching word...' : 'Enrich word with AI'}</span>
            </button>
          </div>

          {/* Org Section */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-[15px] text-foreground">Organization</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-550 mb-2">Collections</label>
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
                      className="h-10 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-[13px] cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsCreatingCollection(false)}
                      className="h-10 px-4 border border-border font-semibold rounded-xl text-[13px] cursor-pointer hover:bg-slate-50"
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
                    <option value="">None</option>
                    {collections.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="___CREATE_NEW___">+ Create new collection...</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-550 mb-2">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. imported, academic (comma separated)..."
                  className="w-full h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[14px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: AI Enrichment */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {isGenerating ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center min-h-[400px] shadow-sm">
              <Loader2 className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" strokeWidth={1.5} />
              <div className="text-[15px] font-bold text-foreground mb-1">AI Enrichment In Progress</div>
              <div className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
                Voca AI is analyzing linguistic properties to generate accurate definitions, IPAs, and examples...
              </div>
            </div>
          ) : aiData ? (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 mb-2 pb-3 border-b border-border/80">
                <Sparkles className="w-4.5 h-4.5 text-teal-500 animate-pulse" strokeWidth={2} />
                <h3 className="font-bold text-[15px] text-foreground">AI-Generated Intelligence</h3>
              </div>

              <div className="space-y-5">
                {aiData.ipa && (
                  <div>
                    <span className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">IPA Transcription</span>
                    <span className="inline-flex items-center font-mono font-bold text-[14.5px] text-primary bg-primary/5 border border-primary/10 rounded-md px-2.5 py-0.5">
                      /{aiData.ipa.replace(/^\/|\/$/g, '')}/
                    </span>
                  </div>
                )}

                {aiData.definition && (
                  <div>
                    <span className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Definition</span>
                    <p className="text-[14px] font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                      {aiData.definition}
                    </p>
                  </div>
                )}

                {aiData.examples && aiData.examples.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">Example Sentences</span>
                    <div className="space-y-3">
                      {aiData.examples.map((example, i) => (
                        <div key={i} className="pl-3.5 border-l-2 border-teal-500/30 space-y-0.5">
                          <div className="text-[14px] font-medium leading-relaxed text-slate-900 dark:text-white">{example.sentence || example}</div>
                          {example.translation && (
                            <div className="text-[13px] text-muted-foreground font-medium">{example.translation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiData.collocations && aiData.collocations.length > 0 && (
                  <div>
                    <span className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">Common Collocations</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiData.collocations.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {aiData.synonyms && aiData.synonyms.length > 0 && (
                  <div>
                    <span className="block text-[11.5px] font-bold uppercase tracking-wider text-slate-400 mb-2">Synonyms</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiData.synonyms.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[12.5px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center min-h-[350px] shadow-sm">
              <Sparkles className="w-9 h-9 text-slate-350 mx-auto mb-3.5" strokeWidth={1.5} />
              <div className="text-[15px] font-bold text-foreground mb-1">AI Enrichment Ready</div>
              <div className="text-[13.5px] text-muted-foreground max-w-xs leading-relaxed">
                Provide a word in the manual panel and trigger "Enrich word with AI" to instantly generate dictionary definitions and collocations.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3.5 border-t border-border/80 pt-5">
        <button
          onClick={() => navigate('/vocabulary')}
          className="h-10 px-5 border border-border rounded-xl hover:bg-slate-50 font-semibold transition-colors text-[14px] cursor-pointer"
          disabled={isSaving}
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="h-10 px-5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all text-[14px] flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-primary/5 active:scale-95"
        >
          {isSaving ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" strokeWidth={2} />}
          <span>{isSaving ? 'Saving vocabulary entry...' : 'Save Word'}</span>
        </button>
      </div>
    </div>
  );
}
