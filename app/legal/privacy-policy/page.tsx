import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Privacy Policy · JestATP',
  description: 'How JestATP collects, uses, and protects your personal data.',
};

const sections: LegalSection[] = [
  {
    id: 'scope',
    heading: 'Scope',
    body: (
      <p>
        This Policy explains how JestATP collects, uses, shares, and protects personal data when you use our
        website, app, and APIs. It covers data collected directly from you, from your connected broker(s), and
        automatically as you use the platform. It does not cover payment data, which is addressed separately in
        our <a href="/legal/payments-privacy-policy">Privacy Policy (Payments)</a>.
      </p>
    ),
  },
  {
    id: 'data-we-collect',
    heading: 'Data we collect',
    body: (
      <>
        <p>
          <strong>Account &amp; KYC data:</strong> name, email, phone, PAN, and any documents you submit during
          signup or broker linking.
        </p>
        <p>
          <strong>Broker data, via the API connection you authorise:</strong> holdings, positions, order history,
          funds/margin, and trade confirmations. We do not receive your broker login password — authentication
          happens through your broker&apos;s own OAuth login flow.
        </p>
        <p>
          <strong>Strategy &amp; usage data:</strong> strategies you build or import, backtest configurations and
          results, alerts, and in-app activity logs.
        </p>
        <p>
          <strong>Device &amp; technical data:</strong> IP address, browser/device identifiers, and log data
          collected automatically for security and diagnostics.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    heading: 'How we use your data',
    body: (
      <ul>
        <li>To operate your account, execute the orders your strategies generate, and show your positions, P&amp;L, and order book.</li>
        <li>To verify identity and complete KYC in line with our broker partners&apos; and SEBI&apos;s requirements.</li>
        <li>To secure the platform — fraud detection, abuse prevention, and audit logging of order-related actions.</li>
        <li>To send service notices (execution alerts, security notices, policy changes) and, with your consent, product updates.</li>
        <li>To meet legal, tax, and regulatory record-keeping obligations, including exchange-mandated algo order tagging.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    heading: 'Who we share data with',
    body: (
      <>
        <p>
          We share data with your connected broker (to place and manage orders on your behalf), the stock
          exchange(s) as required for algo order tagging and empanelment traceability, and infrastructure vendors
          who process data on our behalf under contract (cloud hosting, SMS/email delivery, error monitoring).
        </p>
        <p>
          We do not sell your personal data. We disclose data to regulators, law enforcement, or courts where
          legally required, and in connection with a merger, acquisition, or asset sale, subject to equivalent
          protections.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    heading: 'Retention',
    body: (
      <p>
        We retain trading-related records (orders, KYC, communications) for the period mandated by SEBI and
        exchange record-keeping rules — currently a minimum of{' '}
        <TodoNote>confirm current SEBI-mandated retention period applicable to your registration category</TodoNote>{' '}
        from the date of the record. Account data is retained while your account is active and for a reasonable
        period after closure to meet legal obligations and resolve disputes.
      </p>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your choices and rights',
    body: (
      <ul>
        <li>Access and download your account, strategy, and order data from Settings.</li>
        <li>Correct inaccurate profile information at any time.</li>
        <li>Disconnect a broker to stop further data sync from that broker.</li>
        <li>Request deletion of your account, subject to records we must retain for regulatory reasons.</li>
        <li>Opt out of marketing communications while continuing to receive essential service notices.</li>
      </ul>
    ),
  },
  {
    id: 'security',
    heading: 'Security',
    body: (
      <p>
        Broker API credentials are encrypted at rest, access to production data is role-restricted and logged, and
        data in transit is protected with TLS. See{' '}
        <a href="/legal/information-security">Information Security Practices</a> for more detail, and{' '}
        <a href="/security/bug-bounty">Bug Bounty</a> if you&apos;d like to report a vulnerability.
      </p>
    ),
  },
  {
    id: 'international',
    heading: 'Where your data is stored',
    body: (
      <p>
        Your data is processed and stored primarily in <TodoNote>confirm hosting region(s), e.g. India (ap-south-1)
        </TodoNote>. Where a sub-processor operates outside India, we require contractual safeguards equivalent to
        those in this Policy.
      </p>
    ),
  },
  {
    id: 'contact-grievance',
    heading: 'Grievance officer',
    body: (
      <p>
        For privacy queries or complaints, contact our Grievance Officer:{' '}
        <TodoNote>name, email, phone, and address of the designated Grievance Officer</TodoNote>. If unresolved,
        you may escalate via <a href="/legal/investor-charter">Investor Charter and Grievance</a> or SEBI SCORES.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="19 September 2026"
      intro={<p>This Policy applies to all personal data JestATP processes about you as a user of the platform.</p>}
      sections={sections}
    />
  );
}
