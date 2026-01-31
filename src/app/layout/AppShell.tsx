import React from 'react';
import { env } from '../../lib/env';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Database, AlertTriangle } from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Env Var Check
  if (!env.ok) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-lg border-l-4 border-red-500">
          <h1 className="text-xl font-bold text-red-700 mb-4 flex items-center">
            <AlertTriangle className="mr-2" /> DB NO CONFIGURADA
          </h1>
          <p className="text-gray-700 mb-4">Environment variables are missing:</p>
          <ul className="list-disc pl-5 font-mono text-sm text-red-600 bg-red-50 p-2 rounded">
            {env.missingVars.map(v => <li key={v}>{v}</li>)}
          </ul>
          <p className="mt-4 text-sm text-gray-500">Please configure .env.local file.</p>
        </div>
      </div>
    );
  }

  // 2. Connection Check (Lightweight Query)
  const { isError, error, isLoading } = useQuery({
    queryKey: ['db-health'],
    queryFn: async () => {
      if (!supabase) throw new Error("Client not initialized");
      // Use maybeSingle() to avoid error if table is empty or row 1 doesn't exist yet
      const { data, error } = await supabase.from('event_config').select('id').eq('id', 1).maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-8 rounded-lg shadow-lg border-l-4 border-orange-500">
          <h1 className="text-xl font-bold text-orange-700 mb-4 flex items-center">
            <Database className="mr-2" /> DB CONFIGURADA PERO NO CONECTA
          </h1>
          <p className="text-gray-700 mb-2">Variables are present, but connection failed.</p>
          <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
            {JSON.stringify(error, null, 2)}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};