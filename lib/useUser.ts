'use client';

/**
 * Kept as a thin re-export so all existing `import { useUser } from
 * '@/lib/useUser'` call sites across the app keep working unchanged. The
 * actual implementation moved to `lib/queries/useAuth.ts` — it now fetches
 * via React Query (so all pages share one cached `/auth/me` request instead
 * of each page firing its own) and mirrors the result into the Redux `auth`
 * slice (so `DashboardShell` and friends can read the user without a prop).
 */
export { useCurrentUser as useUser } from './queries/useAuth';
