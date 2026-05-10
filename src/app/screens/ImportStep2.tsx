import { ArrowLeft, ArrowRight, CheckSquare, Square, Filter } from 'lucide-react';
import { useState } from 'react';

interface ImportStep2Props {
  onNavigate: (page: string) => void;
}

export function ImportStep2({ onNavigate }: ImportStep2Props) {
  const candidates = [
    { word: 'Verantwortung', context: 'trägt die volle Verantwortung für', freq: 3, existing: false },
    { word: 'Genauigkeit', context: 'mit höchster Genauigkeit arbeiten', freq: 2, existing: false },
    { word: 'entwickeln', context: 'neue Strategien entwickeln', freq: 2, existing: true },
    { word: 'Zusammenarbeit', context: 'internationale Zusammenarbeit fördern', freq: 1, existing: false },
    { word: 'nachhaltig', context: 'nachhaltige Lösungen finden', freq: 2, existing: false },
  ];

  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 3, 4]));

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => onNavigate('import-step1')}
          className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-medium">
              2
            </div>
            <h1 className="text-[28px] font-medium tracking-tight">Select Candidates</h1>
          </div>
          <p className="text-muted-foreground text-[14px] ml-11">
            {candidates.length} candidates detected · {selected.size} selected
          </p>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left: Text Preview */}
          <div className="col-span-2">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-medium text-[15px] mb-4">Source Text</h3>
              <div className="text-[14px] leading-relaxed space-y-3">
                <p>
                  In der modernen Geschäftswelt trägt jeder Manager die volle{' '}
                  <mark className="bg-primary/20 px-1">Verantwortung</mark> für sein Team. Die{' '}
                  <mark className="bg-primary/20 px-1">Genauigkeit</mark> bei der Planung ist entscheidend.
                </p>
                <p>
                  Teams müssen neue Strategien <mark className="bg-muted px-1">entwickeln</mark> und die internationale{' '}
                  <mark className="bg-primary/20 px-1">Zusammenarbeit</mark> fördern.
                </p>
                <p>
                  Es ist wichtig, <mark className="bg-primary/20 px-1">nachhaltige</mark> Lösungen für komplexe
                  Herausforderungen zu finden.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Candidates */}
          <div className="col-span-3 space-y-4">
            <div className="flex items-center gap-3">
              <button className="h-9 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-[13px] flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
                Hide Existing
              </button>
              <button
                onClick={() => setSelected(new Set(candidates.map((_, i) => i)))}
                className="h-9 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-[13px]"
              >
                Select All
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="h-9 px-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-[13px]"
              >
                Deselect All
              </button>
            </div>

            <div className="space-y-2">
              {candidates.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleSelect(i)}
                  className={`w-full bg-card border rounded-lg p-4 text-left hover:border-primary/30 transition-all ${
                    selected.has(i) ? 'border-primary' : 'border-border'
                  } ${item.existing ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {selected.has(i) ? (
                        <CheckSquare className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium text-[15px]">{item.word}</span>
                        {item.existing && (
                          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[11px] font-medium">
                            Already saved
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[11px]">
                          {item.freq}x
                        </span>
                      </div>
                      <div className="text-[13px] text-muted-foreground">"{item.context}"</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => onNavigate('import-step1')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Back
          </button>
          <button
            onClick={() => onNavigate('import-step3')}
            disabled={selected.size === 0}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with {selected.size} words
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
