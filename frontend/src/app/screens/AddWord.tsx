import { Sparkles, Save, X, Loader2, Volume2 } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from 'react';
import { createWord, enrichWord, fetchCollections, createCollection, type VocabularyWord, type Collection } from '../../lib/api';
import { speakWord } from '../../lib/speech';

export function AddWord() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [word, setWord] = useState('');
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
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI Enrichment failed';
      setError(`${msg}. You can still save the word manually without AI enrichment by clicking "Save Word" below.`);
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
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight">Add Word</h1>
            <p className="text-muted-foreground text-[14px] mt-1">Create a new vocabulary entry</p>
          </div>
          <button
            onClick={() => navigate('/vocabulary')}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Manual Input */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium text-[15px] mb-4">Core Information</h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px]">Word *</label>
                    {word.trim() && (
                      <button
                        onClick={() => speakWord(word, language)}
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        type="button"
                        title="Preview Pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Listen
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                    placeholder="Enter word..."
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Language</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option>German</option>
                    <option>English</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Part of Speech</label>
                  <select 
                    value={pos}
                    onChange={(e) => setPos(e.target.value)}
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
                  >
                    <option>Noun</option>
                    <option>Verb</option>
                    <option>Adjective</option>
                    <option>Adverb</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Translation</label>
                  <input
                    type="text"
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                    placeholder="Enter translation..."
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add personal notes..."
                    rows={4}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !word.trim()}
                className="w-full h-10 mt-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" strokeWidth={2} />}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium text-[15px] mb-4">Organization</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] mb-2">Collections</label>
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
                            setSelectedCollection(created.id);
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
                  <label className="block text-[13px] mb-2">Tags</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Add tags (comma separated)..."
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Enrichment */}
          <div className="space-y-5">
            {isGenerating ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center h-full flex flex-col justify-center items-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" strokeWidth={1.5} />
                <div className="text-[14px] font-medium text-foreground mb-1">AI Enrichment In Progress</div>
                <div className="text-[13px] text-muted-foreground max-w-sm">
                  Generating definitions, examples, and collocations...
                </div>
              </div>
            ) : aiData ? (
              <>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
                    <h3 className="font-medium text-[15px]">AI-Generated Content</h3>
                  </div>

                  <div className="space-y-5">
                    {aiData.definition && (
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-2">Definition</div>
                        <div className="text-[14px] leading-relaxed">
                          {aiData.definition}
                        </div>
                      </div>
                    )}

                    {aiData.examples && aiData.examples.length > 0 && (
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-2">Example Sentences</div>
                        <div className="space-y-2">
                          {aiData.examples.map((example, i) => (
                            <div key={i} className="pl-3 border-l-2 border-primary/20">
                              <div className="text-[14px] leading-relaxed">{example.sentence}</div>
                              {example.translation && (
                                <div className="text-[13px] text-muted-foreground mt-1">{example.translation}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiData.collocations && aiData.collocations.length > 0 && (
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-2">Common Collocations</div>
                        <div className="flex flex-wrap gap-2">
                          {aiData.collocations.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 bg-muted rounded-lg text-[13px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiData.synonyms && aiData.synonyms.length > 0 && (
                      <div>
                        <div className="text-[13px] text-muted-foreground mb-2">Synonyms</div>
                        <div className="flex flex-wrap gap-2">
                          {aiData.synonyms.map((item, i) => (
                            <span key={i} className="px-3 py-1.5 bg-muted rounded-lg text-[13px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center h-full flex flex-col justify-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
                <div className="text-[14px] text-muted-foreground mb-1">AI enrichment available</div>
                <div className="text-[13px] text-muted-foreground">
                  Fill in the word and click Generate to add definitions, examples, and more
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate('/vocabulary')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2} />}
            {isSaving ? 'Saving vocabulary entry...' : 'Save Word'}
          </button>
        </div>
      </div>
    </div>
  );
}
