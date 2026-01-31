import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { getProfile } from '../features/profile/api';
import { signInAnonymously } from '../features/auth/api';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async (currentUserId?: string) => {
    const id = currentUserId || user?.id;
    if (!id) return;
    const p = await getProfile(id);
    setProfile(p);
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const client = supabase;

    const initAuth = async () => {
      // 1. Check existing session
      const { data: { session } } = await client.auth.getSession();
      
      let currentUser = session?.user ?? null;

      // 2. If no session, Sign In Anonymously immediately
      if (!currentUser) {
        try {
           const { user: anonUser } = await signInAnonymously();
           currentUser = anonUser;
        } catch (e) {
           console.error("Anon auth failed", e);
        }
      }

      setUser(currentUser);

      // 3. If we have a user, try to get their profile
      if (currentUser) {
        await refreshProfile(currentUser.id);
      }
      
      setIsLoading(false);
    };

    initAuth();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await refreshProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};