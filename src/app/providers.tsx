import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { getProfile } from '../features/profile/api';
import { claimInviteCode } from '../features/auth/api';
import toast from 'react-hot-toast';

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

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Attempt to claim invite code if pending
        const pendingCode = sessionStorage.getItem('pending_invite_code');
        if (pendingCode) {
            try {
                await claimInviteCode(pendingCode);
                toast.success("Invite code applied!");
            } catch (error: any) {
                // Ignore specific error if already used, otherwise notify
                if (!error.message.includes('already_used')) {
                   toast.error(`Invite claim failed: ${error.message}`);
                }
            } finally {
                sessionStorage.removeItem('pending_invite_code');
            }
        }
        await refreshProfile(session.user.id);
      }
      setIsLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
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