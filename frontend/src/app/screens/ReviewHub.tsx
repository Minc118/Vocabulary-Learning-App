import { RotateCcw, TrendingUp, Clock, Calendar, Loader2 } from 'lucide-react';
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import { fetchReviewQueue, type VocabularyWord } from '../../lib/api';

export function ReviewHub() {
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModes, setSelectedModes] = useState({
    flashcard: true,
    multipleChoice: true,
    spelling: true
  });

  const activeModes = Object.entries(selectedModes).filter(([_, v]) => v).map(([k]) => k);

  useEffect(() => {
    fetchReviewQueue(100)
      .then(words => {
        setDueCount(words.length);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight">Review</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Spaced repetition practice</p>
      </div>

      {/* Today's Review */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-white/80 text-[13px] uppercase tracking-wide mb-2">Due Today</div>
            <div className="text-[56px] font-medium leading-none mb-2">
              {isLoading ? <Loader2 className="w-12 h-12 animate-spin text-white/50" /> : dueCount}
            </div>
            <div className="text-[16px] text-white/90">Words ready for review</div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-[13px] mb-1">Estimated time</div>
            <div className="text-[24px] font-medium">
              {dueCount !== null ? Math.ceil(dueCount / 3) : 0} min
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="text-white/80 text-[13px] uppercase tracking-wide">Review Modes</div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedModes.flashcard} onChange={(e) => setSelectedModes({...selectedModes, flashcard: e.target.checked})} className="rounded bg-white/20 border-white/30 text-white focus:ring-0 w-4 h-4" />
              <span className="text-[14px]">Flashcard</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedModes.multipleChoice} onChange={(e) => setSelectedModes({...selectedModes, multipleChoice: e.target.checked})} className="rounded bg-white/20 border-white/30 text-white focus:ring-0 w-4 h-4" />
              <span className="text-[14px]">Multiple Choice</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedModes.spelling} onChange={(e) => setSelectedModes({...selectedModes, spelling: e.target.checked})} className="rounded bg-white/20 border-white/30 text-white focus:ring-0 w-4 h-4" />
              <span className="text-[14px]">Spelling</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => navigate('/review/session', { state: { activeModes } })}
          disabled={dueCount === 0 || isLoading || activeModes.length === 0}
          className="w-full h-12 bg-white text-primary rounded-lg hover:bg-white/95 transition-colors font-medium text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {dueCount === 0 ? "You're all caught up!" : "Start Review Session"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">This Week</span>
          </div>
          <div className="text-[32px] font-medium mb-1">--</div>
          <div className="text-[13px] text-muted-foreground">Cards reviewed</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Accuracy</span>
          </div>
          <div className="text-[32px] font-medium mb-1">--%</div>
          <div className="text-[13px] text-muted-foreground">Average recall rate</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Study Time</span>
          </div>
          <div className="text-[32px] font-medium mb-1">--</div>
          <div className="text-[13px] text-muted-foreground">Total this week</div>
        </div>
      </div>
    </div>
  );
}
