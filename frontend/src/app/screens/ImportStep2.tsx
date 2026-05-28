import { ArrowLeft, ArrowRight, CheckSquare, Square, Filter } from 'lucide-react';
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
      // dynamically import to avoid unused errors if I forgot to import it top level
      const { checkTypo } = await import('../../lib/api');
      const result = await checkTypo(text, wordToAdd);
      
      if (result.not_found) {
        setTypoError(`'${wordToAdd}' was not found in the text.`);
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

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/import/step1')}
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
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24 max-h-[calc(100vh-120px)] flex flex-col">
              <h3 className="font-medium text-[15px] mb-4 shrink-0">Source Text</h3>
              <div className="text-[14px] leading-relaxed space-y-3 whitespace-pre-wrap font-mono break-words overflow-y-auto flex-1 pr-2">
                {text || "No text provided."}
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
            
            <form onSubmit={handleManualAdd} className="bg-card border border-border p-3 rounded-lg flex items-center gap-2">
              <input 
                type="text"
                value={manualWord}
                onChange={e => setManualWord(e.target.value)}
                placeholder="Manually add a word from the text..."
                className="flex-1 h-9 px-3 bg-input-background border border-border rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button 
                type="submit" 
                disabled={isCheckingTypo || !manualWord.trim()}
                className="h-9 px-4 bg-secondary text-secondary-foreground rounded-lg text-[13px] disabled:opacity-50"
              >
                {isCheckingTypo ? 'Checking...' : 'Add Word'}
              </button>
            </form>
            {typoError && <div className="text-[12px] text-destructive px-1">{typoError}</div>}

            <div className="space-y-2">
              {candidates.length === 0 ? (
                <div className="text-[14px] text-muted-foreground text-center py-10">
                  No vocabulary words detected.
                </div>
              ) : (
                candidates.map((item: any, i: number) => (
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
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-medium text-[15px]">{item.word}</span>
                          {item.ipa && <span className="text-[12.5px] font-mono text-muted-foreground font-normal">/{item.ipa.replace(/^\/|\/$/g, '')}/</span>}
                          <span className="text-[13px] text-muted-foreground">{item.translation}</span>
                          {item.existing && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[11px] font-medium">
                              Already saved
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-muted-foreground italic">"{item.context}"</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate('/import/step1')}
            className="h-10 px-5 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
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
