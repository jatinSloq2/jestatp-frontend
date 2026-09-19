import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Regulatory & Other Info · JestATP',
  description: 'JestATP\u2019s regulatory status, empanelment, and registration details.',
};

const sections: LegalSection[] = [
  {
    id: 'our-role',
    heading: 'Our regulatory role',
    body: (
      <p>
        JestATP is an algorithmic-trading technology provider, not a stock broker, depository participant, or
        investment adviser. We do not hold client funds or securities and do not provide investment advice or
        portfolio management services. Orders placed through the platform are executed through the broker you
        connect, who remains the SEBI-registered stock broker of record.
      </p>
    ),
  },
  {
    id: 'framework',
    heading: 'The framework we operate under',
    body: (
      <>
        <p>
          SEBI&apos;s February 4, 2025 circular on safeguarding retail investors in algorithmic trading sets out a
          principal–agent structure: your broker is the principal, and JestATP, as algo provider, acts as its
          agent. All algo orders are routed through broker-issued, vendor-specific API keys tied to a static IP,
          and tagged with a unique identifier issued by the stock exchange for traceability. The framework became
          enforceable from August 1, 2025.
        </p>
        <p>
          As algo provider, we are empanelled with the exchange(s) through our broker partners, and we submit
          strategies for exchange approval where they meet the order-per-second thresholds that require
          registration.
        </p>
      </>
    ),
  },
  {
    id: 'registrations',
    heading: 'Registrations and identifiers',
    body: (
      <ul>
        <li>Corporate identity number (CIN): <TodoNote>fill in CIN from MCA incorporation certificate</TodoNote></li>
        <li>Exchange empanelment / algo-provider ID(s): <TodoNote>fill in NSE/BSE empanelment reference(s), obtained via broker partners</TodoNote></li>
        <li>GSTIN: <TodoNote>fill in GSTIN</TodoNote></li>
        <li>Registered address: Orion Business Park, Tower B, 4th Floor, Outer Ring Road, Bellandur, Bengaluru – 560103, Karnataka</li>
      </ul>
    ),
  },
  {
    id: 'broker-partners',
    heading: 'Broker partners',
    body: (
      <p>
        JestATP currently connects with Zerodha, Dhan, and Groww through their published trading APIs. Each
        broker&apos;s own SEBI registration number and terms of service, available on their respective websites,
        govern the trading account itself. Connecting a broker does not transfer any broker obligation to JestATP.
      </p>
    ),
  },
  {
    id: 'exchange-links',
    heading: 'Exchange and regulator references',
    body: (
      <ul>
        <li>SEBI: <a href="https://www.sebi.gov.in" target="_blank" rel="noreferrer">sebi.gov.in</a></li>
        <li>NSE: <a href="https://www.nseindia.com" target="_blank" rel="noreferrer">nseindia.com</a></li>
        <li>BSE: <a href="https://www.bseindia.com" target="_blank" rel="noreferrer">bseindia.com</a></li>
        <li>SEBI SCORES (complaints): <a href="https://scores.sebi.gov.in" target="_blank" rel="noreferrer">scores.sebi.gov.in</a></li>
      </ul>
    ),
  },
  {
    id: 'related-pages',
    heading: 'Related pages',
    body: (
      <ul>
        <li><a href="/legal/disclosure">Disclosure</a> — risk disclosures for algorithmic trading.</li>
        <li><a href="/legal/smart-odr">SMART ODR</a> — how to escalate an unresolved grievance.</li>
        <li><a href="/legal/investor-charter">Investor Charter and Grievance</a> — your rights as a client.</li>
      </ul>
    ),
  },
];

export default function RegulatoryInfoPage() {
  return (
    <LegalPage
      title="Regulatory & Other Info"
      lastUpdated="19 September 2026"
      intro={<p>Who JestATP is, what role we play under SEBI&apos;s algo-trading framework, and our registration details.</p>}
      sections={sections}
    />
  );
}
