import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { StaticPageShell } from '@/components/legal/static-page-shell';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Bug Bounty · JestATP',
  description: 'Report a security vulnerability responsibly and see what\u2019s in and out of scope.',
};

const sections: LegalSection[] = [
  {
    id: 'how-to-report',
    heading: 'How to report',
    body: (
      <p>
        Email <TodoNote>security contact email, e.g. security@jestatp.com</TodoNote> with a clear description,
        steps to reproduce, and impact. Include a proof of concept where possible, and avoid accessing data beyond
        what&apos;s needed to demonstrate the issue. We acknowledge reports within{' '}
        <TodoNote>confirm acknowledgement SLA, e.g. 48 hours</TodoNote>.
      </p>
    ),
  },
  {
    id: 'in-scope',
    heading: 'In scope',
    body: (
      <ul>
        <li>The JestATP web app and public API endpoints.</li>
        <li>Authentication, session, and 2FA flows.</li>
        <li>Broker-connection authorisation flows (OAuth, token handling).</li>
        <li>Strategy sandbox isolation (breaking out of the sandbox, accessing other users&apos; strategy runs).</li>
      </ul>
    ),
  },
  {
    id: 'out-of-scope',
    heading: 'Out of scope',
    body: (
      <ul>
        <li>Social engineering, phishing, or physical attacks against staff or offices.</li>
        <li>Denial-of-service testing against production infrastructure.</li>
        <li>Vulnerabilities in your broker&apos;s own systems — report those directly to the broker.</li>
        <li>Findings that require a jailbroken/rooted device or an already-compromised account.</li>
        <li>Reports generated purely from automated scanners without a demonstrated, working exploit.</li>
      </ul>
    ),
  },
  {
    id: 'safe-harbor',
    heading: 'Safe harbor',
    body: (
      <p>
        We will not pursue legal action against good-faith security research that follows this policy — testing
        only against your own account/test data, avoiding data destruction or service disruption, and reporting
        privately before any public disclosure.
      </p>
    ),
  },
  {
    id: 'rewards',
    heading: 'Rewards',
    body: (
      <p>
        Reward amounts depend on severity and are decided case by case:{' '}
        <TodoNote>confirm whether a paid bounty program exists, and if so the reward bands per severity
        tier</TodoNote>. Even without a monetary reward, we credit researchers (with permission) once a fix ships.
      </p>
    ),
  },
  {
    id: 'disclosure-timeline',
    heading: 'Disclosure timeline',
    body: (
      <p>
        We ask for 90 days from report to public disclosure to investigate and ship a fix, and will keep you
        updated on progress. If a fix ships sooner, we&apos;re happy to coordinate an earlier disclosure date with
        you.
      </p>
    ),
  },
];

export default function BugBountyPage() {
  return (
    <StaticPageShell>
      <LegalPage
        eyebrow="Security"
        title="Bug Bounty"
        lastUpdated="19 September 2026"
        intro={<p>Help us keep JestATP secure — here&apos;s how to report a vulnerability and what to expect.</p>}
        sections={sections}
      />
    </StaticPageShell>
  );
}
