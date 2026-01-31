import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/query-core';
import { AppRouter } from './app/router';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  );
};

export default App;