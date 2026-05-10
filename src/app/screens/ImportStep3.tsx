import { ArrowLeft, Save, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface ImportStep3Props {
  onNavigate: (page: string) => void;
}

export function ImportStep3({ onNavigate }: ImportStep3Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([0]));

  const words = [
    {
      word: 'Verantwortung',
      translation: 'responsibility',
      definition: 'The state or fact of having a duty to deal with something.',
      examples: ['Er trägt die volle Verantwortung.', 'Die Verantwortung liegt bei der Geschäftsführung.'],
    },
    {
      word: 'Genauigkeit',
      translation: 'accuracy, precision',
      definition: 'The quality or state of being exact or correct.',
      examples: ['Mit höchster Genauigkeit arbeiten.'],
    },
    {
      word: 'Zusammenarbeit',
      translation: 'collaboration, cooperation',
      definition: 'The action of working with someone to produce something.',
      examples: ['Internationale Zusammenarbeit fördern.'],
    },
    {
      word: 'nachhaltig',
      translation: 'sustainable',
      definition: 'Able to be maintained at a certain rate or level.',
      examples: ['Nachhaltige Lösungen finden.'],
    },
  ];

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => onNavigate('import-step2')}
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

        {/* Batch Settings */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="font-medium text-[15px] mb-4">Batch Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] mb-2">Add to Collection</label>
              <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option>None</option>
                <option>Business German</option>
                <option>Academic English</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] mb-2">Add Tags</label>
              <input
                type="text"
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
                    <div className="font-medium text-[15px] mb-0.5">{item.word}</div>
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
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1.5 uppercase tracking-wide">Definition</div>
                    <div className="text-[14px] leading-relaxed">{item.definition}</div>
                  </div>
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-1.5 uppercase tracking-wide">Examples</div>
                    <div className="space-y-2">
                      {item.examples.map((ex, j) => (
                        <div key={j} className="text-[14px] pl-3 border-l-2 border-primary/20">
                          {ex}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onNavigate('import-step2')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Back
          </button>
          <button
            onClick={() => onNavigate('vocabulary')}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2"
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            Save {words.length} Words
          </button>
        </div>
      </div>
    </div>
  );
}
