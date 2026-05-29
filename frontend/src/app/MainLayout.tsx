import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router';
import { Navigation } from './components/Navigation';
import { TopBar } from './components/TopBar';
import { useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function MainLayout() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const { session, loading } = useAuth();

  const handleToggleNav = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const handleToggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  // Auto-close mobile drawer when location/pathname changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

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
            isMobileOpen={isMobileNavOpen}
            onCloseMobile={() => setIsMobileNavOpen(false)}
          />
          <TopBar
            isNavCollapsed={isNavCollapsed}
            onToggleMobileMenu={handleToggleMobileNav}
          />
        </>
      )}
      <main className={isReviewSession ? '' : `mt-16 transition-all duration-300 ml-0 ${isNavCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        <Outlet />
      </main>
    </div>
  );
}
