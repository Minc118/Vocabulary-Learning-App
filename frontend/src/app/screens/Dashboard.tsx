import { Plus, Upload, RotateCcw, TrendingUp, Book, Target, FolderOpen, Clock } from 'lucide-react';
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-muted-foreground text-[14px] mt-1 font-medium">Bring your words, learn smarter.</p>
        </div>
      </div>

      {/* Hero Learning Card */}
      <div className="bg-gradient-to-br from-[#002434] to-[#0a3346] rounded-2xl p-8 text-white relative overflow-hidden border border-slate-800 shadow-lg shadow-slate-950/5">
        <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-semibold tracking-wider uppercase text-teal-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Active Review Session</span>
            </div>
            <h2 className="text-[44px] font-bold tracking-tight leading-none text-white">{dueCount}</h2>
            <p className="text-[14px] text-slate-300 font-medium">Vocabulary words ready for spaced-repetition review</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="text-left md:text-right border-l-2 md:border-l-0 md:border-r-2 border-white/10 pl-4 md:pl-0 pr-0 md:pr-4 py-1">
              <div className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Estimated Study Time</div>
              <div className="text-[18px] font-bold text-white mt-0.5">{estimatedMin} minutes</div>
            </div>
            {dueCount > 0 ? (
              <button
                onClick={() => navigate('/review/session')}
                className="h-11 px-6 bg-teal-400 hover:bg-teal-300 active:scale-[0.98] text-[#002434] rounded-xl transition-all font-semibold text-[14px] shadow-lg shadow-teal-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Start Review Session</span>
                <RotateCcw className="w-4 h-4 animate-spin-slow" />
              </button>
            ) : (
              <div className="text-teal-300 text-[13px] font-medium bg-teal-500/10 px-4 py-2.5 rounded-xl border border-teal-500/20">
                ✨ You are all caught up for today!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <button
          onClick={() => navigate('/vocabulary/new')}
          className="bg-card border border-border rounded-2xl p-6 hover:border-primary/25 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <Plus className="w-5.5 h-5.5 text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
          </div>
          <div className="font-bold text-[15px] text-foreground mb-1 group-hover:text-primary transition-colors">Add Single Word</div>
          <div className="text-[13px] text-muted-foreground leading-relaxed">Save a new word with custom translation and pronunciation details manually.</div>
        </button>

        <button
          onClick={() => navigate('/import')}
          className="bg-card border border-border rounded-2xl p-6 hover:border-primary/25 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <Upload className="w-5.5 h-5.5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-bold text-[15px] text-foreground mb-1 group-hover:text-primary transition-colors">Import Pipeline</div>
          <div className="text-[13px] text-muted-foreground leading-relaxed">Paste full text, let AI extract vocabulary candidates, and save them.</div>
        </button>

        <button
          onClick={() => navigate('/vocabulary')}
          className="bg-card border border-border rounded-2xl p-6 hover:border-primary/25 hover:shadow-lg hover:shadow-slate-100 dark:hover:shadow-none hover:-translate-y-0.5 transition-all text-left group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
            <Book className="w-5.5 h-5.5 text-primary" strokeWidth={2} />
          </div>
          <div className="font-bold text-[15px] text-foreground mb-1 group-hover:text-primary transition-colors">Vocabulary Library</div>
          <div className="text-[13px] text-muted-foreground leading-relaxed">Browse, filter, edit, delete, and export your personal collection repository.</div>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-border/40">
              <Book className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Total Words</span>
          </div>
          <div className="text-[28px] font-bold text-foreground leading-none">{stats?.total_words || 0}</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-border/40">
              <FolderOpen className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Collections</span>
          </div>
          <div className="text-[28px] font-bold text-foreground leading-none">{collectionCount}</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-border/40">
              <Target className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Mastered</span>
          </div>
          <div className="text-[28px] font-bold text-foreground leading-none">{stats?.mastered_words || 0}</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2.5 text-muted-foreground mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-border/40">
              <TrendingUp className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Streak</span>
          </div>
          <div className="text-[28px] font-bold text-foreground leading-none">{streak} day{streak !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Recent Words */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between">
          <h2 className="font-bold text-[16px] text-foreground">Recently Discovered Words</h2>
          <button 
            onClick={() => navigate('/vocabulary')}
            className="text-[13px] font-semibold text-primary hover:underline hover:text-primary/80 transition-colors cursor-pointer"
          >
            View Library
          </button>
        </div>
        
        {recentWords.length > 0 ? (
          <div className="divide-y divide-border/80">
            {recentWords.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate('/vocabulary/' + item.id, { state: item })}
                className="w-full px-6 py-4.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex-1 space-y-1">
                  <div className="font-semibold text-[15px] text-foreground group-hover:text-primary transition-colors flex items-center gap-2 flex-wrap">
                    <span>{item.word}</span>
                    {item.ipa && (
                      <span className="text-[12.5px] font-mono text-muted-foreground font-normal bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        /{item.ipa.replace(/^\/|\/$/g, '')}/
                      </span>
                    )}
                  </div>
                  <div className="text-[13.5px] text-muted-foreground">{item.translation}</div>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
                    {item.language}
                  </span>
                  <div className="text-[12px] text-muted-foreground font-medium">{getRelativeTimeString(item.created_at)}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <p className="text-muted-foreground text-[14px]">You haven't added any words yet. Start building your vocabulary repository!</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/vocabulary/new')}
                className="h-9 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium text-[13px] cursor-pointer"
              >
                Add Your First Word
              </button>
              <button
                onClick={() => navigate('/import')}
                className="h-9 px-4 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium text-[13px] cursor-pointer"
              >
                Import Text
              </button>
              <button
                onClick={() => navigate('/collections')}
                className="h-9 px-4 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors font-medium text-[13px] cursor-pointer"
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
