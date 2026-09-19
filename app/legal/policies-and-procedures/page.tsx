import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Policies and Procedures · JestATP',
  description: 'Operational policies covering onboarding, strategy risk controls, fees, and account actions.',
};

const sections: LegalSection[] = [
  {
    id: 'onboarding',
    heading: 'Onboarding and KYC',
    body: (
      <p>
        Signup requires a valid email and phone (OTP-verified) and a broker account in your own name. KYC itself is
        performed by your broker under SEBI&apos;s KYC Registration Agency (KRA) framework — JestATP does not
        independently collect or store KYC documents beyond what your broker&apos;s API returns for account
        verification.
      </p>
    ),
  },
  {
    id: 'strategy-controls',
    heading: 'Strategy risk controls',
    body: (
      <ul>
        <li>Every strategy must have an explicit capital allocation and, where applicable, a stop-loss before it can be activated.</li>
        <li>Order-per-second and daily order-count limits apply per exchange rules for algo-tagged orders; strategies exceeding a threshold are auto-paused pending review.</li>
        <li>You can pause or kill-switch any active strategy instantly from the dashboard — this cancels pending orders placed by that strategy where the exchange allows cancellation.</li>
        <li>Backtests run on historical data and simulated fills; they do not account for slippage, liquidity, or broker-specific rejections during live trading.</li>
      </ul>
    ),
  },
  {
    id: 'empanelment',
    heading: 'Algo empanelment and order tagging',
    body: (
      <p>
        Per SEBI&apos;s February 2025 circular on algorithmic trading by retail investors, JestATP is empanelled as
        an algo provider with the exchange(s) via our broker partners, and orders placed through the platform carry
        the exchange-provided unique algo identifier for traceability. Your broker remains the principal on record
        for every order.
      </p>
    ),
  },
  {
    id: 'fees-refunds',
    heading: 'Fees, billing cycle, and refunds',
    body: (
      <>
        <p>
          Plans renew automatically on the billing cycle you selected until cancelled. You can cancel anytime from
          Settings → Billing; cancellation stops future renewals but does not refund the current cycle unless
          stated otherwise below.
        </p>
        <p>
          Refund window: <TodoNote>confirm refund policy, e.g. &quot;full refund within 7 days of first
          subscription if fewer than N strategies were activated&quot;</TodoNote>. Refunds, where approved, are
          credited to the original payment method within{' '}
          <TodoNote>confirm refund processing SLA, e.g. 5–7 business days</TodoNote>.
        </p>
      </>
    ),
  },
  {
    id: 'account-actions',
    heading: 'Suspension, restriction, and closure',
    body: (
      <p>
        We may restrict or suspend platform access if we detect activity that risks market integrity (e.g.
        suspected spoofing or manipulation), a breach of our{' '}
        <a href="/legal/terms">Terms</a>, or on instruction from your broker or a regulator. Where practicable, we
        notify you and the reason before or immediately after any such action, and you can request a review by
        contacting support.
      </p>
    ),
  },
  {
    id: 'disconnecting-brokers',
    heading: 'Disconnecting a broker',
    body: (
      <p>
        Disconnecting a broker from Settings immediately revokes JestATP&apos;s API access token with that broker
        and pauses every strategy running against that connection. It does not close your broker account or cancel
        orders already resting on the exchange — manage those directly with your broker if needed.
      </p>
    ),
  },
  {
    id: 'complaints',
    heading: 'Complaint handling',
    body: (
      <p>
        Complaints submitted via <a href="/support">Help &amp; Support</a> are acknowledged within{' '}
        <TodoNote>confirm complaint acknowledgement/resolution SLA</TodoNote>. If you&apos;re not satisfied with
        the outcome, see <a href="/legal/investor-charter">Investor Charter and Grievance</a> for the SCORES and
        SMART ODR escalation path.
      </p>
    ),
  },
];

export default function PoliciesAndProceduresPage() {
  return (
    <LegalPage
      title="Policies and Procedures"
      lastUpdated="19 September 2026"
      intro={
        <p>
          The operational rules behind our Terms — how onboarding, strategy risk controls, billing, and account
          actions actually work.
        </p>
      }
      sections={sections}
    />
  );
}
