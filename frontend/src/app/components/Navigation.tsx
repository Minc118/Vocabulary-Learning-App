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
    <nav className={`${isCollapsed ? 'w-16' : 'w-56'} border-r border-sidebar-border bg-sidebar flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-20`}>
      {isCollapsed ? (
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border/30">
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            title="Expand Sidebar"
          >
            <Sparkles className="w-[18px] h-[18px] text-teal-400 flex-shrink-0 animate-pulse" strokeWidth={1.5} />
          </button>
        </div>
      ) : (
        <div className="h-16 flex items-center justify-between px-5 border-b border-sidebar-border/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[15px] tracking-wide text-white leading-none">Voca</span>
              <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase mt-0.5">Learn Smarter</span>
            </div>
          </div>
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>
      )}

      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              end={item.path === '/'}
              className={({ isActive }) => 
                `flex items-center gap-3 py-2 ${isCollapsed ? 'justify-center mx-2 px-0' : 'px-3 mx-3'} my-0.5 rounded-lg transition-all text-[14px] ${
                  isActive
                    ? 'text-sidebar-primary-foreground bg-sidebar-primary font-medium shadow-md shadow-black/10'
                    : 'text-sidebar-foreground hover:bg-white/5 hover:text-white'
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
