'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LogoMark } from '@/components/brand/logo';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    api
      .me()
      .then(() => router.replace('/dashboard'))
      .catch(() => router.replace('/login'));
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
      <LogoMark size={40} />
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-accent-trust border-t-transparent" />
    </div>
  );
}