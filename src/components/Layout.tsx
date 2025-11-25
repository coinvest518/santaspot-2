// components/Layout.tsx
import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { Navigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import FullScreenLoader from '@/components/ui/FullScreenLoader';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { firebaseUser, userProfile, loading } = useFirebaseUser();
  const { state } = useSidebar();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (requireAuth && (!firebaseUser || !userProfile)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40">
        <AppSidebar />
      </div>
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          state === "expanded" ? "ml-64" : "ml-16",
          "p-6"
        )}
      >
        {children}
      </main>
    </div>
  );
};