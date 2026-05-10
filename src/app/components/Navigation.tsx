import { Book, Home, Upload, RotateCcw, FolderOpen, BarChart3, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navigation({ currentPage, onNavigate, isCollapsed, onToggleCollapse }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'vocabulary', label: 'Vocabulary', icon: Book },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'review', label: 'Review', icon: RotateCcw },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className={`${isCollapsed ? 'w-16' : 'w-56'} border-r border-border bg-sidebar flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-20`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && <h1 className="font-medium text-[15px]">Lexicon</h1>}
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {isCollapsed ? (
            <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <div className="flex-1 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-2.5 transition-colors ${
                isActive
                  ? 'text-sidebar-primary-foreground bg-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
              {!isCollapsed && <span className="text-[14px]">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
