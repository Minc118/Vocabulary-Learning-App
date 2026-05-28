import { CheckCircle2, TrendingUp, Clock, RotateCcw } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";

export function ReviewResult() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const reviewedCount = location.state?.reviewedCount || 0;
  const accuracy = location.state?.accuracy ?? 0;
  const elapsedSeconds = location.state?.elapsedSeconds || 0;
  const correctCount = location.state?.correctCount || 0;
  const incorrectCount = location.state?.incorrectCount || 0;

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={1.5} />
        </div>

        <h1 className="text-[32px] font-medium tracking-tight mb-2">Session Complete</h1>
        <p className="text-muted-foreground text-[15px] mb-8">Great work! You've completed your review session.</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-[36px] font-medium mb-1">{reviewedCount}</div>
            <div className="text-[13px] text-muted-foreground">Cards reviewed</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={1.5} />
              <div className="text-[36px] font-medium">{accuracy}%</div>
            </div>
            <div className="text-[13px] text-muted-foreground">Accuracy</div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              <div className="text-[36px] font-medium">{formatTime(elapsedSeconds)}</div>
            </div>
            <div className="text-[13px] text-muted-foreground">Time spent</div>
          </div>
        </div>

        {/* Detail Breakdown */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-4 mb-8 flex justify-around text-[13px]">
          <div className="text-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{correctCount}</span>
            <span className="text-muted-foreground ml-1.5">Correct (Good/Easy)</span>
          </div>
          <div className="w-px bg-border h-5 self-center"></div>
          <div className="text-center">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">{incorrectCount}</span>
            <span className="text-muted-foreground ml-1.5">Incorrect (Again/Hard)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="h-11 px-6 border border-border rounded-lg hover:bg-accent transition-colors text-[14px]"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => navigate('/review')}
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
