import { NavLink } from 'react-router';
import { Book, Home, Upload, RotateCcw, FolderOpen, BarChart3, Settings, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';

interface NavigationProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Navigation({ isCollapsed, onToggleCollapse }: NavigationProps) {
  const navItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: Home },
    { id: 'vocabulary', path: '/vocabulary', label: 'Vocabulary', icon: Book },
    { id: 'import', path: '/import', label: 'Import', icon: Upload },
    { id: 'review', path: '/review', label: 'Review', icon: RotateCcw },
    { id: 'collections', path: '/collections', label: 'Collections', icon: FolderOpen },
    { id: 'statistics', path: '/statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className={`${isCollapsed ? 'w-16' : 'w-56'} border-r border-border bg-sidebar flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-20`}>
      {isCollapsed ? (
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
            title="Expand Sidebar"
          >
            <Sparkles className="w-[18px] h-[18px] text-zinc-800 flex-shrink-0" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <Sparkles className="w-[18px] h-[18px] text-zinc-800 flex-shrink-0" strokeWidth={1.5} />
            <span className="font-semibold text-[14px] tracking-wide text-zinc-900">Voca</span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <div className="flex-1 py-6 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              end={item.path === '/'}
              className={({ isActive }) => 
                `w-full flex items-center gap-3 ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-2.5 transition-colors ${
                  isActive
                    ? 'text-sidebar-primary-foreground bg-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
              {!isCollapsed && <span className="text-[14px]">{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
