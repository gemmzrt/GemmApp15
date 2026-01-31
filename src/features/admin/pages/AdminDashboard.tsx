import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabaseClient';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Invite, Segment, Profile, RSVP, TableAssignment } from '../../../types';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'INVITES' | 'TABLES'>('INVITES');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={() => window.location.href = '#/'}>Back Home</Button>
      </header>
      
      <div className="flex gap-2 mb-6">
        <Button variant={activeTab === 'INVITES' ? 'primary' : 'outline'} onClick={() => setActiveTab('INVITES')}>Invites</Button>
        <Button variant={activeTab === 'TABLES' ? 'primary' : 'outline'} onClick={() => setActiveTab('TABLES')}>Tables</Button>
      </div>

      {activeTab === 'INVITES' ? <InvitesManager /> : <TableManager />}
    </div>
  );
};

const InvitesManager = () => {
  const queryClient = useQueryClient();
  const [newCode, setNewCode] = useState('');
  const [segment, setSegment] = useState<Segment>('YOUNG');

  const { data: invites, isLoading } = useQuery({
    queryKey: ['admin-invites'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false });
      return data as Invite[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error("DB Disconnected");
      const { error } = await supabase.from('invites').insert({
        code: newCode,
        segment: segment,
        enabled: true,
        is_used: false
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewCode('');
      queryClient.invalidateQueries({ queryKey: ['admin-invites'] });
      toast.success("Invite created");
    },
    onError: (err: Error) => toast.error(err.message)
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h3 className="font-bold">Create Invite</h3>
        <div className="flex gap-4">
          <Input 
            placeholder="Code (e.g. FRIEND-1)" 
            value={newCode} 
            onChange={e => setNewCode(e.target.value)} 
          />
          <select 
            className="border rounded px-3 py-2" 
            value={segment} 
            onChange={e => setSegment(e.target.value as Segment)}
          >
            <option value="YOUNG">Young</option>
            <option value="ADULT">Adult</option>
          </select>
          <Button onClick={() => createMutation.mutate()} isLoading={createMutation.isPending}>Add</Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Code</th>
              <th className="p-2">Segment</th>
              <th className="p-2">Status</th>
              <th className="p-2">Used By</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-4 text-center"><Loader2 className="animate-spin inline"/></td></tr>}
            {invites?.map(inv => (
              <tr key={inv.code} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-2 font-mono font-bold">{inv.code}</td>
                <td className="p-2">{inv.segment}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs ${inv.is_used ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {inv.is_used ? 'USED' : 'OPEN'}
                  </span>
                </td>
                <td className="p-2 text-xs text-gray-500">{inv.used_by || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableManager = () => {
  const queryClient = useQueryClient();
  const [assignLabel, setAssignLabel] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  type UserRow = Profile & { rsvps: RSVP | null, table_assignments: TableAssignment | null };

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!supabase) return [];
      // Manual join because supabase types in generic client can be tricky with deeply nested joins
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: rsvps } = await supabase.from('rsvps').select('*');
      const { data: tables } = await supabase.from('table_assignments').select('*');

      if (!profiles) return [];

      return profiles.map((p: any) => ({
        ...p,
        rsvps: rsvps?.find((r: any) => r.user_id === p.user_id) || null,
        table_assignments: tables?.find((t: any) => t.user_id === p.user_id) || null
      })) as UserRow[];
    }
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if(!selectedUser || !supabase) return;
      const { error } = await supabase.from('table_assignments').upsert({
        user_id: selectedUser,
        table_label: assignLabel
      });
      if(error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
      setAssignLabel('');
      toast.success("Table assigned");
    },
    onError: (err: Error) => toast.error(err.message)
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <h3 className="font-bold mb-4">Confirmed Guests</h3>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Segment</th>
            <th className="p-2">RSVP</th>
            <th className="p-2">Table</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
           {isLoading && <tr><td colSpan={5} className="p-4 text-center"><Loader2 className="animate-spin inline"/></td></tr>}
           {users?.filter(u => u.rsvps?.status === 'CONFIRMED').map(user => (
             <tr key={user.user_id} className="border-b">
               <td className="p-2">{user.first_name} {user.last_name}</td>
               <td className="p-2">{user.segment}</td>
               <td className="p-2 text-green-600 font-bold">YES</td>
               <td className="p-2 font-mono text-lg">{user.table_assignments?.table_label || '-'}</td>
               <td className="p-2 flex gap-2">
                 {selectedUser === user.user_id ? (
                   <div className="flex gap-2">
                     <Input 
                       className="w-20" 
                       placeholder="#" 
                       value={assignLabel} 
                       onChange={e => setAssignLabel(e.target.value)}
                       autoFocus
                     />
                     <Button size="sm" onClick={() => assignMutation.mutate()}>OK</Button>
                     <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>X</Button>
                   </div>
                 ) : (
                   <Button variant="outline" onClick={() => setSelectedUser(user.user_id)}>Assign</Button>
                 )}
               </td>
             </tr>
           ))}
        </tbody>
      </table>
    </div>
  );
};