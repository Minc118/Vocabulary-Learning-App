import { X, Loader2, Volume2 } from 'lucide-react';
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import { fetchReviewQueue, submitReviewAnswer, type VocabularyWord } from '../../lib/api';
import { useLocation } from 'react-router';
import { speakWord } from '../../lib/speech';

type ReviewMode = 'flashcard' | 'multipleChoice' | 'spelling';

export function ReviewSession() {
  const navigate = useNavigate();
  
  const location = useLocation();
  const activeModes: ReviewMode[] = location.state?.activeModes || ['flashcard'];

  const [queue, setQueue] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mode specific state
  const [currentMode, setCurrentMode] = useState<ReviewMode>('flashcard');
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const [spellInput, setSpellInput] = useState('');
  const [spellError, setSpellError] = useState(false);

  const initCard = (index: number, q: VocabularyWord[]) => {
    const word = q[index];
    if (!word) return;
    
    // Pick random mode
    const mode = activeModes[Math.floor(Math.random() * activeModes.length)];
    setCurrentMode(mode);
    setSpellInput('');
    setSpellError(false);

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
    fetchReviewQueue(20)
      .then(words => {
        setQueue(words);
        if (words.length > 0) initCard(0, words);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load review queue');
        setIsLoading(false);
      });
  }, []);

  const handleAnswer = async (answer: 'again' | 'hard' | 'good' | 'easy') => {
    const currentWord = queue[currentIndex];
    if (!currentWord) return;

    setIsSubmitting(true);
    try {
      await submitReviewAnswer(currentWord.id, answer);
      
      // Move to next card
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        navigate('/review/result', { state: { reviewedCount: queue.length } });
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
                    {currentWord.pos && (
                      <div className="mt-2.5">
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
                    {mcOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (opt === currentWord.word) {
                            setRevealed(true);
                          } else {
                            // could shake or highlight red
                            alert('Incorrect!');
                          }
                        }}
                        className="h-14 bg-accent/50 hover:bg-accent border border-border rounded-xl font-medium text-[16px] transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {currentMode === 'spelling' && (
                <>
                  <div className="text-[20px] font-medium mb-8 text-left leading-relaxed">
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
            <div className="bg-card border border-border rounded-2xl p-12 shadow-sm">
              <div className="text-center mb-8">
                <div className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wide">
                  {currentWord.language} → Target Language
                </div>
                <div className="flex items-baseline justify-center w-full mb-3">
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
                {currentWord.pos && (
                  <div className="mb-3.5">
                    <span className="px-2.5 py-0.5 bg-muted rounded text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                      {currentWord.pos}
                    </span>
                  </div>
                )}
                <div className="text-[24px] text-muted-foreground mb-3">{currentWord.translation}</div>
              </div>

              <div className="border-t border-border pt-8 space-y-4 text-left">
                {currentWord.definition && (
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-2 uppercase tracking-wide">Definition</div>
                    <div className="text-[15px] leading-relaxed">
                      {currentWord.definition}
                    </div>
                  </div>
                )}

                {currentWord.examples && currentWord.examples.length > 0 && (
                  <div>
                    <div className="text-[12px] text-muted-foreground mb-2 uppercase tracking-wide">Example</div>
                    <div className="text-[15px] leading-relaxed">
                      {currentWord.examples[0]}
                    </div>
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
                className="h-14 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <div className="text-[15px] font-medium text-red-700">Again</div>
                <div className="text-[12px] text-red-600">Soon</div>
              </button>
              <button 
                onClick={() => handleAnswer('hard')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
              >
                <div className="text-[15px] font-medium text-orange-700">Hard</div>
                <div className="text-[12px] text-orange-600">Tomorrow</div>
              </button>
              <button 
                onClick={() => handleAnswer('good')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              >
                <div className="text-[15px] font-medium text-blue-700">Good</div>
                <div className="text-[12px] text-blue-600">Few days</div>
              </button>
              <button 
                onClick={() => handleAnswer('easy')}
                disabled={isSubmitting}
                className="h-14 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                <div className="text-[15px] font-medium text-green-700">Easy</div>
                <div className="text-[12px] text-green-600">Later</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
