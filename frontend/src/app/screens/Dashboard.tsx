import { Plus, Upload, RotateCcw, TrendingUp, Book, Target, FolderOpen } from 'lucide-react';
import { useNavigate } from "react-router";
import { useState, useEffect } from 'react';
import { fetchStats, fetchWords, fetchCollections, type VocabularyWord } from '../../lib/api';

function calculateStreak(words: VocabularyWord[]): number {
  if (!words || words.length === 0) return 0;
  
  const activeDates = new Set<string>();
  words.forEach(w => {
    if (w.created_at) {
      activeDates.add(w.created_at.split('T')[0]);
    }
    if (w.updated_at) {
      activeDates.add(w.updated_at.split('T')[0]);
    }
  });

  const sortedDates = Array.from(activeDates).sort((a, b) => b.localeCompare(a));
  if (sortedDates.length === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // If the user hasn't been active today or yesterday, streak is 0
  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 0; i < sortedDates.length; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (activeDates.has(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getRelativeTimeString(dateStr?: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
}

export function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentWords, setRecentWords] = useState<VocabularyWord[]>([]);
  const [collectionCount, setCollectionCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [statsData, wordsData, collectionsData] = await Promise.all([
          fetchStats(),
          fetchWords(),
          fetchCollections()
        ]);

        if (!active) return;

        setStats(statsData);
        setCollectionCount(collectionsData.length);
        
        // Calculate real streak from user's words
        const userStreak = calculateStreak(wordsData);
        setStreak(userStreak);

        // Sort words by created_at descending and get top 3
        const sorted = [...wordsData].sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });
        setRecentWords(sorted.slice(0, 3));

        setLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to load dashboard statistics.");
        setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/3"></div>
        </div>

        {/* Hero Card Skeleton */}
        <div className="h-48 bg-muted rounded-xl"></div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-4 gap-4">
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>

        {/* Recent Words Skeleton */}
        <div className="h-56 bg-muted rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-[28px] font-medium tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-[14px] mt-1">Your learning overview</p>
        </div>
        <div className="bg-destructive/10 text-destructive p-5 rounded-lg border border-destructive/20 space-y-2">
          <h3 className="font-semibold text-[15px]">Error Loading Dashboard</h3>
          <p className="text-[13px]">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-destructive text-white rounded text-[13px] font-medium hover:bg-destructive/90 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const dueCount = stats?.due_for_review || 0;
  const estimatedMin = Math.ceil(dueCount * 0.5);

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
            <div className="text-[48px] font-medium leading-none mb-2">{dueCount}</div>
            <div className="text-[15px] text-white/90">Words due for review</div>
          </div>
          <div className="text-right">
            <div className="text-white/80 text-[13px] mb-1">Estimated time</div>
            <div className="text-[20px] font-medium">{estimatedMin} min</div>
          </div>
        </div>
        {dueCount > 0 ? (
          <button
            onClick={() => navigate('/review/session')}
            className="mt-6 h-11 px-6 bg-white text-primary rounded-lg hover:bg-white/95 transition-colors font-medium text-[14px]"
          >
            Start Review
          </button>
        ) : (
          <p className="mt-6 text-[14px] text-white/80 italic">No reviews due right now. Nice job!</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/vocabulary/new')}
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <Plus className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-medium text-[14px] mb-1">Add Word</div>
          <div className="text-[13px] text-muted-foreground">Create new vocabulary entry</div>
        </button>

        <button
          onClick={() => navigate('/import')}
          className="bg-card border border-border rounded-lg p-5 hover:border-primary/20 hover:bg-accent/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
            <Upload className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-medium text-[14px] mb-1">Import Text</div>
          <div className="text-[13px] text-muted-foreground">Extract words from article</div>
        </button>

        <button
          onClick={() => navigate('/vocabulary')}
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
          <div className="text-[28px] font-medium">{stats?.total_words || 0}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FolderOpen className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Collections</span>
          </div>
          <div className="text-[28px] font-medium">{collectionCount}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Mastered</span>
          </div>
          <div className="text-[28px] font-medium">{stats?.mastered_words || 0}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Streak</span>
          </div>
          <div className="text-[28px] font-medium">{streak} day{streak !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Recent Words */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-medium text-[15px]">Recently Added</h2>
        </div>
        
        {recentWords.length > 0 ? (
          <div className="divide-y divide-border">
            {recentWords.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate('/vocabulary/' + item.id, { state: item })}
                className="w-full px-6 py-4 hover:bg-accent transition-colors text-left flex items-center justify-between group"
              >
                <div className="flex-1">
                  <div className="font-medium text-[15px] mb-0.5 group-hover:text-primary transition-colors">{item.word}</div>
                  <div className="text-[13px] text-muted-foreground">{item.translation}</div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] text-muted-foreground mb-0.5">{item.language}</div>
                  <div className="text-[12px] text-muted-foreground">{getRelativeTimeString(item.created_at)}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center space-y-4">
            <p className="text-muted-foreground text-[14px]">You haven't added any words yet. Start building your vocabulary!</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/vocabulary/new')}
                className="h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/95 transition-colors font-medium text-[13px]"
              >
                Add Your First Word
              </button>
              <button
                onClick={() => navigate('/import')}
                className="h-9 px-4 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium text-[13px]"
              >
                Import Text
              </button>
              <button
                onClick={() => navigate('/collections')}
                className="h-9 px-4 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium text-[13px]"
              >
                Create a Collection
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
