import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'SMART ODR · JestATP',
  description: 'How to resolve an unresolved grievance using SEBI\u2019s SMART ODR portal.',
};

const sections: LegalSection[] = [
  {
    id: 'what-is-odr',
    heading: 'What SMART ODR is',
    body: (
      <p>
        SMART ODR — Securities Market Approach for Resolution through ODR — is SEBI&apos;s common online dispute
        resolution portal for the Indian securities market. It combines online conciliation and arbitration to
        resolve disputes between investors and market participants, including intermediaries and technology
        providers empanelled with an exchange.
      </p>
    ),
  },
  {
    id: 'escalation-path',
    heading: 'Escalation path',
    body: (
      <ol>
        <li>
          <strong>Step 1 — Raise it with us.</strong> Submit your complaint via{' '}
          <a href="/support">Help &amp; Support</a> or email <TodoNote>support/grievance email address</TodoNote>.
          We aim to acknowledge and resolve complaints within the timelines in our{' '}
          <a href="/legal/policies-and-procedures">Policies and Procedures</a>.
        </li>
        <li>
          <strong>Step 2 — SEBI SCORES.</strong> If unresolved, escalate through SEBI&apos;s SCORES portal at{' '}
          <a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer">scores.sebi.gov.in</a>.
        </li>
        <li>
          <strong>Step 3 — SMART ODR.</strong> If still unresolved after SCORES, or if the limitation period for
          direct escalation applies, you can initiate conciliation/arbitration at{' '}
          <a href="https://smartodr.in/login" target="_blank" rel="noreferrer">smartodr.in/login</a>.
        </li>
      </ol>
    ),
  },
  {
    id: 'what-you-need',
    heading: 'What you&apos;ll need',
    body: (
      <ul>
        <li>Your JestATP account details and, if relevant, connected broker and order/strategy IDs.</li>
        <li>A summary of the complaint and any prior correspondence with us or through SCORES.</li>
        <li>Supporting screenshots or exports (e.g. order book, strategy logs) — you can export these from Settings.</li>
      </ul>
    ),
  },
  {
    id: 'timelines',
    heading: 'Timelines',
    body: (
      <p>
        SCORES and SMART ODR operate on SEBI-prescribed timelines that are outside JestATP&apos;s control; refer to
        the portals above for current turnaround times. We will cooperate promptly with any information request
        raised through either mechanism.
      </p>
    ),
  },
];

export default function SmartOdrPage() {
  return (
    <LegalPage
      title="SMART ODR"
      lastUpdated="19 September 2026"
      intro={<p>If a complaint with us remains unresolved, SEBI provides a structured escalation path — here&apos;s how to use it.</p>}
      sections={sections}
    />
  );
}
