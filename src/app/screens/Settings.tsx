import { User, Bell, Globe, Palette, Database } from 'lucide-react';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export function Settings({ onNavigate }: SettingsProps) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-[28px] font-medium tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-[14px] mt-1">Manage your account and preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-medium text-[15px]">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[13px] mb-2">Display Name</label>
              <input
                type="text"
                defaultValue="Alex Chen"
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div>
              <label className="block text-[13px] mb-2">Email</label>
              <input
                type="email"
                defaultValue="alex.chen@example.com"
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Globe className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-medium text-[15px]">Learning Preferences</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[13px] mb-2">Primary Study Language</label>
              <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option>German</option>
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] mb-2">Daily Review Goal</label>
              <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option>10 cards per day</option>
                <option>20 cards per day</option>
                <option>30 cards per day</option>
                <option>50 cards per day</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[14px] font-medium mb-0.5">Show word context in reviews</div>
                <div className="text-[13px] text-muted-foreground">Display example sentences during review sessions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[14px] font-medium mb-0.5">Auto-generate AI content</div>
                <div className="text-[13px] text-muted-foreground">Automatically add definitions when creating words</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-medium text-[15px]">Notifications</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium mb-0.5">Daily review reminders</div>
                <div className="text-[13px] text-muted-foreground">Get notified when reviews are due</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-medium mb-0.5">Weekly progress summary</div>
                <div className="text-[13px] text-muted-foreground">Receive weekly learning statistics</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Palette className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-medium text-[15px]">Appearance</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[13px] mb-2">Theme</label>
              <select className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20">
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border flex items-center gap-3">
            <Database className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <h2 className="font-medium text-[15px]">Data Management</h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full h-10 px-4 border border-border rounded-lg hover:bg-accent transition-colors text-[14px] text-left">
              Export vocabulary data
            </button>
            <button className="w-full h-10 px-4 border border-border rounded-lg hover:bg-accent transition-colors text-[14px] text-left">
              Import from file
            </button>
            <button className="w-full h-10 px-4 border border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors text-[14px] text-left">
              Delete all data
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="h-10 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
