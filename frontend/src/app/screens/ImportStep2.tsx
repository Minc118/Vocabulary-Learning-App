import { ArrowLeft, ArrowRight, CheckSquare, Square, Filter, Plus, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from 'react';

export function ImportStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  
  const text = data?.text || '';
  const language = data?.language || 'English';
  const title = data?.title || '';
  const initialCandidates = data?.candidates || [];

  const [candidates, setCandidates] = useState<any[]>(initialCandidates);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  
  const [manualWord, setManualWord] = useState('');
  const [isCheckingTypo, setIsCheckingTypo] = useState(false);
  const [typoError, setTypoError] = useState<string | null>(null);

  // Filter state for hiding existing words
  const [hideExisting, setHideExisting] = useState(false);

  // Auto-select all by default when candidates load
  useEffect(() => {
    if (candidates.length > 0) {
      setSelected(new Set(candidates.map((_, i) => i)));
    }
  }, [candidates]);

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const wordToAdd = manualWord.trim();
    if (!wordToAdd) return;
    
    setIsCheckingTypo(true);
    setTypoError(null);
    try {
      const { checkTypo } = await import('../../lib/api');
      const result = await checkTypo(text, wordToAdd);
      
      if (result.not_found) {
        setTypoError(`'${wordToAdd}' was not found in the source text.`);
      } else {
        let finalWord = wordToAdd;
        if (result.is_typo && result.corrected_word) {
          const confirmCorrection = window.confirm(`'${wordToAdd}' looks like a typo. Did you mean '${result.corrected_word}'?`);
          if (confirmCorrection) {
            finalWord = result.corrected_word;
          }
        }
        
        // Add to candidates
        const newCandidate = {
          word: finalWord,
          translation: 'Pending AI...',
          pos: 'Unknown',
          context: 'Manually added'
        };
        
        setCandidates(prev => [...prev, newCandidate]);
        // Select it automatically
        setSelected(prev => {
          const next = new Set(prev);
          next.add(candidates.length);
          return next;
        });
        setManualWord('');
      }
    } catch (err) {
      setTypoError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setIsCheckingTypo(false);
    }
  };

  const handleContinue = () => {
    const selectedWords = candidates.filter((_, i) => selected.has(i));
    navigate('/import/step3', {
      state: {
        text,
        language,
        title,
        words: selectedWords
      }
    });
  };

  // Filtered candidates based on "hideExisting" status
  const visibleCandidates = candidates.map((item, idx) => ({ ...item, originalIndex: idx }))
    .filter(item => !hideExisting || !item.existing);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in-50 duration-200">
      <button
        onClick={() => navigate('/import/step1')}
        className="flex items-center gap-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to Paste
      </button>

      {/* Stepper Header */}
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[#002434] text-white flex items-center justify-center text-[15px] font-bold shadow-md shadow-black/5 shrink-0">
          2
        </div>
        <div className="space-y-1">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-white leading-none">Select Keywords</h1>
          <p className="text-muted-foreground text-[14px] font-medium pt-1">
            {candidates.length} candidates extracted • {selected.size} marked for enrichment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left column: Monospace Source Preview (Span 2) */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-24 max-h-[calc(100vh-140px)] flex flex-col shadow-sm">
            <h3 className="font-bold text-[15px] text-foreground shrink-0 mb-3.5">Source Material</h3>
            <div className="text-[13.5px] leading-relaxed whitespace-pre-wrap font-mono break-words overflow-y-auto flex-1 pr-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-border/40 text-slate-800 dark:text-slate-200">
              {text || "No text provided."}
            </div>
          </div>
        </div>

        {/* Right column: Candidate checklist (Span 3) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setHideExisting(!hideExisting)}
              className={`h-9 px-4 rounded-xl border transition-all text-[13px] font-bold flex items-center gap-2 cursor-pointer ${
                hideExisting 
                  ? 'bg-primary/5 text-primary border-primary/20' 
                  : 'bg-card border-border hover:bg-slate-50 text-slate-600'
              }`}
            >
              <Filter className="w-3.5 h-3.5" strokeWidth={ hideExisting ? 2.5 : 1.5 } />
              <span>{hideExisting ? 'Show Existing' : 'Hide Existing'}</span>
            </button>
            <button
              onClick={() => setSelected(new Set(candidates.map((_, i) => i)))}
              className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-slate-50 text-slate-600 font-bold transition-colors text-[13px] cursor-pointer"
            >
              Select All
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="h-9 px-4 rounded-xl border border-border bg-card hover:bg-slate-50 text-slate-600 font-bold transition-colors text-[13px] cursor-pointer"
            >
              Deselect All
            </button>
          </div>
          
          {/* Manual Add Input bar */}
          <form onSubmit={handleManualAdd} className="bg-card border border-border p-3.5 rounded-2xl flex items-center gap-3 shadow-sm">
            <input 
              type="text"
              value={manualWord}
              onChange={e => setManualWord(e.target.value)}
              placeholder="Spell a word manually to add from the text..."
              className="flex-1 h-10 px-3.5 bg-slate-50 dark:bg-slate-800/50 border border-border/80 rounded-xl text-[13.5px] focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
            />
            <button 
              type="submit" 
              disabled={isCheckingTypo || !manualWord.trim()}
              className="h-10 px-4.5 bg-[#002434] hover:bg-[#0a3346] text-white font-bold rounded-xl text-[13px] flex items-center gap-1.5 disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
            >
              {isCheckingTypo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-teal-400" strokeWidth={2.5} />}
              <span>{isCheckingTypo ? 'Verifying...' : 'Add Word'}</span>
            </button>
          </form>
          {typoError && <div className="text-[12.5px] text-rose-600 font-medium px-2.5">{typoError}</div>}

          {/* List candidates */}
          <div className="space-y-3">
            {visibleCandidates.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border border-dashed rounded-2xl">
                <p className="text-[14px] text-muted-foreground font-semibold">No candidate words match your filters.</p>
              </div>
            ) : (
              visibleCandidates.map((item) => {
                const idx = item.originalIndex;
                const isSelected = selected.has(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => toggleSelect(idx)}
                    className={`w-full bg-card border rounded-2xl p-4.5 text-left hover:border-primary/30 transition-all cursor-pointer flex items-start gap-4 shadow-sm ${
                      isSelected ? 'border-primary bg-primary/25 dark:bg-primary/5' : 'border-border/85'
                    } ${item.existing ? 'opacity-65' : ''}`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary" strokeWidth={2} />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" strokeWidth={1.5} />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-3.5 flex-wrap">
                        <span className="font-bold text-[15.5px] text-slate-900 dark:text-slate-100">{item.word}</span>
                        {item.ipa && (
                          <span className="text-[12.5px] font-mono text-primary font-bold bg-primary/5 border border-primary/5 rounded px-1.5">
                            /{item.ipa.replace(/^\/|\/$/g, '')}/
                          </span>
                        )}
                        <span className="text-[13.5px] text-slate-500 font-semibold">{item.translation}</span>
                        {item.existing && (
                          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-550 border border-border rounded-lg text-[10.5px] font-bold uppercase tracking-wider">
                            In Dictionary
                          </span>
                        )}
                      </div>
                      {item.context && (
                        <div className="text-[13px] text-slate-450 dark:text-slate-350 italic font-semibold line-clamp-2 leading-relaxed">
                          "{item.context}"
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3.5 pt-4 border-t border-border/80 mt-2">
        <button
          onClick={() => navigate('/import/step1')}
          className="h-10 px-5 border border-border rounded-xl hover:bg-slate-50 font-semibold transition-colors text-[14px] cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={selected.size === 0}
          className="h-10 px-5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-[#0a3346] transition-all text-[14px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-primary/5 active:scale-95"
        >
          <span>Continue with {selected.size} words</span>
          <ArrowRight className="w-4 h-4 text-teal-400" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
