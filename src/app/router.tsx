import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers';
import { AppShell } from './layout/AppShell';
import { InviteGate } from '../features/auth/pages/InviteGate';
import { ProfileSetup } from '../features/profile/pages/ProfileSetup';
import { Home } from '../features/home/pages/Home';
import { AdminDashboard } from '../features/admin/pages/AdminDashboard';
import { Debug } from '../pages/Debug';
import { Loader2 } from 'lucide-react';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500"/></div>;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Force profile setup if missing names
  if ((!profile?.first_name || !profile?.last_name) && window.location.hash !== '#/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (profile?.role !== 'ADMIN') return <Navigate to="/" replace />;
  
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <AppShell>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<InviteGate />} />
            <Route path="/debug" element={<Debug />} />
            
            <Route path="/profile-setup" element={
              <ProtectedRoute><ProfileSetup /></ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ProtectedRoute>
            } />

            <Route path="/" element={
              <ProtectedRoute><Home /></ProtectedRoute>
            } />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </AppShell>
  );
};