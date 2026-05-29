import { X, Loader2, Volume2, Clock } from 'lucide-react';
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import { fetchReviewQueue, submitReviewAnswer, fetchWordById, type VocabularyWord } from '../../lib/api';
import { useLocation } from 'react-router';
import { speakWord } from '../../lib/speech';

type ReviewMode = 'flashcard' | 'multipleChoice' | 'spelling';

export function ReviewSession() {
  const navigate = useNavigate();
  
  const location = useLocation();
  const activeModes: ReviewMode[] = location.state?.activeModes || ['flashcard'];
  const limit: number = location.state?.limit || 20;
  const collectionId: string = location.state?.collectionId || 'all';

  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detailed word loaded on-demand
  const [detailedWord, setDetailedWord] = useState<VocabularyWord | null>(null);

  // Session stats tracking
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  useEffect(() => {
    if (!isSessionActive) return;
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionActive]);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Multiple Choice learning feedback state
  const [selectedWrongOption, setSelectedWrongOption] = useState<string | null>(null);
  const [isReinforced, setIsReinforced] = useState(false);

  // Mode specific state
  const [currentMode, setCurrentMode] = useState<ReviewMode>('flashcard');
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [spellInput, setSpellInput] = useState('');
  const [spellError, setSpellError] = useState(false);

  // On-demand load rich details for current word
  useEffect(() => {
    const currentWord = queue[currentIndex];
    if (currentWord) {
      setDetailedWord(null);
      fetchWordById(currentWord.id)
        .then(details => setDetailedWord(details))
        .catch(err => console.error("Error prefetching detailed word:", err));
    }
  }, [currentIndex, queue]);

  const initCard = (index: number, q: VocabularyWord[]) => {
    const word = q[index];
    if (!word) return;
    
    // Pick random mode
    const mode = activeModes[Math.floor(Math.random() * activeModes.length)];
    setCurrentMode(mode);
    setSpellInput('');
    setSpellError(false);
    
    // Reset learning feedback states
    setSelectedWrongOption(null);
    setIsReinforced(false);
    setDetailedWord(null);

    if (mode === 'multipleChoice') {
      // Pick 3 distractors
      const others = q.filter(w => w.id !== word.id).map(w => w.word);
      const distractors = others.sort(() => 0.5 - Math.random()).slice(0, 3);
      if (distractors.length < 3) {
        distractors.push('Example', 'Target', 'Context').slice(0, 3 - distractors.length);
      }
      setMcOptions([...distractors, word.word].sort(() => 0.5 - Math.random()));
    }
  };

  useEffect(() => {
    fetchReviewQueue(limit, collectionId)
      .then(words => {
        setQueue(words);
        if (words.length > 0) initCard(0, words);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load review queue');
        setIsLoading(false);
      });
  }, [limit, collectionId]);

  const handleAnswer = async (answer: 'again' | 'hard' | 'good' | 'easy') => {
    const currentWord = queue[currentIndex];
    if (!currentWord) return;

    const isCorrect = answer === 'good' || answer === 'easy';
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }

    setIsSubmitting(true);
    try {
      await submitReviewAnswer(currentWord.id, answer);
      
      // Move to next card
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        setIsSessionActive(false);
        const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
        const finalIncorrect = !isCorrect ? incorrectCount + 1 : incorrectCount;
        const total = finalCorrect + finalIncorrect;
        const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 100;

        navigate('/review/result', { 
          state: { 
            reviewedCount: queue.length,
            accuracy,
            elapsedSeconds,
            correctCount: finalCorrect,
            incorrectCount: finalIncorrect
          } 
        });
      } else {
        setCurrentIndex(nextIndex);
        setRevealed(false);
        initCard(nextIndex, queue);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8fafb] dark:bg-slate-900 flex flex-col items-center justify-center space-y-3 z-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" strokeWidth={1.5} />
        <p className="text-[14px] text-muted-foreground font-semibold">Initiating recall workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#f8fafb] dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-4 z-50">
        <p className="text-rose-600 dark:text-rose-400 font-bold max-w-sm">{error}</p>
        <button onClick={() => navigate('/review')} className="h-10 px-5 bg-primary text-primary-foreground rounded-xl font-bold cursor-pointer transition-all active:scale-95 shadow-md shadow-primary/5">
          Back to Review Hub
        </button>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#f8fafb] dark:bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-4 z-50 animate-in fade-in-50 duration-200">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Review Queue Caught Up!</h2>
        <p className="text-muted-foreground max-w-xs font-semibold leading-relaxed">No reviews scheduled at this threshold. Keep building your vocabulary dictionary!</p>
        <button onClick={() => navigate('/review')} className="h-10 px-5 bg-primary text-primary-foreground rounded-xl font-bold cursor-pointer transition-all active:scale-95 shadow-md shadow-primary/5">
          Back to Review Hub
        </button>
      </div>
    );
  }

  const currentWord = queue[currentIndex];
  const displayWord = detailedWord || currentWord;
  const currentCardNumber = currentIndex + 1;
  const totalCards = queue.length;
  const progress = (currentCardNumber / totalCards) * 100;

  return (
    <div className="fixed inset-0 bg-[#f8fafb] dark:bg-slate-950 flex flex-col z-50 animate-in fade-in-50 duration-200">
      {/* Absolute high-fidelity glass navbar */}
      <div className="h-16 border-b border-border/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 z-20">
        <div className="flex items-center gap-5">
          <div className="text-[13.5px] font-bold text-slate-500">
            Card {currentCardNumber} of {totalCards}
          </div>
          <div className="w-44 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border/20">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-[13px] font-semibold text-slate-500 ml-2 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-border/30">
            <Clock className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
            <span className="font-mono font-bold">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/review')}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-95"
          title="Exit Session"
        >
          <X className="w-4.5 h-4.5" strokeWidth={2} />
        </button>
      </div>

      {/* Main Study Arena */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-2xl">
          {!revealed ? (
            <div className="bg-card border border-border rounded-2xl p-10 md:p-12 text-center shadow-lg shadow-black/5 animate-in fade-in-50 duration-300">
              <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-6 flex items-center justify-center gap-1">
                <span>{currentWord.language}</span>
                <span>•</span>
                <span>Active Recall</span>
              </div>
              
              {currentMode === 'flashcard' && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-full gap-3 flex-wrap">
                      <span className="text-[40px] md:text-[46px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{currentWord.word}</span>
                      <button
                        onClick={() => speakWord(currentWord.word, currentWord.language)}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
                        title="Pronounce"
                      >
                        <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                    {currentWord.ipa && (
                      <div className="text-[14px] font-mono text-primary bg-primary/5 border border-primary/10 rounded-md px-2 py-0.5 mt-3">
                        /{currentWord.ipa.replace(/^\/|\/$/g, '')}/
                      </div>
                    )}
                    {currentWord.pos && (
                      <div className="mt-3">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-border/50 rounded-md text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {currentWord.pos}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setRevealed(true)}
                    className="h-12 px-8 bg-[#002434] hover:bg-[#0a3346] text-white rounded-xl transition-all text-[14.5px] font-bold shadow-md shadow-black/10 active:scale-95 cursor-pointer"
                  >
                    Reveal Definition
                  </button>
                </div>
              )}

              {currentMode === 'multipleChoice' && (
                <div className="space-y-8">
                  <div className="text-[17px] md:text-[19px] font-bold text-slate-800 dark:text-slate-150 text-left leading-relaxed pl-4 border-l-3 border-primary/30 py-1.5 bg-slate-50/50 dark:bg-slate-800/20 rounded-r-xl pr-4">
                    {currentWord.definition || currentWord.translation || "No definition available."}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {mcOptions.map((opt, i) => {
                      const isCorrect = opt === currentWord.word;
                      const isSelectedWrong = opt === selectedWrongOption;
                      const hasSelectedAnyWrong = selectedWrongOption !== null;

                      let buttonStyle = "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-border/80 text-slate-800 dark:text-slate-200";
                      if (hasSelectedAnyWrong) {
                        if (isCorrect) {
                          buttonStyle = "bg-emerald-500/10 border-emerald-500/35 text-emerald-700 dark:text-emerald-400";
                        } else if (isSelectedWrong) {
                          buttonStyle = "bg-rose-500/10 border-rose-500/35 text-rose-700 dark:text-rose-400";
                        } else {
                          buttonStyle = "opacity-40 border-border/40 bg-slate-50/40 cursor-not-allowed";
                        }
                      }

                      return (
                        <button
                          key={i}
                          disabled={hasSelectedAnyWrong}
                          onClick={() => {
                            if (opt === currentWord.word) {
                              setRevealed(true);
                            } else {
                              setSelectedWrongOption(opt);
                              setIsReinforced(true);
                            }
                          }}
                          className={`h-14 border rounded-xl font-bold text-[15.5px] transition-all cursor-pointer flex items-center justify-center px-4 ${buttonStyle} active:scale-98`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedWrongOption !== null && (
                    <div className="mt-6 p-5 rounded-2xl border border-rose-200/50 bg-rose-50 text-left animate-in fade-in-50 duration-200 space-y-3">
                      <div className="text-[13.5px] text-rose-800 font-bold flex items-center gap-2 flex-wrap">
                        <span>Not quite! The correct answer is:</span>
                        <span className="font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-200/50 font-bold">
                          {currentWord.word}
                        </span>
                      </div>
                      <p className="text-[12.5px] text-rose-600 font-medium leading-relaxed">
                        {isReinforced 
                          ? "We've scheduled this term for reinforcement review in this session." 
                          : "Reinforcement disabled. Normal processing is active."}
                      </p>
                      
                      <div className="flex gap-2 pt-2 border-t border-rose-200/40">
                        <button
                          type="button"
                          onClick={() => setIsReinforced(!isReinforced)}
                          className="h-9 px-3.5 rounded-lg border border-rose-200 bg-white text-rose-700 text-[12.5px] hover:bg-rose-50 font-bold transition-all cursor-pointer"
                        >
                          {isReinforced ? "Cancel Reinforce" : "Reinforce Term"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(isReinforced ? 'again' : 'good')}
                          disabled={isSubmitting}
                          className="h-9 px-4.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[12.5px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                        >
                          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Continue'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentMode === 'spelling' && (
                <div className="space-y-8">
                  <div className="text-[17px] md:text-[19px] font-bold text-slate-850 dark:text-slate-100 leading-relaxed text-center max-w-lg mx-auto bg-slate-50 dark:bg-slate-800/20 p-5 rounded-2xl border border-border/40">
                    {currentWord.definition || currentWord.translation || "No definition available."}
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (spellInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
                        setRevealed(true);
                      } else {
                        setSpellError(true);
                        setTimeout(() => setSpellError(false), 800);
                      }
                    }}
                    className="max-w-xs mx-auto space-y-4 pt-2"
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="Spell the word..."
                      value={spellInput}
                      onChange={(e) => setSpellInput(e.target.value)}
                      className={`w-full h-14 bg-slate-50 dark:bg-slate-800/50 border ${spellError ? 'border-rose-500 focus:ring-rose-500/20' : 'border-border/80 focus:border-primary/20'} rounded-2xl px-4 text-[19px] font-bold text-center focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all`}
                    />
                    <button
                      type="submit"
                      className="w-full h-12 bg-[#002434] hover:bg-[#0a3346] text-white rounded-xl font-bold transition-all text-[14px] cursor-pointer shadow-md shadow-black/10 active:scale-98"
                    >
                      Verify Spelling
                    </button>
                  </form>
                  <button 
                    onClick={() => setRevealed(true)}
                    className="text-[13px] text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 underline font-semibold cursor-pointer"
                  >
                    I don't know (Reveal)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-lg shadow-black/5 space-y-6 md:space-y-8 animate-in fade-in-50 duration-300 max-h-[70vh] overflow-y-auto">
              {/* Card Header Information */}
              <div className="text-center pb-6 border-b border-border/80">
                <div className="text-[12px] text-slate-400 font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-1">
                  <span>{displayWord.language}</span>
                  <span>•</span>
                  <span>Target Details</span>
                </div>
                <div className="flex items-center justify-center w-full gap-3 flex-wrap mb-3.5">
                  <span className="text-[36px] md:text-[42px] font-bold text-slate-900 dark:text-white tracking-tight leading-none">{displayWord.word}</span>
                  <button
                    onClick={() => speakWord(displayWord.word, displayWord.language)}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer shadow-sm active:scale-90"
                    title="Pronounce"
                  >
                    <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
                {displayWord.ipa && (
                  <div className="text-[14px] font-mono text-primary bg-primary/5 border border-primary/10 rounded-md px-2.5 py-0.5 inline-block mb-3.5">
                    /{displayWord.ipa.replace(/^\/|\/$/g, '')}/
                  </div>
                )}
                {displayWord.pos && (
                  <div className="mb-3.5">
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-border/50 rounded-md text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {displayWord.pos}
                    </span>
                  </div>
                )}
                <div className="text-[20px] font-bold text-slate-800 dark:text-slate-100 mt-2">{displayWord.translation}</div>
              </div>

              {/* Rich Linguistic Contents */}
              <div className="space-y-6 text-left">
                {displayWord.definition && (
                  <div className="space-y-2">
                    <div className="text-[11.5px] text-slate-450 font-bold uppercase tracking-wider">Definition</div>
                    <div className="text-[14.5px] leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                      {displayWord.definition}
                    </div>
                  </div>
                )}

                {displayWord.examples && displayWord.examples.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="text-[11.5px] text-slate-450 font-bold uppercase tracking-wider">Examples Sentences</div>
                    <div className="space-y-3">
                      {displayWord.examples.map((ex, idx) => (
                        <div key={idx} className="pl-3.5 border-l-2 border-teal-500/40 py-0.5 space-y-0.5">
                          <div className="text-[14.5px] leading-relaxed font-semibold text-slate-900 dark:text-white">
                            {typeof ex === 'object' ? ex.sentence : ex}
                          </div>
                          {typeof ex === 'object' && ex.translation && (
                            <div className="text-[13px] text-muted-foreground font-semibold">{ex.translation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {displayWord.collocations && displayWord.collocations.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="text-[11.5px] text-slate-450 font-bold uppercase tracking-wider">Common Collocations</div>
                    <div className="flex flex-wrap gap-1.5">
                      {displayWord.collocations.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[13px] font-semibold text-slate-700 dark:text-slate-300 border border-border/40">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(displayWord.synonyms?.length > 0 || displayWord.relatedWords?.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayWord.synonyms && displayWord.synonyms.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11.5px] text-slate-450 font-bold uppercase tracking-wider">Synonyms</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displayWord.synonyms.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[12.5px] font-semibold text-slate-700 dark:text-slate-350 border border-border/40">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {displayWord.relatedWords && displayWord.relatedWords.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11.5px] text-slate-450 font-bold uppercase tracking-wider">Related Words</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displayWord.relatedWords.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-[12.5px] font-semibold text-slate-450 border border-border/40">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(displayWord.collection || (displayWord.tags && displayWord.tags.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/80">
                    {displayWord.collection && (
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border border-border/40">
                        {displayWord.collection}
                      </span>
                    )}
                    {displayWord.tags && displayWord.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/5 text-primary rounded-lg text-[11px] font-bold uppercase tracking-wider border border-primary/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* High-fidelity Rating Buttons */}
      {revealed && (
        <div className="border-t border-border/80 bg-white dark:bg-slate-900 p-6 md:p-8 relative z-20">
          <div className="max-w-2xl mx-auto">
            <div className="text-[12.5px] text-slate-500 font-semibold text-center mb-4 uppercase tracking-wider">Rate your recall ability</div>
            <div className="grid grid-cols-4 gap-3.5">
              <button 
                onClick={() => handleAnswer('again')}
                disabled={isSubmitting}
                className="h-14 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/15 hover:border-rose-500/25 transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center shadow-sm active:scale-95"
              >
                <div className="text-[14.5px] font-bold text-rose-700 dark:text-rose-450">Again</div>
                <div className="text-[10px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">Soon</div>
              </button>
              <button 
                onClick={() => handleAnswer('hard')}
                disabled={isSubmitting}
                className="h-14 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 hover:border-amber-500/25 transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center shadow-sm active:scale-95"
              >
                <div className="text-[14.5px] font-bold text-amber-700 dark:text-amber-450">Hard</div>
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mt-0.5">1 Day</div>
              </button>
              <button 
                onClick={() => handleAnswer('good')}
                disabled={isSubmitting}
                className="h-14 rounded-xl bg-[#002434]/5 hover:bg-[#002434]/10 border border-[#002434]/15 hover:border-[#002434]/25 dark:bg-sky-500/5 dark:hover:bg-sky-500/10 dark:border-sky-500/15 transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center shadow-sm active:scale-95"
              >
                <div className="text-[14.5px] font-bold text-[#002434] dark:text-sky-400">Good</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">3 Days</div>
              </button>
              <button 
                onClick={() => handleAnswer('easy')}
                disabled={isSubmitting}
                className="h-14 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 hover:border-emerald-500/25 transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center shadow-sm active:scale-95"
              >
                <div className="text-[14.5px] font-bold text-emerald-700 dark:text-emerald-450">Easy</div>
                <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">7 Days</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
