'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    api
      .me()
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login'));
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-accent-trust border-t-transparent" />
    </div>
  );
}