'use client';

import { ReactNode, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '@/lib/store/store';
import { queryClient } from '@/lib/queryClient';

export function Providers({ children }: { children: ReactNode }) {
  // useState (not a module-level constant) so the QueryClient survives Fast
  // Refresh in dev but is still created exactly once per app instance.
  const [client] = useState(() => queryClient);

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={client}>
        {children}
        {process.env.NODE_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
