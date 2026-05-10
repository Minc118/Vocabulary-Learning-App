import { TrendingUp, Calendar, Target, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StatisticsProps {
  onNavigate: (page: string) => void;
}

export function Statistics({ onNavigate }: StatisticsProps) {
  const weeklyData = [
    { day: 'Mon', reviews: 24 },
    { day: 'Tue', reviews: 32 },
    { day: 'Wed', reviews: 18 },
    { day: 'Thu', reviews: 28 },
    { day: 'Fri', reviews: 35 },
    { day: 'Sat', reviews: 22 },
    { day: 'Sun', reviews: 26 },
  ];

  const progressData = [
    { month: 'Jan', mastered: 45 },
    { month: 'Feb', mastered: 78 },
    { month: 'Mar', mastered: 103 },
    { month: 'Apr', mastered: 127 },
  ];

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
          <div className="text-[32px] font-medium mb-1">342</div>
          <div className="text-[13px] text-green-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" strokeWidth={2} />
            +12 this week
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Mastered</span>
          </div>
          <div className="text-[32px] font-medium mb-1">127</div>
          <div className="text-[13px] text-muted-foreground">37% of total</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Current Streak</span>
          </div>
          <div className="text-[32px] font-medium mb-1">12</div>
          <div className="text-[13px] text-muted-foreground">days in a row</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[13px]">Total Study Time</span>
          </div>
          <div className="text-[32px] font-medium mb-1">24.5h</div>
          <div className="text-[13px] text-muted-foreground">this month</div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="font-medium text-[17px] mb-6">Weekly Review Activity</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeklyData}>
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
          <LineChart data={progressData}>
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
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]">German</span>
                <span className="text-[14px] font-medium">187 words</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '55%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]">English</span>
                <span className="text-[14px] font-medium">128 words</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '37%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px]">French</span>
                <span className="text-[14px] font-medium">27 words</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: '8%' }}></div>
              </div>
            </div>
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
