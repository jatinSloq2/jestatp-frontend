import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Investor Charter and Grievance · JestATP',
  description: 'Your rights as a JestATP user and how to raise a grievance.',
};

const sections: LegalSection[] = [
  {
    id: 'purpose',
    heading: 'Purpose of this charter',
    body: (
      <p>
        This charter sets out what you can expect from JestATP, and the process to raise and escalate a grievance,
        consistent with SEBI&apos;s investor charter framework for market participants.
      </p>
    ),
  },
  {
    id: 'commitments',
    heading: 'Our commitments to you',
    body: (
      <ul>
        <li>Transparent fees, with no hidden charges beyond what&apos;s shown at checkout.</li>
        <li>Clear disclosure of what JestATP does and does not do — see <a href="/legal/disclosure">Disclosure</a>.</li>
        <li>Your broker API authorisation stays revocable by you at any time, from Settings.</li>
        <li>Timely acknowledgement and resolution of complaints, per the SLAs in our <a href="/legal/policies-and-procedures">Policies and Procedures</a>.</li>
        <li>No sharing of your data beyond what&apos;s described in our <a href="/legal/privacy-policy">Privacy Policy</a>.</li>
      </ul>
    ),
  },
  {
    id: 'your-responsibilities',
    heading: 'Your responsibilities',
    body: (
      <ul>
        <li>Keep your login credentials and 2FA methods secure, and report any unauthorised access immediately.</li>
        <li>Understand a strategy&apos;s logic and risk before activating it — JestATP does not vet strategies for suitability.</li>
        <li>Keep your KYC and contact information with your broker up to date.</li>
        <li>Review order confirmations and account statements regularly.</li>
      </ul>
    ),
  },
  {
    id: 'grievance-process',
    heading: 'How to raise a grievance',
    body: (
      <ol>
        <li>Contact <a href="/support">Help &amp; Support</a> with your account details and a description of the issue.</li>
        <li>We acknowledge within <TodoNote>confirm acknowledgement SLA, e.g. 24 hours</TodoNote> and aim to resolve within <TodoNote>confirm resolution SLA, e.g. 15 working days</TodoNote>.</li>
        <li>If unresolved or unsatisfactory, escalate via SEBI SCORES, then SMART ODR — see <a href="/legal/smart-odr">SMART ODR</a> for the full path.</li>
      </ol>
    ),
  },
  {
    id: 'grievance-officer',
    heading: 'Grievance / Compliance Officer',
    body: (
      <p>
        <TodoNote>name, designation, email, phone, and registered address of the designated Compliance/Grievance
        Officer</TodoNote>
      </p>
    ),
  },
  {
    id: 'timelines-table',
    heading: 'Turnaround expectations',
    body: (
      <ul>
        <li>Account/KYC-related queries: <TodoNote>SLA</TodoNote></li>
        <li>Order or execution disputes: <TodoNote>SLA</TodoNote></li>
        <li>Billing and refund requests: <TodoNote>SLA</TodoNote></li>
        <li>Security incident reports: acknowledged within 24 hours</li>
      </ul>
    ),
  },
];

export default function InvestorCharterPage() {
  return (
    <LegalPage
      title="Investor Charter and Grievance"
      lastUpdated="19 September 2026"
      intro={<p>What you can expect from us, what we expect from you, and how to raise and escalate a grievance.</p>}
      sections={sections}
    />
  );
}
