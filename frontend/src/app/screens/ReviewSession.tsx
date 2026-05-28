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
        distractors.push('Lorem', 'Ipsum', 'Dolor').slice(0, 3 - distractors.length);
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
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground">Loading review session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8 text-center">
        <p className="text-destructive font-medium mb-4">{error}</p>
        <button onClick={() => navigate('/review')} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">
          Back to Review Hub
        </button>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-medium mb-2">No Reviews Due</h2>
        <p className="text-muted-foreground mb-6">You are all caught up for now!</p>
        <button onClick={() => navigate('/review')} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">
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
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="text-[14px] text-muted-foreground">
            {currentCardNumber} / {totalCards}
          </div>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-[14px] text-muted-foreground ml-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse text-primary" strokeWidth={1.5} />
            <span className="font-mono">{formatTime(elapsedSeconds)}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/review')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {!revealed ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <div className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wide">
                {currentWord.language} → Target Language
              </div>
              
              {currentMode === 'flashcard' && (
                <>
                  <div className="flex flex-col items-center mb-8">
                    <div className="flex items-baseline justify-center w-full mb-1">
                      <div className="w-10 h-10 pointer-events-none opacity-0" aria-hidden="true" />
                      <span className="text-[48px] font-medium leading-none mx-2">{currentWord.word}</span>
                      <button
                        onClick={() => speakWord(currentWord.word, currentWord.language)}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Pronounce"
                      >
                        <Volume2 className="w-6 h-6" strokeWidth={1.5} />
                      </button>
                    </div>
                    {currentWord.ipa && (
                      <div className="text-[15px] font-mono text-muted-foreground mt-1.5 mb-1">
                        /{currentWord.ipa.replace(/^\/|\/$/g, '')}/
                      </div>
                    )}
                    {currentWord.pos && (
                      <div className="mt-2">
                        <span className="px-2.5 py-0.5 bg-muted rounded text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                          {currentWord.pos}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setRevealed(true)}
                    className="h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[15px] font-medium"
                  >
                    Show Answer
                  </button>
                </>
              )}

              {currentMode === 'multipleChoice' && (
                <>
                  <div className="text-[20px] font-medium mb-8 text-left leading-relaxed">
                    {currentWord.definition || currentWord.translation || "No definition available."}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {mcOptions.map((opt, i) => {
                      const isCorrect = opt === currentWord.word;
                      const isSelectedWrong = opt === selectedWrongOption;
                      const hasSelectedAnyWrong = selectedWrongOption !== null;

                      let buttonStyle = "bg-accent/50 hover:bg-accent border-border";
                      if (hasSelectedAnyWrong) {
                        if (isCorrect) {
                          buttonStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:bg-emerald-500/5 dark:border-emerald-500/20 dark:text-emerald-400";
                        } else if (isSelectedWrong) {
                          buttonStyle = "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:bg-rose-500/5 dark:border-rose-500/20 dark:text-rose-400";
                        } else {
                          buttonStyle = "opacity-40 border-border bg-accent/20 cursor-not-allowed";
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
                          className={`h-14 border rounded-xl font-medium text-[16px] transition-all cursor-pointer ${buttonStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selectedWrongOption !== null && (
                    <div className="mt-6 p-5 rounded-xl border border-rose-500/15 bg-rose-500/5 dark:bg-rose-500/5 text-left animate-in fade-in-50 duration-200">
                      <div className="text-[14px] text-rose-800 dark:text-rose-300 font-medium mb-1 flex items-center gap-2">
                        <span>Not quite! The correct answer is</span>
                        <span className="font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 rounded-sm border border-emerald-500/10">
                          {currentWord.word}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                        {isReinforced 
                          ? "We've marked this word for reinforcement to ensure you see it again soon." 
                          : "Reinforcement undone. This card will be processed normally when you continue."}
                      </p>
                      
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsReinforced(!isReinforced)}
                          className="h-9 px-4 rounded-lg border border-border text-[13px] hover:bg-accent font-medium transition-colors cursor-pointer"
                        >
                          {isReinforced ? "Undo Reinforcement" : "Mark for Reinforcement"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(isReinforced ? 'again' : 'good')}
                          disabled={isSubmitting}
                          className="h-9 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors min-w-[90px]"
                        >
                          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Continue'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentMode === 'spelling' && (
                <>
                  <div className="text-[20px] font-medium mb-8 text-center leading-relaxed">
                    {currentWord.definition || currentWord.translation || "No definition available."}
                  </div>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (spellInput.trim().toLowerCase() === currentWord.word.toLowerCase()) {
                        setRevealed(true);
                      } else {
                        setSpellError(true);
                        setTimeout(() => setSpellError(false), 1000);
                      }
                    }}
                    className="max-w-xs mx-auto space-y-4"
                  >
                    <input
                      type="text"
                      autoFocus
                      placeholder="Type the word..."
                      value={spellInput}
                      onChange={(e) => setSpellInput(e.target.value)}
                      className={`w-full h-14 bg-background border ${spellError ? 'border-red-500' : 'border-input'} rounded-xl px-4 text-[18px] text-center focus:outline-none focus:ring-2 focus:ring-primary/20`}
                    />
                    <button
                      type="submit"
                      className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[15px] font-medium"
                    >
                      Check Spelling
                    </button>
                  </form>
                  <button 
                    onClick={() => setRevealed(true)}
                    className="mt-6 text-[13px] text-muted-foreground hover:text-foreground underline"
                  >
                    I don't know (Reveal)
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-10 shadow-sm space-y-6">
              {/* Card Main Info */}
              <div className="text-center pb-6 border-b border-border/50">
                <div className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wide">
                  {displayWord.language} → Target Language
                </div>
                <div className="flex items-baseline justify-center w-full mb-3">
                  <div className="w-10 h-10 pointer-events-none opacity-0" aria-hidden="true" />
                  <span className="text-[44px] font-medium leading-none mx-2">{displayWord.word}</span>
                  <button
                    onClick={() => speakWord(displayWord.word, displayWord.language)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Pronounce"
                  >
                    <Volume2 className="w-6 h-6" strokeWidth={1.5} />
                  </button>
                </div>
                {displayWord.ipa && (
                  <div className="text-[15px] font-mono text-muted-foreground -mt-1.5 mb-3">
                    /{displayWord.ipa.replace(/^\/|\/$/g, '')}/
                  </div>
                )}
                {displayWord.pos && (
                  <div className="mb-3.5">
                    <span className="px-2.5 py-0.5 bg-muted rounded text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                      {displayWord.pos}
                    </span>
                  </div>
                )}
                <div className="text-[22px] font-medium text-foreground">{displayWord.translation}</div>
              </div>

              {/* Rich Details */}
              <div className="space-y-5 text-left">
                {displayWord.definition && (
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Definition</div>
                    <div className="text-[14.5px] leading-relaxed text-foreground/90">
                      {displayWord.definition}
                    </div>
                  </div>
                )}

                {displayWord.examples && displayWord.examples.length > 0 && (
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-2.5 uppercase tracking-wide">Example Sentences</div>
                    <div className="space-y-3">
                      {displayWord.examples.map((ex, idx) => (
                        <div key={idx} className="pl-3.5 border-l-2 border-primary/30 py-0.5">
                          <div className="text-[14.5px] leading-relaxed text-foreground">{typeof ex === 'object' ? ex.sentence : ex}</div>
                          {typeof ex === 'object' && ex.translation && (
                            <div className="text-[13px] text-muted-foreground mt-0.5">{ex.translation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {displayWord.collocations && displayWord.collocations.length > 0 && (
                  <div>
                    <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Common Collocations</div>
                    <div className="flex flex-wrap gap-1.5">
                      {displayWord.collocations.map((item, i) => (
                        <span key={i} className="px-2.5 py-1 bg-muted rounded text-[13px] text-foreground border border-border">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(displayWord.synonyms?.length > 0 || displayWord.relatedWords?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {displayWord.synonyms && displayWord.synonyms.length > 0 && (
                      <div>
                        <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Synonyms</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displayWord.synonyms.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-muted rounded text-[13px] text-foreground border border-border">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {displayWord.relatedWords && displayWord.relatedWords.length > 0 && (
                      <div>
                        <div className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">Related Words</div>
                        <div className="flex flex-wrap gap-1.5">
                          {displayWord.relatedWords.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-muted rounded text-[13px] text-muted-foreground border border-border">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(displayWord.collection || (displayWord.tags && displayWord.tags.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border/50">
                    {displayWord.collection && (
                      <span className="px-2 py-0.5 bg-accent text-accent-foreground text-[11px] font-medium rounded border border-border uppercase tracking-wider">
                        {displayWord.collection}
                      </span>
                    )}
                    {displayWord.tags && displayWord.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-medium rounded border border-primary/5 uppercase tracking-wider">
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

      {/* Rating Buttons */}
      {revealed && (
        <div className="border-t border-border p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-[13px] text-muted-foreground text-center mb-4">How well did you recall this word?</div>
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => handleAnswer('again')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-[15px] font-medium text-rose-700 dark:text-rose-400">Again</div>
                <div className="text-[11px] text-rose-600 dark:text-rose-500 mt-0.5">Soon</div>
              </button>
              <button 
                onClick={() => handleAnswer('hard')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-colors disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-[15px] font-medium text-amber-700 dark:text-amber-400">Hard</div>
                <div className="text-[11px] text-amber-600 dark:text-amber-500 mt-0.5">Tomorrow</div>
              </button>
              <button 
                onClick={() => handleAnswer('good')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-[15px] font-medium text-primary">Good</div>
                <div className="text-[11px] text-primary/80 mt-0.5 font-normal">Few days</div>
              </button>
              <button 
                onClick={() => handleAnswer('easy')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors disabled:opacity-50 cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="text-[15px] font-medium text-emerald-700 dark:text-emerald-400">Easy</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">Later</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
