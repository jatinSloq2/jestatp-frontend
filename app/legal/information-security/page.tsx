import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Information Security Practices · JestATP',
  description: 'How JestATP secures your account, broker connections, and data.',
};

const sections: LegalSection[] = [
  {
    id: 'overview',
    heading: 'Overview',
    body: (
      <p>
        JestATP handles broker API access and account data, so security is core to the product, not an add-on.
        This page summarises the technical and organisational controls we run; it is not exhaustive, since
        publishing full infrastructure detail would itself be a security risk.
      </p>
    ),
  },
  {
    id: 'account-security',
    heading: 'Account security',
    body: (
      <ul>
        <li>Password hashing with a modern, salted algorithm; passwords are never stored or logged in plaintext.</li>
        <li>Two-factor authentication (2FA) available for login, with sensitive actions — like reconnecting a broker — re-verified.</li>
        <li>Session tokens expire and can be revoked from Settings → Security if a device is lost or compromised.</li>
        <li>Login anomaly detection flags unusual locations or devices and notifies you by email.</li>
      </ul>
    ),
  },
  {
    id: 'broker-api-security',
    heading: 'Broker API credentials',
    body: (
      <p>
        Broker API keys and access tokens are encrypted at rest using <TodoNote>confirm encryption standard in
        use, e.g. AES-256 with envelope encryption via a managed KMS</TodoNote>, and are decrypted only in memory,
        at request time, by the service that needs to place an order. Tokens are never exposed to the frontend or
        included in client-side logs.
      </p>
    ),
  },
  {
    id: 'infra',
    heading: 'Infrastructure and data protection',
    body: (
      <ul>
        <li>All traffic between your browser/app and JestATP, and between JestATP and broker APIs, is encrypted with TLS.</li>
        <li>Production data access is role-based and logged; engineers do not have standing access to production databases by default.</li>
        <li>Backups are encrypted and tested on a regular schedule.</li>
        <li>Strategy execution for user-authored code runs in an isolated sandbox, separate from account and order-management services.</li>
      </ul>
    ),
  },
  {
    id: 'monitoring',
    heading: 'Monitoring and incident response',
    body: (
      <p>
        We monitor for anomalous API usage, failed authentication patterns, and order-placement irregularities.
        In the event of a security incident affecting your data, we will notify affected users and relevant
        authorities in line with applicable law, and provide guidance on any action you should take.
      </p>
    ),
  },
  {
    id: 'responsible-disclosure',
    heading: 'Found a vulnerability?',
    body: <p>Please report it through our <a href="/security/bug-bounty">Bug Bounty</a> program rather than public disclosure.</p>,
  },
];

export default function InformationSecurityPage() {
  return (
    <LegalPage
      title="Information Security Practices"
      lastUpdated="19 September 2026"
      intro={<p>A summary of how we protect your account, broker connections, and data.</p>}
      sections={sections}
    />
  );
}
