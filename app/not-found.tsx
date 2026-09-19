'use client';

import { useRouter } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { RedirectPanel } from '@/components/status/redirect-panel';

export default function NotFound() {
  const router = useRouter();

  return (
    <RedirectPanel
      code="404"
      icon={SearchX}
      title="Page not found"
      description="That link doesn't lead anywhere — it may be mistyped or the page has moved. Nothing in your account or open positions is affected."
      primaryLabel="Go to dashboard"
      primaryHref="/dashboard"
      secondary={{ label: 'Go back', onClick: () => router.back() }}
    />
  );
}
