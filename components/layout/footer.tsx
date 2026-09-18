'use client';

import { LogoMark } from '@/components/brand/logo';
import {
  AppleIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon
} from '@/components/brand/social';
import { ChevronDown } from 'lucide-react'; // keep — ChevronDown is still exported by lucide-react
import Link from 'next/link';
import { useState } from 'react';

const SOCIALS = [
  { icon: XIcon, href: 'https://twitter.com/jestatp', label: 'X' },
  { icon: InstagramIcon, href: 'https://instagram.com/jestatp', label: 'Instagram' },
  { icon: FacebookIcon, href: 'https://facebook.com/jestatp', label: 'Facebook' },
  { icon: LinkedinIcon, href: 'https://linkedin.com/company/jestatp', label: 'LinkedIn' },
  { icon: YoutubeIcon, href: 'https://youtube.com/@jestatp', label: 'YouTube' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Media & Press', href: '/press' },
  { label: 'Careers', href: '/careers' },
  { label: 'Help & Support', href: '/support' },
  { label: 'Trust & Safety', href: '/trust-and-safety' },
  { label: 'Investor Relations', href: '/investor-relations' },
];

const PRODUCT_COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Products',
    links: [
      { label: 'Stocks', href: '/products/stocks' },
      { label: 'F&O', href: '/products/futures-and-options' },
      { label: 'MTF', href: '/products/mtf' },
      { label: 'ETF', href: '/products/etf' },
      { label: 'IPO', href: '/products/ipo' },
      { label: 'Mutual Funds', href: '/products/mutual-funds' },
      { label: 'Commodities', href: '/products/commodities' },
      { label: 'Algo Terminal', href: '/terminal' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { label: 'Strategy Builder', href: '/strategies' },
      { label: 'Backtest Engine', href: '/backtest' },
      { label: 'Stock Screener', href: '/screener' },
      { label: 'Algo Trading', href: '/algo-trading' },
      { label: 'Charts', href: '/charts' },
      { label: 'Market Digest', href: '/digest' },
      { label: 'Demat Account', href: '/demat-account' },
      { label: 'PMS', href: '/pms' },
    ],
  },
];

const MARKET_TABS: {
  tab: string;
  columns: { heading: string; links: { label: string; href: string }[] }[];
}[] = [
    {
      tab: 'Share Market',
      columns: [
        {
          heading: 'Top Gainers Stocks',
          links: [
            { label: '52 Weeks High Stocks', href: '/markets/52-week-high' },
            { label: 'Tata Motors', href: '/markets/stocks/tata-motors' },
            { label: 'NHPC', href: '/markets/stocks/nhpc' },
            { label: 'ITC', href: '/markets/stocks/itc' },
            { label: 'Wipro', href: '/markets/stocks/wipro' },
          ],
        },
        {
          heading: 'Top Losers Stocks',
          links: [
            { label: '52 Weeks Low Stocks', href: '/markets/52-week-low' },
            { label: 'IREDA', href: '/markets/stocks/ireda' },
            { label: 'State Bank of India', href: '/markets/stocks/sbi' },
            { label: 'Adani Power', href: '/markets/stocks/adani-power' },
            { label: 'CDSL', href: '/markets/stocks/cdsl' },
          ],
        },
        {
          heading: 'Most Traded Stocks',
          links: [
            { label: 'Stocks Market Calendar', href: '/markets/calendar' },
            { label: 'Tata Steel', href: '/markets/stocks/tata-steel' },
            { label: 'Tata Power', href: '/markets/stocks/tata-power' },
            { label: 'Bharat Heavy Electricals', href: '/markets/stocks/bhel' },
            { label: 'Indian Oil Corporation', href: '/markets/stocks/ioc' },
          ],
        },
        {
          heading: 'Stocks Feed',
          links: [
            { label: 'Suzlon Energy', href: '/markets/stocks/suzlon-energy' },
            { label: 'Zomato (Eternal)', href: '/markets/stocks/zomato' },
            { label: 'Yes Bank', href: '/markets/stocks/yes-bank' },
            { label: 'Infosys', href: '/markets/stocks/infosys' },
            { label: 'NBCC', href: '/markets/stocks/nbcc' },
          ],
        },
        {
          heading: 'FII DII Activity',
          links: [
            { label: 'IRFC', href: '/markets/stocks/irfc' },
            { label: 'Bharat Electronics', href: '/markets/stocks/bel' },
            { label: 'HDFC Bank', href: '/markets/stocks/hdfc-bank' },
            { label: 'Vedanta', href: '/markets/stocks/vedanta' },
            { label: 'Reliance Power', href: '/markets/stocks/reliance-power' },
          ],
        },
      ],
    },
    {
      tab: 'Indices',
      columns: [
        {
          heading: 'Broad Indices',
          links: [
            { label: 'Nifty 50', href: '/indices/nifty-50' },
            { label: 'Sensex', href: '/indices/sensex' },
            { label: 'Nifty Bank', href: '/indices/nifty-bank' },
            { label: 'Nifty Next 50', href: '/indices/nifty-next-50' },
            { label: 'Nifty Midcap 100', href: '/indices/nifty-midcap-100' },
          ],
        },
        {
          heading: 'Sectoral Indices',
          links: [
            { label: 'Nifty IT', href: '/indices/nifty-it' },
            { label: 'Nifty Auto', href: '/indices/nifty-auto' },
            { label: 'Nifty Pharma', href: '/indices/nifty-pharma' },
            { label: 'Nifty FMCG', href: '/indices/nifty-fmcg' },
            { label: 'Nifty Metal', href: '/indices/nifty-metal' },
          ],
        },
      ],
    },
    {
      tab: 'F&O',
      columns: [
        {
          heading: 'Options Chain',
          links: [
            { label: 'Nifty Option Chain', href: '/fo/option-chain/nifty' },
            { label: 'Bank Nifty Option Chain', href: '/fo/option-chain/banknifty' },
            { label: 'Most Active Options', href: '/fo/most-active-options' },
            { label: 'Most Active Futures', href: '/fo/most-active-futures' },
          ],
        },
        {
          heading: 'F&O Data',
          links: [
            { label: 'Open Interest', href: '/fo/open-interest' },
            { label: 'F&O Ban List', href: '/fo/ban-list' },
            { label: 'F&O Expiry Calendar', href: '/fo/expiry-calendar' },
            { label: 'Put Call Ratio', href: '/fo/put-call-ratio' },
          ],
        },
      ],
    },
    {
      tab: 'Mutual Funds',
      columns: [
        {
          heading: 'Explore Funds',
          links: [
            { label: 'Best SIP Plans', href: '/mutual-funds/best-sip' },
            { label: 'Tax Saving Funds', href: '/mutual-funds/elss' },
            { label: 'Large Cap Funds', href: '/mutual-funds/large-cap' },
            { label: 'Mid Cap Funds', href: '/mutual-funds/mid-cap' },
          ],
        },
        {
          heading: 'Calculators',
          links: [
            { label: 'SIP Calculator', href: '/calculators/sip' },
            { label: 'Lumpsum Calculator', href: '/calculators/lumpsum' },
            { label: 'Mutual Fund Returns', href: '/calculators/mf-returns' },
          ],
        },
      ],
    },
    {
      tab: 'ETFs',
      columns: [
        {
          heading: 'Popular ETFs',
          links: [
            { label: 'Nifty BeES', href: '/etf/nifty-bees' },
            { label: 'Gold BeES', href: '/etf/gold-bees' },
            { label: 'Bank BeES', href: '/etf/bank-bees' },
            { label: 'Junior BeES', href: '/etf/junior-bees' },
          ],
        },
      ],
    },
    {
      tab: 'Strategies',
      columns: [
        {
          heading: 'Ready-made Strategies',
          links: [
            { label: 'Momentum Strategies', href: '/strategies/momentum' },
            { label: 'Mean Reversion Strategies', href: '/strategies/mean-reversion' },
            { label: 'Options Strategies', href: '/strategies/options' },
            { label: 'Strategy Marketplace', href: '/strategies/marketplace' },
          ],
        },
      ],
    },
    {
      tab: 'Calculators',
      columns: [
        {
          heading: 'Trading Calculators',
          links: [
            { label: 'Brokerage Calculator', href: '/calculators/brokerage' },
            { label: 'Margin Calculator', href: '/calculators/margin' },
            { label: 'Span Calculator', href: '/calculators/span' },
            { label: 'Position Size Calculator', href: '/calculators/position-size' },
          ],
        },
      ],
    },
    {
      tab: 'IPO',
      columns: [
        {
          heading: 'IPO Center',
          links: [
            { label: 'Upcoming IPOs', href: '/ipo/upcoming' },
            { label: 'Ongoing IPOs', href: '/ipo/ongoing' },
            { label: 'Listed IPOs', href: '/ipo/listed' },
            { label: 'IPO Allotment Status', href: '/ipo/allotment-status' },
          ],
        },
      ],
    },
    {
      tab: 'Miscellaneous',
      columns: [
        {
          heading: 'Resources',
          links: [
            { label: 'Glossary', href: '/glossary' },
            { label: 'Market Holidays', href: '/market-holidays' },
            { label: 'Learn Trading', href: '/learn' },
            { label: 'API Documentation', href: '/developers/api' },
          ],
        },
      ],
    },
  ];

const OTHER_LINKS = [
  { label: 'NSE', href: '/partners/nse' },
  { label: 'BSE', href: '/partners/bse' },
  { label: 'MCX', href: '/partners/mcx' },
  { label: 'Terms and Conditions', href: '/legal/terms' },
  { label: 'Policies and Procedures', href: '/legal/policies-and-procedures' },
  { label: 'Regulatory & Other Info', href: '/legal/regulatory-info' },
  { label: 'Privacy Policy', href: '/legal/privacy-policy' },
  { label: 'Disclosure', href: '/legal/disclosure' },
  { label: 'SMART ODR', href: '/legal/smart-odr' },
  { label: 'Download Forms', href: '/legal/forms' },
  { label: 'Information Security Practices', href: '/legal/information-security' },
  { label: 'Investor Charter and Grievance', href: '/legal/investor-charter' },
  { label: 'Bug Bounty', href: '/security/bug-bounty' },
  { label: 'Privacy Policy (Payments)', href: '/legal/payments-privacy-policy' },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function Footer() {
  const [activeTab, setActiveTab] = useState(MARKET_TABS[0].tab);
  const [showMore, setShowMore] = useState(false);

  const active = MARKET_TABS.find((t) => t.tab === activeTab) ?? MARKET_TABS[0];
  const visibleColumns = showMore ? active.columns : active.columns.slice(0, 5);

  return (
    <footer className="border-t border-border bg-canvas-muted">
      {/* Top: brand + company + products */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-10">
        <div>
          <span className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="text-lg font-semibold tracking-tight text-text-primary">JestATP</span>
          </span>

          <address className="mt-6 not-italic text-sm leading-relaxed text-text-secondary">
            Orion Business Park, Tower B, 4th Floor
            <br />
            Outer Ring Road, Bellandur, Bengaluru – 560103
            <br />
            Karnataka
          </address>

          <div className="mt-5 flex items-center gap-8 text-sm">
            <Link href="/contact" className="text-text-primary underline decoration-dotted underline-offset-4">
              Contact Us
            </Link>
            {/* <div>
              <p className="mb-2 text-text-primary">Download the App</p>
              <div className="flex items-center gap-2">
                <a
                  href="https://apps.apple.com/app/jestatp"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface"
                  aria-label="Download on the App Store"
                >
                  <AppleIcon className="h-4 w-4 text-text-primary" />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.jestatp"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface"
                  aria-label="Get it on Google Play"
                >
                  <span className="text-sm">▶</span>
                </a>
              </div>
            </div> */}
          </div>

          <div className="mt-6 flex items-center gap-4 text-text-tertiary">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} className="hover:text-text-primary">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="mt-8 text-xs text-text-tertiary">
            © 2023-{new Date().getFullYear()} JestATP. All rights reserved.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Company</p>
          <ul className="mt-4 flex flex-col gap-2.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-text-secondary hover:text-accent-trust">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {PRODUCT_COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{col.heading}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-text-secondary hover:text-accent-trust">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Tabbed market/instrument links */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="flex flex-wrap gap-x-8 gap-y-2 justify-between border-b border-border pb-3">
            {MARKET_TABS.map(({ tab }) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setShowMore(false);
                }}
                className={`pb-3 text-sm transition-colors ${activeTab === tab
                    ? 'border-b-2 border-text-primary font-medium text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
            {visibleColumns.map((col) => (
              <div key={col.heading}>
                <p className="text-sm font-medium text-text-primary">{col.heading}</p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-text-secondary hover:text-accent-trust">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {active.columns.length > 5 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowMore((v) => !v)}
                className="inline-flex items-center gap-1 border-b border-dashed border-text-tertiary text-sm text-text-secondary hover:text-text-primary"
              >
                {showMore ? 'Show Less' : 'Show More'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Others: legal / regulatory links */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-x-3 gap-y-3 px-6 py-6 text-xs text-text-secondary lg:px-10">
          <span className="font-medium text-text-primary">Others:</span>
          {OTHER_LINKS.map((link, i) => (
            <span key={link.label} className="flex items-center gap-3">
              <Link href={link.href} className="hover:text-accent-trust">
                {link.label}
              </Link>
              {i < OTHER_LINKS.length - 1 && <span className="text-border">|</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Stocks A-Z */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-6 lg:px-10">
          <span className="mr-2 text-xs font-medium text-text-primary">Stocks:</span>
          {ALPHABET.map((letter) => (
            <Link
              key={letter}
              href={`/markets/stocks?letter=${letter}`}
              className="flex h-7 w-7 items-center justify-center rounded border border-border text-xs text-text-secondary hover:border-accent-trust hover:text-accent-trust"
            >
              {letter}
            </Link>
          ))}
          <Link
            href="/markets/stocks"
            className="flex h-7 items-center justify-center rounded border border-border px-2 text-xs text-text-secondary hover:border-accent-trust hover:text-accent-trust"
          >
            Others
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs leading-relaxed text-text-tertiary lg:px-10">
          Trading and investing in the securities market involve risk, and algorithmic strategies can amplify
          losses as readily as gains. JestATP is a technology platform connecting to your own broker account;
          it does not hold client funds or securities. Please read all scheme-related and risk documents
          carefully before trading.
        </div>
      </div>
    </footer>
  );
}