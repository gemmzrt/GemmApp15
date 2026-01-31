import React from 'react';
import { env } from '../lib/env';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { formatEventDate, getEventTimes } from '../lib/time';

export const Debug: React.FC = () => {
  const times = getEventTimes();

  const { data, error, isLoading } = useQuery({
    queryKey: ['debug-event'],
    queryFn: async () => {
      if(!supabase) return null;
      const { data } = await supabase.from('event_config').select('*').single();
      return data;
    },
    enabled: env.ok
  });

  return (
    <div className="p-8 font-mono text-sm space-y-4">
      <h1 className="text-xl font-bold">Debug Info</h1>
      
      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-bold">Env Vars</h2>
        <pre>{JSON.stringify(env, null, 2)}</pre>
      </div>

      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-bold">DB Connection</h2>
        {isLoading && "Testing..."}
        {data && <span className="text-green-600">CONNECTED: {JSON.stringify(data)}</span>}
        {error && <span className="text-red-600">ERROR: {JSON.stringify(error)}</span>}
      </div>

      <div className="border p-4 rounded bg-gray-50">
        <h2 className="font-bold">Time Logic</h2>
        <p>Young Start: {formatEventDate(times.youngStart)}</p>
        <p>Adult Start: {formatEventDate(times.adultStart)}</p>
        <p>End: {formatEventDate(times.endEvent)}</p>
      </div>

      <a href="#/" className="text-blue-500 underline">Back to App</a>
    </div>
  );
};