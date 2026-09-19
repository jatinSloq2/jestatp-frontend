'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { RedirectPanel } from '@/components/status/redirect-panel';
import './globals.css';

/**
 * Catches errors thrown by the root layout itself (very rare — normal page
 * and API errors are caught by app/error.tsx instead). Next.js requires
 * this boundary to render its own <html>/<body>, since the root layout
 * that would normally provide them is what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled global error:', error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="h-full font-sans antialiased">
        <RedirectPanel
          code={error.digest ? `Error · ${error.digest}` : undefined}
          icon={TriangleAlert}
          tone="critical"
          title="Something went wrong"
          description="An unexpected error stopped the app from loading. Your account and any open positions are unaffected — try again, or head to your dashboard."
          primaryLabel="Go to dashboard"
          primaryHref="/dashboard"
          secondary={{ label: 'Try again', onClick: reset }}
        />
      </body>
    </html>
  );
}
