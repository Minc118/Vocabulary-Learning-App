import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopBarProps {
  isNavCollapsed: boolean;
}

export function TopBar({ isNavCollapsed }: TopBarProps) {
  const { signOut, user } = useAuth();
  
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email;

  return (
    <header className={`h-16 border-b border-border/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 right-0 ${isNavCollapsed ? 'left-16' : 'left-56'} z-10 transition-all duration-300`}>
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search vocabulary..."
              className="w-full h-9 pl-10 pr-4 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-transparent rounded-lg text-[13.5px] placeholder:text-muted-foreground focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors" title="Notifications">
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors" title={fullName || "Profile"}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={fullName || "User Profile"} 
                className="w-6 h-6 rounded-full object-cover border border-border/80"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            )}
          </button>
          
          <div className="w-px h-4 bg-border/80 mx-1"></div>
          <button onClick={signOut} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer" title="Sign Out">
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
