import React from 'react';
import { useAuth } from '../../../app/providers';
import { CountdownCard } from '../components/CountdownCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/Button';
import { RSVPStatus, TableAssignment } from '../../../types';
import toast from 'react-hot-toast';
import { signOut } from '../../auth/api';
import { MapPin, Utensils } from 'lucide-react';

export const Home: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch RSVP
  const { data: rsvp } = useQuery({
    queryKey: ['rsvp', profile?.user_id],
    queryFn: async () => {
      if (!supabase || !profile) return null;
      const { data } = await supabase.from('rsvps').select('*').eq('user_id', profile.user_id).single();
      return data as { status: RSVPStatus } | null;
    },
    enabled: !!profile,
  });

  // Fetch Table
  const { data: table } = useQuery({
    queryKey: ['table', profile?.user_id],
    queryFn: async () => {
      if (!supabase || !profile) return null;
      const { data } = await supabase.from('table_assignments').select('*').eq('user_id', profile.user_id).single();
      return data as TableAssignment | null;
    },
    enabled: !!profile,
  });

  // Mutation RSVP
  const rsvpMutation = useMutation({
    mutationFn: async (status: RSVPStatus) => {
      if (!supabase || !profile) return;
      await supabase.from('rsvps').upsert({ user_id: profile.user_id, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rsvp'] });
      toast.success("RSVP Updated");
    }
  });

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl text-gray-800">Hi, {profile.first_name}!</h1>
          <Button variant="ghost" onClick={() => signOut()} className="text-sm">Sign Out</Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        
        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          
          {/* Countdown */}
          <CountdownCard segment={profile.segment} />

          {/* RSVP Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm col-span-2 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">RSVP Status</h3>
            <div className="flex gap-2">
              <Button 
                variant={rsvp?.status === 'CONFIRMED' ? 'primary' : 'outline'}
                onClick={() => rsvpMutation.mutate('CONFIRMED')}
                className="flex-1"
                disabled={rsvpMutation.isPending}
              >
                Confirm
              </Button>
              <Button 
                variant={rsvp?.status === 'DECLINED' ? 'secondary' : 'outline'}
                onClick={() => rsvpMutation.mutate('DECLINED')}
                className="flex-1"
                disabled={rsvpMutation.isPending}
              >
                Decline
              </Button>
            </div>
            {rsvp?.status === 'PENDING' && <p className="text-xs text-orange-500 mt-2 text-center">Please confirm your attendance.</p>}
          </div>

          {/* Table Assignment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm col-span-2 md:col-span-1 border border-gray-100 flex flex-col items-center justify-center text-center">
            <div className="bg-gray-100 p-3 rounded-full mb-3">
              <Utensils className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-gray-500 text-xs uppercase mb-1">Your Table</h3>
            {table ? (
              <span className="text-3xl font-bold text-brand-600">#{table.table_label}</span>
            ) : (
              <span className="text-sm text-gray-400 italic">Not assigned yet</span>
            )}
          </div>

          {/* Location */}
          <a 
            href="https://maps.google.com" 
            target="_blank" 
            rel="noreferrer"
            className="bg-indigo-50 rounded-2xl p-6 shadow-sm col-span-2 md:col-span-2 flex items-center gap-4 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <div className="bg-white p-3 rounded-full shadow-sm">
              <MapPin className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-indigo-900">Event Location</h3>
              <p className="text-sm text-indigo-700">Tap to open Maps</p>
            </div>
          </a>

        </div>

        {profile.role === 'ADMIN' && (
           <div className="mt-8 p-4 bg-gray-200 rounded-lg text-center">
             <p className="mb-2 font-bold">Admin Area</p>
             <Button onClick={() => window.location.href = '#/admin'}>Go to Dashboard</Button>
           </div>
        )}
      </main>
    </div>
  );
};