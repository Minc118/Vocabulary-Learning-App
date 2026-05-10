import { X } from 'lucide-react';
import { useState } from 'react';

interface ReviewSessionProps {
  onNavigate: (page: string) => void;
}

export function ReviewSession({ onNavigate }: ReviewSessionProps) {
  const [revealed, setRevealed] = useState(false);
  const currentCard = 1;
  const totalCards = 24;
  const progress = (currentCard / totalCards) * 100;

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="text-[14px] text-muted-foreground">
            {currentCard} / {totalCards}
          </div>
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('review-result')}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          {!revealed ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <div className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wide">German → English</div>
              <div className="text-[48px] font-medium mb-8">Verantwortung</div>
              <button
                onClick={() => setRevealed(true)}
                className="h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[15px] font-medium"
              >
                Show Answer
              </button>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 shadow-sm">
              <div className="text-center mb-8">
                <div className="text-[13px] text-muted-foreground mb-4 uppercase tracking-wide">German → English</div>
                <div className="text-[48px] font-medium mb-3">Verantwortung</div>
                <div className="text-[24px] text-muted-foreground">responsibility</div>
              </div>

              <div className="border-t border-border pt-8 space-y-4">
                <div>
                  <div className="text-[12px] text-muted-foreground mb-2 uppercase tracking-wide">Definition</div>
                  <div className="text-[15px] leading-relaxed">
                    The state or fact of having a duty to deal with something or of having control over someone.
                  </div>
                </div>

                <div>
                  <div className="text-[12px] text-muted-foreground mb-2 uppercase tracking-wide">Example</div>
                  <div className="text-[15px] leading-relaxed">Er trägt die volle Verantwortung für das Projekt.</div>
                </div>
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
              <button className="h-14 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                <div className="text-[15px] font-medium text-red-700">Again</div>
                <div className="text-[12px] text-red-600">{'<1 min'}</div>
              </button>
              <button className="h-14 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
                <div className="text-[15px] font-medium text-orange-700">Hard</div>
                <div className="text-[12px] text-orange-600">5 min</div>
              </button>
              <button className="h-14 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                <div className="text-[15px] font-medium text-blue-700">Good</div>
                <div className="text-[12px] text-blue-600">1 day</div>
              </button>
              <button className="h-14 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors">
                <div className="text-[15px] font-medium text-green-700">Easy</div>
                <div className="text-[12px] text-green-600">3 days</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
