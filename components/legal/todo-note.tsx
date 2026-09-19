import { Banner } from '@/components/ui/banner';

/** Flags a spot where real company/compliance detail must replace placeholder text before go-live. */
export function TodoNote({ children }: { children: React.ReactNode }) {
  return (
    <Banner tone="warning">
      <span className="font-semibold">TODO — compliance to confirm: </span>
      {children}
    </Banner>
  );
}
