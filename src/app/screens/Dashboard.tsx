import { Plus, Upload, RotateCcw, TrendingUp, Book, Target } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, data?: any) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Your learning overview</p>
      </div>

      {/* Hero Learning Card */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-white/80 text-[13px] uppercase tracking-wide mb-2">Today</div>
            <div className="text-[48px] font-medium leading-none mb-2">24</div>
            <div className="text-[15px] text-white/90">Words due for review</div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-[13px] mb-1">Estimated time</div>
            <div className="text-[20px] font-medium">8 min</div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('review-session')}
          className="mt-6 h-11 px-6 bg-white text-primary rounded-lg hover:bg-white/95 transition-colors font-medium text-[14px]"
        >
          Start Review
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('add-word')}
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <Plus className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-medium text-[14px] mb-1">Add Word</div>
          <div className="text-[13px] text-muted-foreground">Create new vocabulary entry</div>
        </button>

        <button
          onClick={() => onNavigate('import')}
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <Upload className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-medium text-[14px] mb-1">Import Text</div>
          <div className="text-[13px] text-muted-foreground">Extract words from article</div>
        </button>

        <button
          onClick={() => onNavigate('vocabulary')}
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <Book className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-medium text-[14px] mb-1">Browse Vocabulary</div>
          <div className="text-[13px] text-muted-foreground">View all saved words</div>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Book className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Total Words</span>
          </div>
          <div className="text-[28px] font-medium">342</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Mastered</span>
          </div>
          <div className="text-[28px] font-medium">127</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">This Week</span>
          </div>
          <div className="text-[28px] font-medium">48</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Streak</span>
          </div>
          <div className="text-[28px] font-medium">12</div>
        </div>
      </div>

      {/* Recent Words */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-[15px]">Recently Added</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            { word: 'Verantwortung', translation: 'responsibility', lang: 'German', time: '2 hours ago' },
            { word: 'ephemeral', translation: 'lasting for a very short time', lang: 'English', time: '5 hours ago' },
            { word: 'Genauigkeit', translation: 'accuracy', lang: 'German', time: 'Yesterday' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => onNavigate('word-detail', item)}
              className="w-full px-6 py-4 hover:bg-accent transition-colors text-left flex items-center justify-between group"
            >
              <div className="flex-1">
                <div className="font-medium text-[15px] mb-0.5 group-hover:text-primary transition-colors">{item.word}</div>
                <div className="text-[13px] text-muted-foreground">{item.translation}</div>
              </div>
              <div className="text-right">
                <div className="text-[12px] text-muted-foreground mb-0.5">{item.lang}</div>
                <div className="text-[12px] text-muted-foreground">{item.time}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
