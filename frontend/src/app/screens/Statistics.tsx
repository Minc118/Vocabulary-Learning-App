import { TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { fetchStats } from '../../lib/api';



export function Statistics() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state;
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats", err);
        setError(err.message || 'Failed to load statistics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <p className="text-muted-foreground">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
          {error}
        </div>
      </div>
    );
  }

  const { 
    total_words, 
    mastered_words, 
    added_this_week, 
    due_for_review, 
    study_hours, 
    languages, 
    weekly_activity, 
    progress_data,
    accuracy_rate
  } = stats || {};

  const masteryPercentage = total_words > 0 ? Math.round((mastered_words / total_words) * 100) : 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight">Statistics</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Track your learning progress</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Total Words</span>
          </div>
          <div className="text-[32px] font-medium mb-1">{total_words}</div>
          <div className="text-[13px] text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" strokeWidth={2} />
            +{added_this_week} this week
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Mastered</span>
          </div>
          <div className="text-[32px] font-medium mb-1">{mastered_words}</div>
          <div className="text-[13px] text-muted-foreground">{masteryPercentage}% of total</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Due For Review</span>
          </div>
          <div className="text-[32px] font-medium mb-1">{due_for_review}</div>
          <div className="text-[13px] text-muted-foreground">words waiting</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Total Study Time</span>
          </div>
          <div className="text-[32px] font-medium mb-1">{study_hours}h</div>
          <div className="text-[13px] text-muted-foreground">estimated</div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-medium text-[17px] mb-6">Weekly Review Activity</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weekly_activity || []}>
            <XAxis dataKey="day" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="reviews" fill="#4F46E5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Progress Over Time */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-medium text-[17px] mb-6">Mastered Words Progress</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={progress_data || []}>
            <XAxis dataKey="month" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Line type="monotone" dataKey="mastered" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Language Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-medium text-[17px] mb-4">By Language</h2>
          <div className="space-y-4">
            {(!languages || languages.length === 0) ? (
              <div className="text-muted-foreground text-[13px]">No languages recorded.</div>
            ) : (
              languages.slice(0, 3).map((lang: any, index: number) => {
                const colors = ['bg-primary', 'bg-blue-500', 'bg-purple-500'];
                const percent = total_words > 0 ? Math.round((lang.count / total_words) * 100) : 0;
                return (
                  <div key={lang.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[14px]">{lang.name}</span>
                      <span className="text-[14px] font-medium">{lang.count} words</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colors[index % colors.length]}`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-medium text-[17px] mb-4">Accuracy Rate</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]">This Week</span>
                <span className="text-[14px] font-medium">87%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '87%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]">Last Week</span>
                <span className="text-[14px] font-medium">83%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '83%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]">All Time</span>
                <span className="text-[14px] font-medium">85%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
