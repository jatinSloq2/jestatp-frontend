'use client';

import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { RedirectPanel } from '@/components/status/redirect-panel';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real error (and Next's request digest, if any) for debugging.
    console.error('Unhandled error boundary:', error);
  }, [error]);

  return (
    <RedirectPanel
      code={error.digest ? `Error · ${error.digest}` : undefined}
      icon={TriangleAlert}
      tone="critical"
      title="Something went wrong"
      description="An unexpected error interrupted this page. Your account and any open positions are unaffected — try again, or head to your dashboard."
      primaryLabel="Go to dashboard"
      primaryHref="/dashboard"
      secondary={{ label: 'Try again', onClick: reset }}
    />
  );
}
