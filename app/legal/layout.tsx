import { StaticPageShell } from '@/components/legal/static-page-shell';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <StaticPageShell>{children}</StaticPageShell>;
}
