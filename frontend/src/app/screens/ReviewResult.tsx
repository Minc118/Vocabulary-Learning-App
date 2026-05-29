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
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      <div className="max-w-2xl mx-auto text-center py-8">
        {/* Glow-ring completed icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/5 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-[34px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight mb-2">Recall Session Complete</h1>
        <p className="text-muted-foreground text-[15px] font-semibold mb-10 max-w-sm mx-auto leading-relaxed">
          “Bring your words, learn smarter.” Excellent work updating your vocabulary review queue!
        </p>

        {/* Scorecard widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-[12px] text-slate-450 font-bold uppercase tracking-wider mb-2">Reviewed</div>
            <div className="text-[36px] font-bold text-slate-900 dark:text-white leading-none">{reviewedCount}</div>
            <div className="text-[12px] text-muted-foreground font-semibold mt-2.5">Cards processed</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-[12px] text-slate-450 font-bold uppercase tracking-wider mb-2">Accuracy</div>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-5 h-5 text-teal-500" strokeWidth={2.5} />
              <span className="text-[36px] font-bold text-slate-900 dark:text-white leading-none">{accuracy}%</span>
            </div>
            <div className="text-[12px] text-muted-foreground font-semibold mt-2.5">Correct response rate</div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="text-[12px] text-slate-450 font-bold uppercase tracking-wider mb-2">Time Spent</div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-5 h-5 text-slate-400" strokeWidth={2} />
              <span className="text-[36px] font-bold text-slate-900 dark:text-white leading-none font-mono">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="text-[12px] text-muted-foreground font-semibold mt-2.5">Active session time</div>
          </div>
        </div>

        {/* Detail Breakdown Panel */}
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-5 mb-10 flex justify-around text-[13.5px] shadow-sm">
          <div className="text-center">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[18px]">{correctCount}</div>
            <span className="text-slate-500 font-semibold mt-1 block">Correct responses</span>
          </div>
          <div className="w-px bg-border h-8 self-center"></div>
          <div className="text-center">
            <div className="text-rose-600 dark:text-rose-450 font-bold text-[18px]">{incorrectCount}</div>
            <span className="text-slate-500 font-semibold mt-1 block">Incorrect responses</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 max-w-sm mx-auto">
          <button
            onClick={() => navigate('/')}
            className="w-full h-11 px-6 border border-border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold transition-all text-[14px] cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/review')}
            className="w-full h-11 px-6 bg-primary hover:bg-[#0a3346] text-primary-foreground font-bold rounded-xl transition-all text-[14px] flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/5 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            <span>Practice Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
