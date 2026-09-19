import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Privacy Policy (Payments) · JestATP',
  description: 'How JestATP handles data related to subscription payments.',
};

const sections: LegalSection[] = [
  {
    id: 'why-separate',
    heading: 'Why this is separate from our main Privacy Policy',
    body: (
      <p>
        JestATP charges subscription fees for platform access — separately from any brokerage, exchange, or
        statutory charges your broker collects for your trades. This page covers only the data involved in that
        subscription billing relationship. Everything else is covered by our general{' '}
        <a href="/legal/privacy-policy">Privacy Policy</a>.
      </p>
    ),
  },
  {
    id: 'processor',
    heading: 'Our payment processor',
    body: (
      <p>
        Card, UPI, and net-banking payments are handled by <TodoNote>name of PCI-DSS-compliant payment
        gateway, e.g. Razorpay/Cashfree/Stripe</TodoNote>, a RBI-authorised payment aggregator. JestATP never
        receives or stores your full card number, CVV, or UPI PIN — these are captured directly by the processor&apos;s
        secure, PCI-DSS-compliant checkout.
      </p>
    ),
  },
  {
    id: 'data-we-hold',
    heading: 'What we hold',
    body: (
      <ul>
        <li>Billing name, email, and GST details (if you request a GST invoice).</li>
        <li>A masked reference to your payment method (e.g. last 4 digits, card network) returned by the processor — never the full number.</li>
        <li>Transaction ID, amount, plan, and invoice history, for accounting and support purposes.</li>
      </ul>
    ),
  },
  {
    id: 'refunds',
    heading: 'Refunds and disputes',
    body: (
      <p>
        Refund eligibility is set out in our <a href="/legal/policies-and-procedures">Policies and Procedures</a>.
        Refunds are issued to the original payment method through our processor; we do not process cash refunds.
        Chargeback and payment-dispute data is shared with our processor and, where required, with your bank, to
        investigate the dispute.
      </p>
    ),
  },
  {
    id: 'retention',
    heading: 'Retention',
    body: (
      <p>
        Invoice and transaction records are retained for the period required under Indian tax and accounting law
        (currently a minimum of <TodoNote>confirm retention period per Companies Act / GST record-keeping
        rules</TodoNote>), even if you close your account.
      </p>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: (
      <p>
        Billing questions: <TodoNote>billing support email, e.g. billing@jestatp.com</TodoNote>. General privacy
        queries go to the Grievance Officer listed in our <a href="/legal/privacy-policy">Privacy Policy</a>.
      </p>
    ),
  },
];

export default function PaymentsPrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy (Payments)"
      lastUpdated="19 September 2026"
      intro={<p>How we handle data specifically tied to paying for a JestATP subscription.</p>}
      sections={sections}
    />
  );
}
