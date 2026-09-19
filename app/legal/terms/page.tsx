import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';
import { TodoNote } from '@/components/legal/todo-note';

export const metadata: Metadata = {
  title: 'Terms and Conditions · JestATP',
  description: 'The terms that govern your use of the JestATP platform.',
};

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    heading: 'Acceptance of terms',
    body: (
      <>
        <p>
          These Terms and Conditions (&quot;Terms&quot;) are a binding agreement between you (&quot;User&quot;,
          &quot;you&quot;) and <TodoNote>legal name of the operating entity, e.g. &quot;JestATP Technologies Private
          Limited&quot;</TodoNote> (&quot;JestATP&quot;, &quot;we&quot;, &quot;us&quot;), a company incorporated in
          India with its registered office at Orion Business Park, Tower B, 4th Floor, Outer Ring Road, Bellandur,
          Bengaluru – 560103, Karnataka.
        </p>
        <p>
          By creating an account, connecting a broker, or otherwise using JestATP, you agree to these Terms, our{' '}
          <a href="/legal/privacy-policy">Privacy Policy</a>, and our <a href="/legal/policies-and-procedures">
            Policies and Procedures
          </a>
          . If you do not agree, do not use the platform.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-are',
    heading: 'What JestATP is — and isn&apos;t',
    body: (
      <>
        <p>
          JestATP is a technology platform for building, backtesting, and running algorithmic trading strategies.
          We connect, via API, to a broker account that you separately open and hold in your own name (currently
          Zerodha, Dhan, and Groww). JestATP does not hold client funds or securities, does not act as your
          stockbroker, and does not provide investment advice.
        </p>
        <p>
          Under SEBI&apos;s framework for algorithmic trading by retail investors, your broker is the principal for
          any order placed through the platform and JestATP acts as an algo provider empanelled with the relevant
          stock exchange(s). See <a href="/legal/regulatory-info">Regulatory &amp; Other Info</a> for how that
          works in practice.
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    heading: 'Eligibility and your account',
    body: (
      <ul>
        <li>You must be at least 18 years old and legally capable of entering into a binding contract in India.</li>
        <li>You must hold, or open, a trading and demat account with a broker JestATP supports.</li>
        <li>
          You are responsible for the accuracy of the information you provide during signup and KYC, and for
          keeping your login credentials, API keys, and two-factor authentication methods confidential.
        </li>
        <li>One person may hold only one JestATP account, unless we agree otherwise in writing.</li>
      </ul>
    ),
  },
  {
    id: 'broker-connections',
    heading: 'Connecting your broker',
    body: (
      <>
        <p>
          When you connect a broker, you authorise JestATP to place, modify, and cancel orders, and to read your
          holdings, positions, funds, and order history, strictly for the strategies and actions you configure. You
          can revoke this authorisation at any time from Settings, which disconnects the API session going forward.
        </p>
        <p>
          Broker connectivity, market data, margin, and execution depend on your broker&apos;s systems and your
          broker&apos;s API/data-plan subscription. JestATP is not responsible for downtime, rejected orders, or
          data delays originating at the broker or exchange.
        </p>
      </>
    ),
  },
  {
    id: 'strategies-risk',
    heading: 'Strategies, automation, and risk',
    body: (
      <>
        <p>
          Any strategy you build, import, backtest, or activate — including ready-made and marketplace strategies —
          runs entirely on your instructions and at your risk. Backtested or simulated performance does not
          guarantee future results.
        </p>
        <p>
          <strong>You are solely responsible for every order placed through your account</strong>, whether placed
          manually or by an automated strategy you activated, including orders placed due to a bug in a
          strategy you authored or imported. Set position limits, stop-losses, and capital caps appropriate to your
          own risk tolerance — JestATP provides the tools but does not size positions for you.
        </p>
      </>
    ),
  },
  {
    id: 'fees',
    heading: 'Fees and billing',
    body: (
      <p>
        Subscription fees, if any, are shown at checkout and billed in advance on the cycle you choose. Broker
        brokerage, exchange, and statutory charges (STT, GST, stamp duty, SEBI turnover fees, etc.) are charged
        separately by your broker and are not part of any JestATP fee. See{' '}
        <a href="/pricing">Pricing</a> for current plans.
      </p>
    ),
  },
  {
    id: 'prohibited-use',
    heading: 'Prohibited use',
    body: (
      <ul>
        <li>Market manipulation, front-running, spoofing, or any activity that would breach SEBI or exchange rules.</li>
        <li>Reverse-engineering the platform, or accessing it through unauthorised automation outside our supported APIs.</li>
        <li>Sharing your account or API credentials with a third party, or operating on behalf of someone else&apos;s account without authorisation.</li>
        <li>Uploading strategy code that attempts to access other users&apos; data or to interfere with platform infrastructure.</li>
      </ul>
    ),
  },
  {
    id: 'liability',
    heading: 'Limitation of liability',
    body: (
      <p>
        To the maximum extent permitted by law, JestATP is not liable for trading losses, missed trades, delayed
        execution, or broker/exchange outages. Our aggregate liability for any claim relating to the platform is
        limited to the subscription fees you paid us in the twelve months preceding the claim. Nothing in these
        Terms limits liability that cannot be excluded under Indian law.
      </p>
    ),
  },
  {
    id: 'termination',
    heading: 'Suspension and termination',
    body: (
      <p>
        You may close your account at any time from Settings. We may suspend or terminate access — with notice
        where practicable — for breach of these Terms, suspected fraud or market abuse, or a legal or regulatory
        requirement to do so. Termination does not affect your broker account, which continues to be governed
        directly by you and your broker.
      </p>
    ),
  },
  {
    id: 'changes-law',
    heading: 'Changes, governing law, and disputes',
    body: (
      <>
        <p>
          We may update these Terms from time to time; material changes will be notified in-app or by email at
          least 15 days before they take effect. Continued use after that date constitutes acceptance.
        </p>
        <p>
          These Terms are governed by the laws of India. Courts at <TodoNote>city of registered jurisdiction,
          typically the registered-office city</TodoNote> have exclusive jurisdiction, subject to your right to use
          the SEBI SCORES and SMART ODR mechanisms described in our <a href="/legal/smart-odr">SMART ODR</a> page.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: (
      <p>
        Questions about these Terms can be sent to <TodoNote>legal/support contact email, e.g.
        legal@jestatp.com</TodoNote> or via <a href="/contact">Contact Us</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      lastUpdated="19 September 2026"
      intro={
        <p>
          These Terms govern your access to and use of JestATP&apos;s website, app, and APIs. Please read them
          together with our Privacy Policy and Policies and Procedures.
        </p>
      }
      sections={sections}
    />
  );
}
