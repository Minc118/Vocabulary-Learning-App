import { CheckCircle2, TrendingUp, Clock, RotateCcw, Home } from 'lucide-react';
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
    <div className="p-8 max-w-4xl mx-auto bg-[#f8fafb] animate-in fade-in-50 duration-200 text-[#191c1d] pb-24">
      <div className="max-w-2xl mx-auto text-center py-8">
        
        {/* Glowing double-ring completed icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100/50 flex items-center justify-center mx-auto mb-6 shadow-sm shadow-emerald-500/5 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-pulse" strokeWidth={1.5} />
        </div>

        <h1 className="text-[32px] font-extrabold tracking-tight text-[#191c1d] leading-tight mb-2 select-none">
          Recall Session Complete
        </h1>
        <p className="text-[#42474b] text-[13.5px] font-semibold mb-10 max-w-sm mx-auto leading-relaxed select-none">
          “Bring your words, learn smarter.” Excellent work updating your vocabulary review queue!
        </p>

        {/* Scorecard widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Cards Reviewed */}
          <div className="bg-white border border-[#c2c7cc]/60 rounded-2xl p-6 shadow-sm">
            <div className="text-[10px] text-[#42474b] font-bold uppercase tracking-wider mb-2">Reviewed</div>
            <div className="text-[32px] font-extrabold text-[#191c1d] leading-none select-all">{reviewedCount}</div>
            <div className="text-[11.5px] text-[#42474b] font-semibold mt-2.5">Cards processed</div>
          </div>

          {/* Memory Accuracy */}
          <div className="bg-white border border-[#c2c7cc]/60 rounded-2xl p-6 shadow-sm">
            <div className="text-[10px] text-[#42474b] font-bold uppercase tracking-wider mb-2">Accuracy</div>
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-teal-500" strokeWidth={2.5} />
              <span className="text-[32px] font-extrabold text-[#191c1d] leading-none select-all">{accuracy}%</span>
            </div>
            <div className="text-[11.5px] text-[#42474b] font-semibold mt-2.5">Correct response rate</div>
          </div>

          {/* Elapsed Duration */}
          <div className="bg-white border border-[#c2c7cc]/60 rounded-2xl p-6 shadow-sm">
            <div className="text-[10px] text-[#42474b] font-bold uppercase tracking-wider mb-2">Time Spent</div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="w-4.5 h-4.5 text-slate-400" strokeWidth={2} />
              <span className="text-[32px] font-extrabold text-[#191c1d] leading-none font-mono select-all">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="text-[11.5px] text-[#42474b] font-semibold mt-2.5">Active session time</div>
          </div>
        </div>

        {/* Detail Breakdown Panel */}
        <div className="max-w-md mx-auto bg-white border border-[#c2c7cc]/60 rounded-2xl p-5 mb-10 flex justify-around text-[13.5px] shadow-sm select-none">
          <div className="text-center">
            <div className="text-emerald-700 font-extrabold text-[17px]">{correctCount}</div>
            <span className="text-[#42474b] font-bold mt-1 block">Correct responses</span>
          </div>
          <div className="w-px bg-[#c2c7cc]/40 h-8 self-center"></div>
          <div className="text-center">
            <div className="text-rose-700 font-extrabold text-[17px]">{incorrectCount}</div>
            <span className="text-[#42474b] font-bold mt-1 block">Incorrect responses</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12 max-w-sm mx-auto select-none">
          <button
            onClick={() => navigate('/')}
            className="w-full h-11 px-6 border border-[#c2c7cc]/70 bg-white hover:bg-[#f2f4f5] text-[#42474b] hover:text-[#191c1d] font-bold rounded-xl transition-all text-[13.5px] cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigate('/review')}
            className="w-full h-11 px-6 border border-[#002434] bg-white hover:bg-[#002434]/5 text-[#002434] font-bold rounded-xl transition-all text-[13.5px] flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
            <span>Practice Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
