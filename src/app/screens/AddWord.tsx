import { Sparkles, Save, X } from 'lucide-react';
import { useState } from 'react';

interface AddWordProps {
  onNavigate: (page: string) => void;
}

export function AddWord({ onNavigate }: AddWordProps) {
  const [word, setWord] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);

  const handleGenerate = () => {
    setAiGenerated(true);
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
            onClick={() => onNavigate('vocabulary')}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Manual Input */}
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium text-[15px] mb-4">Core Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] mb-2">Word</label>
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
                  <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                    <option>German</option>
                    <option>English</option>
                    <option>French</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Translation</label>
                  <input
                    type="text"
                    placeholder="Enter translation..."
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Part of Speech</label>
                  <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                    <option>Noun</option>
                    <option>Verb</option>
                    <option>Adjective</option>
                    <option>Adverb</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Notes</label>
                  <textarea
                    placeholder="Add personal notes..."
                    rows={4}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full h-10 mt-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Generate with AI
              </button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-medium text-[15px] mb-4">Organization</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] mb-2">Collections</label>
                  <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                    <option>None</option>
                    <option>Business German</option>
                    <option>Academic English</option>
                    <option>Travel Vocabulary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="Add tags (comma separated)..."
                    className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Enrichment */}
          <div className="space-y-5">
            {aiGenerated ? (
              <>
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
                    <h3 className="font-medium text-[15px]">AI-Generated Content</h3>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="text-[13px] text-muted-foreground mb-2">Definition</div>
                      <div className="text-[14px] leading-relaxed">
                        The state or fact of having a duty to deal with something or of having control over someone.
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-muted-foreground mb-2">Example Sentences</div>
                      <div className="space-y-2">
                        <div className="text-[14px] leading-relaxed pl-3 border-l-2 border-primary/20">
                          Er trägt die volle Verantwortung für das Projekt.
                        </div>
                        <div className="text-[14px] leading-relaxed pl-3 border-l-2 border-primary/20">
                          Die Verantwortung liegt bei der Geschäftsführung.
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-muted-foreground mb-2">Common Collocations</div>
                      <div className="flex flex-wrap gap-2">
                        {['große Verantwortung', 'volle Verantwortung', 'übernehmen', 'tragen'].map((item, i) => (
                          <span key={i} className="px-3 py-1.5 bg-muted rounded-lg text-[13px]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[13px] text-muted-foreground mb-2">Synonyms</div>
                      <div className="flex flex-wrap gap-2">
                        {['Zuständigkeit', 'Pflicht', 'Aufgabe'].map((item, i) => (
                          <span key={i} className="px-3 py-1.5 bg-muted rounded-lg text-[13px]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card border border-border border-dashed rounded-lg p-12 text-center">
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
            onClick={() => onNavigate('vocabulary')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Cancel
          </button>
          <button className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2">
            <Save className="w-4 h-4" strokeWidth={2} />
            Save Word
          </button>
        </div>
      </div>
    </div>
  );
}
