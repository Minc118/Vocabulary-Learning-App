import { Search, Bell, User } from 'lucide-react';

interface TopBarProps {
  isNavCollapsed: boolean;
}

export function TopBar({ isNavCollapsed }: TopBarProps) {
  return (
    <header className={`h-16 border-b border-border bg-card fixed top-0 right-0 ${isNavCollapsed ? 'left-16' : 'left-56'} z-10 transition-all duration-300`}>
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search vocabulary..."
              className="w-full h-9 pl-10 pr-4 bg-input-background border border-border rounded-lg text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
            <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
