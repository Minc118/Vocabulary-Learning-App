import { User, Bell, Globe, Palette, Database, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from "react-router";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SelectField, type SelectOption } from '../components/ui/SelectField';
import { 
  exportVocabularyData, 
  exportCollectionsData, 
  exportReviewProgressData, 
  exportAllData,
  exportVocabularyCSV 
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

  // Form inputs
  const [nativeLanguage, setNativeLanguage] = useState('Chinese');
  const [displayName, setDisplayName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [dailyGoal, setDailyGoal] = useState('20 cards per day');
  const [theme, setTheme] = useState('Light');

  // Data management states
  const [isExporting, setIsExporting] = useState<'vocabulary' | 'vocabulary_csv' | 'collections' | 'review' | 'all' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('nativeLanguage');
    if (savedLang) {
      setNativeLanguage(savedLang);
    }
    const savedGoal = localStorage.getItem('dailyGoal');
    if (savedGoal) {
      setDailyGoal(savedGoal);
    }
    // Always force 'Light' theme since Dark/Auto are disabled
    setTheme('Light');
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
    localStorage.setItem('dailyGoal', dailyGoal);
    localStorage.setItem('theme', 'Light');
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

  const downloadCSV = (content: string, defaultFilename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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

  const handleExport = async (type: 'vocabulary' | 'vocabulary_csv' | 'collections' | 'review' | 'all') => {
    setIsExporting(type);
    setMessage(null);
    try {
      let filename = '';
      
      if (type === 'vocabulary') {
        const data = await exportVocabularyData();
        filename = 'voca-vocabulary-export-YYYY-MM-DD.json';
        downloadJSON(data, filename);
      } else if (type === 'vocabulary_csv') {
        const csvContent = await exportVocabularyCSV();
        filename = 'voca_words_export_YYYY-MM-DD.csv';
        downloadCSV(csvContent, filename);
      } else if (type === 'collections') {
        const data = await exportCollectionsData();
        filename = 'voca-collections-export-YYYY-MM-DD.json';
        downloadJSON(data, filename);
      } else if (type === 'review') {
        const data = await exportReviewProgressData();
        filename = 'voca-review-export-YYYY-MM-DD.json';
        downloadJSON(data, filename);
      } else if (type === 'all') {
        const data = await exportAllData();
        filename = 'voca-full-export-YYYY-MM-DD.json';
        downloadJSON(data, filename);
      }
      
      setMessage({ type: 'success', text: `Successfully exported ${type === 'vocabulary_csv' ? 'vocabulary (CSV)' : type} data!` });
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
    localStorage.removeItem('dailyGoal');
    localStorage.removeItem('theme');
    setNativeLanguage('Chinese');
    setDailyGoal('20 cards per day');
    setTheme('Light');
    setMessage({ type: 'success', text: 'App preferences cleared successfully!' });
  };

  // Dropdown options
  const languageOptions: SelectOption[] = [
    { value: 'Chinese', label: 'Chinese (中文)' },
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Japanese', label: 'Japanese' }
  ];

  const goalOptions: SelectOption[] = [
    { value: '10 cards per day', label: '10 cards per day' },
    { value: '20 cards per day', label: '20 cards per day' },
    { value: '30 cards per day', label: '30 cards per day' },
    { value: '50 cards per day', label: '50 cards per day' }
  ];

  const themeOptions: SelectOption[] = [
    { value: 'Light', label: 'Light (Active)' },
    { value: 'Dark', label: 'Dark Mode', disabled: true, comingSoon: true },
    { value: 'Auto', label: 'System Auto', disabled: true, comingSoon: true }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 bg-[#f8fafb] animate-in fade-in-50 duration-200 text-[#191c1d] pb-24 min-h-screen">
      {/* Header Panel */}
      <div className="shrink-0 border-b border-[#c2c7cc]/50 pb-5">
        <div className="text-[#42474b] font-bold tracking-wider text-[10px] uppercase select-none">
          User Preferences
        </div>
        <h1 className="text-[26px] font-extrabold tracking-tight text-[#191c1d] leading-none mt-1">Settings</h1>
        <p className="text-[13.5px] text-[#42474b] font-semibold mt-2">Manage your account, preferences, and local data settings.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile */}
        <div className="bg-white border border-[#c2c7cc]/60 rounded-3xl shadow-sm">
          <div className="px-5 py-4 border-b border-[#c2c7cc]/40 flex items-center gap-3 select-none rounded-t-[22px] bg-[#f8fafb]/30">
            <User className="w-4 h-4 text-[#42474b]" strokeWidth={1.5} />
            <h2 className="font-bold text-[14px] text-[#191c1d]">Profile</h2>
          </div>
          <div className="p-6 space-y-5 bg-white rounded-b-3xl">
            <div>
              <label className="block text-[11.5px] font-bold text-[#42474b] uppercase tracking-wider mb-2 select-none">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isOAuth}
                className="w-full h-10 px-3.5 bg-[#f2f4f5] border border-transparent focus:border-[#002434]/30 rounded-xl text-[13.5px] font-semibold text-[#191c1d] focus:outline-none focus:bg-white transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              />
              {isOAuth && (
                <p className="text-[11px] text-[#42474b] font-medium mt-1.5">Managed automatically by Google Account</p>
              )}
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#42474b] uppercase tracking-wider mb-2 select-none">Email</label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                disabled={isOAuth}
                className="w-full h-10 px-3.5 bg-[#f2f4f5] border border-transparent focus:border-[#002434]/30 rounded-xl text-[13.5px] font-semibold text-[#191c1d] focus:outline-none focus:bg-white transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
              />
              {isOAuth && (
                <p className="text-[11px] text-[#42474b] font-medium mt-1.5">Managed automatically by Google Account</p>
              )}
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white border border-[#c2c7cc]/60 rounded-3xl shadow-sm">
          <div className="px-5 py-4 border-b border-[#c2c7cc]/40 flex items-center gap-3 select-none rounded-t-[22px] bg-[#f8fafb]/30">
            <Globe className="w-4 h-4 text-[#42474b]" strokeWidth={1.5} />
            <h2 className="font-bold text-[14px] text-[#191c1d]">Learning Preferences</h2>
          </div>
          <div className="p-6 space-y-6 bg-white rounded-b-3xl">
            <SelectField
              value={nativeLanguage}
              onChange={setNativeLanguage}
              options={languageOptions}
              label="Native Translation Language"
            />
            <p className="text-[12px] text-[#42474b] font-medium -mt-4">AI will translate words and sentences into this language.</p>

            <SelectField
              value={dailyGoal}
              onChange={setDailyGoal}
              options={goalOptions}
              label="Daily Review Goal"
            />

            <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 cursor-pointer select-none">
              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-[#191c1d] leading-tight">Show word context in reviews</div>
                <div className="text-[13px] text-[#42474b] font-semibold leading-normal">Display example sentences during review sessions</div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </label>

            <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 cursor-pointer select-none">
              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-[#191c1d] leading-tight">Auto-generate AI content</div>
                <div className="text-[13px] text-[#42474b] font-semibold leading-normal">Automatically add definitions when creating words</div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-[#c2c7cc]/60 rounded-3xl shadow-sm">
          <div className="px-5 py-4 border-b border-[#c2c7cc]/40 flex items-center gap-3 select-none rounded-t-[22px] bg-[#f8fafb]/30">
            <Bell className="w-4 h-4 text-[#42474b]" strokeWidth={1.5} />
            <h2 className="font-bold text-[14px] text-[#191c1d]">Notifications</h2>
          </div>
          <div className="p-6 space-y-5 bg-white rounded-b-3xl">
            <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 cursor-pointer select-none">
              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-[#191c1d] leading-tight">Daily review reminders</div>
                <div className="text-[13px] text-[#42474b] font-semibold leading-normal">Get notified when reviews are due</div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </label>

            <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 cursor-pointer select-none">
              <div className="space-y-0.5">
                <div className="text-[14px] font-bold text-[#191c1d] leading-tight">Weekly progress summary</div>
                <div className="text-[13px] text-[#42474b] font-semibold leading-normal">Receive weekly learning statistics</div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative inline-flex items-center">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="relative w-11 h-6 bg-muted peer-focus:ring-2 peer-focus:ring-ring/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white border border-[#c2c7cc]/60 rounded-3xl shadow-sm">
          <div className="px-5 py-4 border-b border-[#c2c7cc]/40 flex items-center gap-3 select-none rounded-t-[22px] bg-[#f8fafb]/30">
            <Palette className="w-4 h-4 text-[#42474b]" strokeWidth={1.5} />
            <h2 className="font-bold text-[14px] text-[#191c1d]">Appearance</h2>
          </div>
          <div className="p-6 space-y-5 bg-white rounded-b-3xl">
            <SelectField
              value={theme}
              onChange={setTheme}
              options={themeOptions}
              label="Theme"
            />
          </div>
        </div>

        {/* Data */}
        <div className="bg-white border border-[#c2c7cc]/60 rounded-3xl shadow-sm">
          <div className="px-5 py-4 border-b border-[#c2c7cc]/40 flex items-center gap-3 select-none rounded-t-[22px] bg-[#f8fafb]/30">
            <Database className="w-4.5 h-4.5 text-[#42474b]" strokeWidth={1.5} />
            <h2 className="font-bold text-[14px] text-[#191c1d]">Data Management</h2>
          </div>
          <div className="p-6 space-y-5 bg-white rounded-b-3xl">
            {message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
                  : 'bg-destructive/5 border-destructive/10 text-destructive'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-destructive" />
                )}
                <div className="text-[13px] font-semibold leading-relaxed">{message.text}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('all')}
                className="min-h-[64px] h-auto py-3 px-4 border border-[#c2c7cc]/60 hover:border-[#002434]/40 rounded-2xl hover:bg-[#eceeef]/30 transition-colors text-[13.5px] font-bold text-[#191c1d] flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left pr-2">
                  <div className="font-bold text-[#191c1d]">Export All Data</div>
                  <div className="text-[11.5px] text-[#42474b] font-semibold mt-0.5 leading-normal">Vocabulary & Collections bundle</div>
                </div>
                {isExporting === 'all' && <Loader2 className="w-4 h-4 animate-spin text-[#002434] flex-shrink-0" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('vocabulary')}
                className="min-h-[64px] h-auto py-3 px-4 border border-[#c2c7cc]/60 hover:border-[#002434]/40 rounded-2xl hover:bg-[#eceeef]/30 transition-colors text-[13.5px] font-bold text-[#191c1d] flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left pr-2">
                  <div className="font-bold text-[#191c1d]">Export Vocabulary</div>
                  <div className="text-[11.5px] text-[#42474b] font-semibold mt-0.5 leading-normal">Complete words list & relations</div>
                </div>
                {isExporting === 'vocabulary' && <Loader2 className="w-4 h-4 animate-spin text-[#002434] flex-shrink-0" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('vocabulary_csv')}
                className="min-h-[64px] h-auto py-3 px-4 border border-[#c2c7cc]/60 hover:border-[#002434]/40 rounded-2xl hover:bg-[#eceeef]/30 transition-colors text-[13.5px] font-bold text-[#191c1d] flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left pr-2">
                  <div className="font-bold text-[#191c1d]">Export Vocabulary (CSV)</div>
                  <div className="text-[11.5px] text-[#42474b] font-semibold mt-0.5 leading-normal">CSV spreadsheet for Excel/Sheets</div>
                </div>
                {isExporting === 'vocabulary_csv' && <Loader2 className="w-4 h-4 animate-spin text-[#002434] flex-shrink-0" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('collections')}
                className="min-h-[64px] h-auto py-3 px-4 border border-[#c2c7cc]/60 hover:border-[#002434]/40 rounded-2xl hover:bg-[#eceeef]/30 transition-colors text-[13.5px] font-bold text-[#191c1d] flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left pr-2">
                  <div className="font-bold text-[#191c1d]">Export Collections</div>
                  <div className="text-[11.5px] text-[#42474b] font-semibold mt-0.5 leading-normal">Collections list & word counts</div>
                </div>
                {isExporting === 'collections' && <Loader2 className="w-4 h-4 animate-spin text-[#002434] flex-shrink-0" />}
              </button>

              <button 
                type="button"
                disabled={isExporting !== null}
                onClick={() => handleExport('review')}
                className="min-h-[64px] h-auto py-3 px-4 border border-[#c2c7cc]/60 hover:border-[#002434]/40 rounded-2xl hover:bg-[#eceeef]/30 transition-colors text-[13.5px] font-bold text-[#191c1d] flex items-center justify-between cursor-pointer disabled:opacity-50"
              >
                <div className="text-left pr-2">
                  <div className="font-bold text-[#191c1d]">Export Review Progress</div>
                  <div className="text-[11.5px] text-[#42474b] font-semibold mt-0.5 leading-normal">SRS intervals & mastery counts</div>
                </div>
                {isExporting === 'review' && <Loader2 className="w-4 h-4 animate-spin text-[#002434] flex-shrink-0" />}
              </button>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3 border-t border-[#c2c7cc]/30">
              <button 
                type="button"
                onClick={handleClearCache}
                className="w-full sm:w-auto min-h-[36px] py-2 px-4 border border-[#c2c7cc]/60 hover:border-[#002434]/40 hover:bg-[#eceeef]/40 rounded-xl transition-colors text-[13px] font-bold text-[#002434] cursor-pointer"
              >
                Clear app preferences (cache)
              </button>
              
              <button 
                type="button"
                onClick={() => setShowComingSoon(true)}
                className="w-full sm:w-auto min-h-[36px] py-2 px-4 border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl transition-colors text-[13px] cursor-pointer"
              >
                Delete all data
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto h-10 px-6 bg-[#f2f4f5] border border-[#002434]/40 hover:bg-[#eceeef] hover:border-[#002434]/60 text-[#002434] rounded-xl transition-all font-bold text-[13px] cursor-pointer shadow-sm active:scale-95 select-none"
          >
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
