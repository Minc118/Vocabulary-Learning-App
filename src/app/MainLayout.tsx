import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router';
import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function MainLayout() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const location = useLocation();
  const { session, loading } = useAuth();

  const handleToggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const isReviewSession = location.pathname.startsWith('/review/session');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="size-full bg-background flex flex-col">
      {!isReviewSession && (
        <>
          <Navigation
            isCollapsed={isNavCollapsed}
            onToggleCollapse={handleToggleNav}
          />
          <TopBar isNavCollapsed={isNavCollapsed} />
        </>
      )}
      <main className={isReviewSession ? '' : `${isNavCollapsed ? 'ml-16' : 'ml-56'} mt-16 transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
}
