import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export interface LegalSection {
  id: string;
  heading: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  eyebrow?: string;
  title: string;
  lastUpdated: string;
  intro?: React.ReactNode;
  sections: LegalSection[];
}

/**
 * Shared shell for every page under /legal, /security/bug-bounty and
 * /trust-and-safety. Renders a title block, a sticky in-page TOC on
 * desktop, and prose-styled sections — all driven off plain data so each
 * page.tsx only has to supply content, not markup.
 */
export function LegalPage({ eyebrow = 'Legal', title, lastUpdated, intro, sections }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to JestATP
      </Link>

      <div className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-trust">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary lg:text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-text-tertiary">Last updated: {lastUpdated}</p>
        {intro ? <div className="mt-5 text-sm leading-relaxed text-text-secondary">{intro}</div> : null}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">On this page</p>
            <ul className="mt-4 flex flex-col gap-2.5 border-l border-border pl-4">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-sm text-text-secondary hover:text-accent-trust">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl [&_a]:text-accent-trust [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-accent-trust-strong [&_strong]:font-medium [&_strong]:text-text-primary">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className={i > 0 ? 'mt-10 scroll-mt-6 border-t border-border pt-10' : 'scroll-mt-6'}>
              <h2 className="text-xl font-semibold tracking-tight text-text-primary">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-3 flex flex-col gap-4 text-sm leading-relaxed text-text-secondary [&_h3]:mt-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text-primary [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
