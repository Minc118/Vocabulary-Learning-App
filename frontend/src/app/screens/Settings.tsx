import { User, Bell, Globe, Palette, Database, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  exportVocabularyData, 
  exportCollectionsData, 
  exportReviewProgressData, 
  exportAllData 
} from '../../lib/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '../components/ui/alert-dialog';

export function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [nativeLanguage, setNativeLanguage] = useState('Chinese');
  const [displayName, setDisplayName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  // Data management states
  const [isExporting, setIsExporting] = useState<'vocabulary' | 'collections' | 'review' | 'all' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nativeLanguage');
    if (saved) {
      setNativeLanguage(saved);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEmailAddress(user.email || '');
    }
  }, [user]);

  const isOAuth = user?.app_metadata?.provider === 'google';

  const handleSave = () => {
    localStorage.setItem('nativeLanguage', nativeLanguage);
    setMessage({ type: 'success', text: 'Settings saved successfully!' });
  };

  const downloadJSON = (data: any, defaultFilename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    
    const today = new Date().toISOString().split('T')[0];
    const filename = defaultFilename.replace('YYYY-MM-DD', today);
    downloadAnchor.setAttribute('download', filename);
    
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (type: 'vocabulary' | 'collections' | 'review' | 'all') => {
    setIsExporting(type);
    setMessage(null);
    try {
      let data: any;
      let filename = '';
      
      if (type === 'vocabulary') {
        data = await exportVocabularyData();
        filename = 'voca-vocabulary-export-YYYY-MM-DD.json';
      } else if (type === 'collections') {
        data = await exportCollectionsData();
        filename = 'voca-collections-export-YYYY-MM-DD.json';
      } else if (type === 'review') {
        data = await exportReviewProgressData();
        filename = 'voca-review-export-YYYY-MM-DD.json';
      } else if (type === 'all') {
        data = await exportAllData();
        filename = 'voca-full-export-YYYY-MM-DD.json';
      }
      
      downloadJSON(data, filename);
      setMessage({ type: 'success', text: `Successfully exported ${type} data!` });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : `Failed to export ${type} data` 
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('nativeLanguage');
    setNativeLanguage('Chinese');
    setMessage({ type: 'success', text: 'App preferences cleared successfully!' });
  };

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
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isOAuth}
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-70 disabled:cursor-not-allowed"
              />
              {isOAuth && (
                <p className="text-[11px] text-muted-foreground mt-1">Managed automatically by Google Account</p>
              )}
            </div>
            <div>
              <label className="block text-[13px] mb-2">Email</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={isOAuth}
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-70 disabled:cursor-not-allowed"
              />
              {isOAuth && (
                <p className="text-[11px] text-muted-foreground mt-1">Managed automatically by Google Account</p>
              )}
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
              <label className="block text-[13px] mb-2">Native Translation Language</label>
              <select 
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                className="w-full h-10 px-3 bg-input-background border border-border rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                <option value="Chinese">Chinese (中文)</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Japanese">Japanese</option>
              </select>
              <p className="text-[12px] text-muted-foreground mt-1">AI will translate words and sentences into this language.</p>
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
          <div className="p-6 space-y-4">
            {message && (
              <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                  : 'bg-destructive/5 border-destructive/10 text-destructive'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-destructive" />
                )}
                <div className="text-[13px] font-medium leading-relaxed">{message.text}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('all')}
                className="h-16 px-4 border border-border rounded-xl hover:bg-accent transition-colors text-[14px] font-medium flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-medium text-foreground">Export All Data</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">Vocabulary & Collections bundle</div>
                </div>
                {isExporting === 'all' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('vocabulary')}
                className="h-16 px-4 border border-border rounded-xl hover:bg-accent transition-colors text-[14px] font-medium flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-medium text-foreground">Export Vocabulary</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">Complete words list & relations</div>
                </div>
                {isExporting === 'vocabulary' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('collections')}
                className="h-16 px-4 border border-border rounded-xl hover:bg-accent transition-colors text-[14px] font-medium flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-medium text-foreground">Export Collections</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">Collections list & word counts</div>
                </div>
                {isExporting === 'collections' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('review')}
                className="h-16 px-4 border border-border rounded-xl hover:bg-accent transition-colors text-[14px] font-medium flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left">
                  <div className="font-medium text-foreground">Export Review Progress</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">SRS intervals & mastery counts</div>
                </div>
                {isExporting === 'review' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </button>
            </div>

            <div className="pt-3 flex flex-wrap gap-3 border-t border-border/50">
              <button 
                type="button"
                onClick={handleClearCache}
                className="h-9 px-4 border border-border rounded-lg hover:bg-accent transition-colors text-[13px] font-medium cursor-pointer"
              >
                Clear app preferences (cache)
              </button>
              
              <button 
                type="button"
                onClick={() => setShowComingSoon(true)}
                className="h-9 px-4 border border-destructive/20 text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors text-[13px] font-medium cursor-pointer"
              >
                Delete all data
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button onClick={handleSave} className="h-10 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-[14px]">
            Save Changes
          </button>
        </div>
      </div>

      <AlertDialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Coming Soon</AlertDialogTitle>
            <AlertDialogDescription>
              Account resetting and database-wide data deletion are currently coming in a future milestone. 
              <br /><br />
              No database records have been deleted. You can safely continue using the application normally.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowComingSoon(false)} className="cursor-pointer">
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
