import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { StaticPageShell } from '@/components/legal/static-page-shell';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Trust & Safety · JestATP',
  description: 'How JestATP protects your account, your funds pathway, and market integrity.',
};

const sections: LegalSection[] = [
  {
    id: 'principles',
    heading: 'Our principles',
    body: (
      <p>
        JestATP never touches your funds or securities directly — those stay with your broker and depository at
        all times. Our job is to be a trustworthy, predictable layer on top of that: secure by default, honest
        about risk, and quick to intervene when something looks wrong.
      </p>
    ),
  },
  {
    id: 'account-protection',
    heading: 'Protecting your account',
    body: (
      <ul>
        <li>Two-factor authentication, session controls, and login-anomaly alerts — detailed in <a href="/legal/information-security">Information Security Practices</a>.</li>
        <li>Broker API tokens are scoped and revocable, so disconnecting a broker immediately cuts off JestATP&apos;s access.</li>
        <li>Sensitive actions — reconnecting a broker, changing 2FA, large strategy capital changes — require re-authentication.</li>
      </ul>
    ),
  },
  {
    id: 'market-integrity',
    heading: 'Protecting market integrity',
    body: (
      <p>
        We monitor for patterns consistent with spoofing, layering, or other manipulative activity across
        strategies on the platform, and we cooperate with exchanges and SEBI on algo order traceability as
        required under the empanelment framework described in{' '}
        <a href="/legal/regulatory-info">Regulatory &amp; Other Info</a>. Accounts found in breach may be
        suspended per our <a href="/legal/policies-and-procedures">Policies and Procedures</a>.
      </p>
    ),
  },
  {
    id: 'strategy-marketplace',
    heading: 'Strategy marketplace safety',
    body: (
      <p>
        Strategies shared on the marketplace show their backtest history and are labelled with the author&apos;s
        track record, but are not independently audited or endorsed by JestATP as suitable for any particular
        investor. Review the logic and risk parameters before activating a strategy you didn&apos;t write yourself.
      </p>
    ),
  },
  {
    id: 'reporting-concerns',
    heading: 'Reporting a concern',
    body: (
      <ul>
        <li>Security vulnerability → <a href="/security/bug-bounty">Bug Bounty</a></li>
        <li>Suspicious strategy or marketplace listing → <a href="/support">Help &amp; Support</a></li>
        <li>Account or billing dispute → <a href="/legal/investor-charter">Investor Charter and Grievance</a></li>
        <li>Data or privacy concern → <TodoNote>Grievance Officer contact, same as Privacy Policy</TodoNote></li>
      </ul>
    ),
  },
];

export default function TrustAndSafetyPage() {
  return (
    <StaticPageShell>
      <LegalPage
        eyebrow="Trust & Safety"
        title="Trust & Safety"
        lastUpdated="19 September 2026"
        intro={<p>How we protect your account and help keep the markets you trade on fair.</p>}
        sections={sections}
      />
    </StaticPageShell>
  );
}
