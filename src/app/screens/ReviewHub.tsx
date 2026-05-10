import { RotateCcw, TrendingUp, Clock, Calendar } from 'lucide-react';

interface ReviewHubProps {
  onNavigate: (page: string) => void;
}

export function ReviewHub({ onNavigate }: ReviewHubProps) {
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
            <div className="text-[56px] font-medium leading-none mb-2">24</div>
            <div className="text-[16px] text-white/90">Words ready for review</div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-[13px] mb-1">Estimated time</div>
            <div className="text-[24px] font-medium">8 min</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-white/70 text-[12px] mb-1">New</div>
            <div className="text-[20px] font-medium">8</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-white/70 text-[12px] mb-1">Learning</div>
            <div className="text-[20px] font-medium">12</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-white/70 text-[12px] mb-1">Review</div>
            <div className="text-[20px] font-medium">4</div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('review-session')}
          className="w-full h-12 bg-white text-primary rounded-lg hover:bg-white/95 transition-colors font-medium text-[15px]"
        >
          Start Review Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">This Week</span>
          </div>
          <div className="text-[32px] font-medium mb-1">156</div>
          <div className="text-[13px] text-muted-foreground">Cards reviewed</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Accuracy</span>
          </div>
          <div className="text-[32px] font-medium mb-1">87%</div>
          <div className="text-[13px] text-muted-foreground">Average recall rate</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Study Time</span>
          </div>
          <div className="text-[32px] font-medium mb-1">2.3h</div>
          <div className="text-[13px] text-muted-foreground">Total this week</div>
        </div>
      </div>

      {/* Upcoming Reviews */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-[15px]">Upcoming Reviews</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { date: 'Tomorrow', count: 18 },
            { date: 'In 2 days', count: 12 },
            { date: 'In 3 days', count: 25 },
            { date: 'In 4 days', count: 8 },
          ].map((item, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="text-[14px]">{item.date}</div>
              <div className="text-[14px] text-muted-foreground">{item.count} words</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
