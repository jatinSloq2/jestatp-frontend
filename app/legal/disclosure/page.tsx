import { Metadata } from 'next';
import { LegalPage, LegalSection } from '@/components/legal/legal-page';

export const metadata: Metadata = {
  title: 'Disclosure · JestATP',
  description: 'Risk disclosures for trading, investing, and using algorithmic strategies on JestATP.',
};

const sections: LegalSection[] = [
  {
    id: 'general-risk',
    heading: 'General market risk',
    body: (
      <p>
        Trading and investing in securities — equities, F&amp;O, ETFs, mutual funds, and other instruments — carry
        risk of loss, including loss of your entire invested capital. Past performance of any stock, index, or
        strategy is not indicative of future results. Please read all scheme-related and product-risk documents
        carefully before investing.
      </p>
    ),
  },
  {
    id: 'algo-risk',
    heading: 'Risks specific to algorithmic trading',
    body: (
      <ul>
        <li><strong>Amplified speed of loss.</strong> An automated strategy can place many orders faster than a human can review them; a flawed rule can compound losses quickly.</li>
        <li><strong>Backtest-to-live gap.</strong> Backtests use historical data and simplified fill assumptions; live markets add slippage, partial fills, and liquidity constraints a backtest may not capture.</li>
        <li><strong>Connectivity dependency.</strong> Strategy execution depends on your internet connection, JestATP&apos;s infrastructure, and your broker&apos;s and the exchange&apos;s systems — any of which can fail or lag.</li>
        <li><strong>Third-party and marketplace strategies.</strong> Strategies built by other users and shared via the marketplace are not vetted or endorsed by JestATP as suitable for your goals; review the logic before activating one.</li>
      </ul>
    ),
  },
  {
    id: 'no-advice',
    heading: 'No investment advice',
    body: (
      <p>
        Nothing on JestATP — including screener results, strategy templates, backtests, or market data — is a
        recommendation to buy, sell, or hold any security. JestATP is not a SEBI-registered investment adviser or
        research analyst. Consult a qualified, registered adviser for personalised advice.
      </p>
    ),
  },
  {
    id: 'not-a-custodian',
    heading: 'JestATP does not hold your money or securities',
    body: (
      <p>
        Funds and securities always remain with your broker and depository. JestATP only sends order instructions
        through the API you authorise — we cannot withdraw funds, transfer securities, or otherwise move assets out
        of your broker account.
      </p>
    ),
  },
  {
    id: 'operational-risk',
    heading: 'Platform and operational risk',
    body: (
      <p>
        Software bugs, planned maintenance, or unplanned outages can delay or prevent order placement. We work to
        minimise downtime and to surface broker/exchange errors clearly in the app, but we cannot guarantee
        uninterrupted service. Set strategy-level safeguards (stop-loss, position caps, kill switch) accordingly.
      </p>
    ),
  },
  {
    id: 'acknowledgement',
    heading: 'Your acknowledgement',
    body: (
      <p>
        By activating any strategy on JestATP, you confirm that you understand these risks, that you are trading
        with capital you can afford to risk, and that you take full responsibility for the strategy&apos;s
        configuration and the orders it generates.
      </p>
    ),
  },
];

export default function DisclosurePage() {
  return (
    <LegalPage
      title="Disclosure"
      lastUpdated="19 September 2026"
      intro={<p>Risk disclosures you should read before connecting a broker or activating a strategy.</p>}
      sections={sections}
    />
  );
}
