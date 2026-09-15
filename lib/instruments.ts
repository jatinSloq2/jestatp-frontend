import { Segment } from './strategy-types';

export interface InstrumentDef {
    symbol: string;
    name: string;
    segment: Segment;
    exchange: string; // default exchange for this instrument
}

/**
 * A curated, editable list of common NSE/BSE/MCX instruments so the
 * strategy form can offer "type to search, pick from a list" instead of a
 * free-text box. This is a UI convenience, not a live instrument master —
 * the underlying `instrument`/`exchange` fields are still plain strings, so
 * picking something not in this list (e.g. a newly listed stock) still
 * works via the select's "use as typed" fallback.
 */
export const INSTRUMENTS: InstrumentDef[] = [
    // Indices (mainly traded via F&O)
    { symbol: 'NIFTY', name: 'Nifty 50', segment: 'fno', exchange: 'NFO' },
    { symbol: 'BANKNIFTY', name: 'Nifty Bank', segment: 'fno', exchange: 'NFO' },
    { symbol: 'FINNIFTY', name: 'Nifty Financial Services', segment: 'fno', exchange: 'NFO' },
    { symbol: 'MIDCPNIFTY', name: 'Nifty Midcap Select', segment: 'fno', exchange: 'NFO' },
    { symbol: 'SENSEX', name: 'BSE Sensex', segment: 'fno', exchange: 'BFO' },
    { symbol: 'BANKEX', name: 'BSE Bankex', segment: 'fno', exchange: 'BFO' },

    // Large-cap equities (NSE cash)
    { symbol: 'RELIANCE', name: 'Reliance Industries', segment: 'equity', exchange: 'NSE' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', segment: 'equity', exchange: 'NSE' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', segment: 'equity', exchange: 'NSE' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', segment: 'equity', exchange: 'NSE' },
    { symbol: 'INFY', name: 'Infosys', segment: 'equity', exchange: 'NSE' },
    { symbol: 'SBIN', name: 'State Bank of India', segment: 'equity', exchange: 'NSE' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', segment: 'equity', exchange: 'NSE' },
    { symbol: 'ITC', name: 'ITC', segment: 'equity', exchange: 'NSE' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', segment: 'equity', exchange: 'NSE' },
    { symbol: 'LT', name: 'Larsen & Toubro', segment: 'equity', exchange: 'NSE' },
    { symbol: 'AXISBANK', name: 'Axis Bank', segment: 'equity', exchange: 'NSE' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', segment: 'equity', exchange: 'NSE' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance', segment: 'equity', exchange: 'NSE' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki', segment: 'equity', exchange: 'NSE' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', segment: 'equity', exchange: 'NSE' },
    { symbol: 'WIPRO', name: 'Wipro', segment: 'equity', exchange: 'NSE' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', segment: 'equity', exchange: 'NSE' },
    { symbol: 'TATASTEEL', name: 'Tata Steel', segment: 'equity', exchange: 'NSE' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', segment: 'equity', exchange: 'NSE' },
    { symbol: 'TITAN', name: 'Titan Company', segment: 'equity', exchange: 'NSE' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises', segment: 'equity', exchange: 'NSE' },
    { symbol: 'NTPC', name: 'NTPC', segment: 'equity', exchange: 'NSE' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp', segment: 'equity', exchange: 'NSE' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', segment: 'equity', exchange: 'NSE' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel', segment: 'equity', exchange: 'NSE' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', segment: 'equity', exchange: 'NSE' },
    { symbol: 'NESTLEIND', name: 'Nestle India', segment: 'equity', exchange: 'NSE' },

    // Currency
    { symbol: 'USDINR', name: 'US Dollar / Indian Rupee', segment: 'currency', exchange: 'CDS' },
    { symbol: 'EURINR', name: 'Euro / Indian Rupee', segment: 'currency', exchange: 'CDS' },
    { symbol: 'GBPINR', name: 'British Pound / Indian Rupee', segment: 'currency', exchange: 'CDS' },
    { symbol: 'JPYINR', name: 'Japanese Yen / Indian Rupee', segment: 'currency', exchange: 'CDS' },

    // Commodity
    { symbol: 'GOLD', name: 'Gold', segment: 'commodity', exchange: 'MCX' },
    { symbol: 'SILVER', name: 'Silver', segment: 'commodity', exchange: 'MCX' },
    { symbol: 'CRUDEOIL', name: 'Crude Oil', segment: 'commodity', exchange: 'MCX' },
    { symbol: 'NATURALGAS', name: 'Natural Gas', segment: 'commodity', exchange: 'MCX' },
    { symbol: 'COPPER', name: 'Copper', segment: 'commodity', exchange: 'MCX' },
];

/** Exchanges valid for each segment — used to constrain the Exchange select once a Segment is picked. */
export const EXCHANGES_BY_SEGMENT: Record<Segment, { value: string; label: string }[]> = {
    equity: [
        { value: 'NSE', label: 'NSE — National Stock Exchange' },
        { value: 'BSE', label: 'BSE — Bombay Stock Exchange' },
    ],
    fno: [
        { value: 'NFO', label: 'NFO — NSE Futures & Options' },
        { value: 'BFO', label: 'BFO — BSE Futures & Options' },
    ],
    currency: [
        { value: 'CDS', label: 'CDS — NSE Currency Derivatives' },
        { value: 'BCD', label: 'BCD — BSE Currency Derivatives' },
    ],
    commodity: [{ value: 'MCX', label: 'MCX — Multi Commodity Exchange' }],
};

export function instrumentsForSegment(segment: Segment): InstrumentDef[] {
    return INSTRUMENTS.filter((i) => i.segment === segment);
}