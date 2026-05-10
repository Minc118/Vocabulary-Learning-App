import { CheckCircle2, TrendingUp, Clock, RotateCcw } from 'lucide-react';

interface ReviewResultProps {
  onNavigate: (page: string) => void;
}

export function ReviewResult({ onNavigate }: ReviewResultProps) {
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={1.5} />
        </div>

        <h1 className="text-[32px] font-medium tracking-tight mb-2">Session Complete</h1>
        <p className="text-muted-foreground text-[15px] mb-8">Great work! You've completed today's review.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-[36px] font-medium mb-1">24</div>
            <div className="text-[13px] text-muted-foreground">Cards reviewed</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={1.5} />
              <div className="text-[36px] font-medium">89%</div>
            </div>
            <div className="text-[13px] text-muted-foreground">Accuracy</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-[36px] font-medium">7:32</div>
            </div>
            <div className="text-[13px] text-muted-foreground">Time spent</div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h3 className="font-medium text-[15px] mb-4 text-left">Performance Breakdown</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-[14px]">Easy</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[14px] text-muted-foreground">8 cards</div>
                <div className="text-[14px] font-medium">33%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-[14px]">Good</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[14px] text-muted-foreground">12 cards</div>
                <div className="text-[14px] font-medium">50%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-[14px]">Hard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[14px] text-muted-foreground">3 cards</div>
                <div className="text-[14px] font-medium">13%</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-[14px]">Again</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[14px] text-muted-foreground">1 card</div>
                <div className="text-[14px] font-medium">4%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => onNavigate('dashboard')}
            className="h-11 px-6 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => onNavigate('review')}
            className="h-11 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px] flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            Review Again
          </button>
        </div>
      </div>
    </div>
  );
}
