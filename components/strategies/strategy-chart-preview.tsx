'use client';

import { useMemo } from 'react';
import { Condition, ConditionBlock } from '@/lib/api';

// ─────────────────────────── plain-English condition summary ───────────────────────────

function describeCondition(c: Condition): string {
    switch (c.type) {
        case 'indicator': {
            const val = Array.isArray(c.value)
                ? `${c.value[0]}–${c.value[1]}`
                : typeof c.value === 'object'
                    ? c.value.indicator
                    : c.value;
            return `${c.indicator} ${opWord(c.operator)} ${val}`;
        }
        case 'candle_pattern':
            return `${c.pattern.replace(/_/g, ' ')} candle forms`;
        case 'price_action': {
            const val = Array.isArray(c.value) ? `${c.value[0]}–${c.value[1]}` : typeof c.value === 'object' ? c.value.indicator : c.value;
            return `${c.field} ${opWord(c.operator)} ${val}`;
        }
        case 'volume':
            return `volume ${opWord(c.operator)} ${typeof c.compareTo === 'object' ? `${c.compareTo.period}-period avg volume` : c.compareTo}`;
        case 'breakout':
            return `price breaks ${c.level} of last ${c.lookbackPeriod} bars`;
        case 'support_resistance':
            return `price within ${c.proximityPercent}% of ${c.level}`;
        case 'time':
            return Array.isArray(c.value) ? `time between ${c.value[0]}–${c.value[1]}` : `time ${c.operator} ${c.value}`;
        case 'market_condition':
            return c.condition.replace(/_/g, ' ');
        case 'custom_formula':
            return c.formula;
        case 'group':
            return c.conditions.map(describeCondition).join(` ${c.operator} `);
        default:
            return 'condition';
    }
}

function opWord(op: string): string {
    switch (op) {
        case 'cross_above':
            return 'crosses above';
        case 'cross_below':
            return 'crosses below';
        case '>':
            return '>';
        case '<':
            return '<';
        case '>=':
            return '\u2265';
        case '<=':
            return '\u2264';
        case '==':
            return '=';
        case '!=':
            return '\u2260';
        case 'between':
            return 'between';
        default:
            return op;
    }
}

function describeBlock(block: ConditionBlock | undefined): string {
    if (!block || block.conditions.length === 0) return 'No conditions set yet';
    const logic = block.logic ?? 'AND';
    return block.conditions.map(describeCondition).join(` ${logic} `);
}

// ─────────────────────────── seeded, deterministic sample candles ───────────────────────────

function seededRandom(seed: string) {
    let h = 1779033703 ^ seed.length;
    for (let i = 0; i < seed.length; i++) {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    };
}

interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
}

function buildCandles(seed: string, count: number): Candle[] {
    const rand = seededRandom(seed);
    const candles: Candle[] = [];
    let price = 100;
    for (let i = 0; i < count; i++) {
        const drift = Math.sin(i / 4) * 1.2; // gentle wave so there are visible swings to hang markers on
        const noise = (rand() - 0.5) * 3;
        const open = price;
        const close = open + drift + noise;
        const high = Math.max(open, close) + rand() * 1.5;
        const low = Math.min(open, close) - rand() * 1.5;
        candles.push({ open, high, low, close });
        price = close;
    }
    return candles;
}

/** Picks illustrative entry points at local dips and exit points a few bars later at local peaks — a "buy the dip, sell the rise" pattern used purely to show marker placement, not a real signal engine. */
function pickTrades(candles: Candle[]) {
    const entries: number[] = [];
    const exits: number[] = [];
    let i = 2;
    while (i < candles.length - 4) {
        const isLocalDip = candles[i].close < candles[i - 1].close && candles[i].close < candles[i + 1].close;
        if (isLocalDip) {
            entries.push(i);
            const exitIdx = Math.min(i + 3 + Math.round(seededRandom(String(i))() * 2), candles.length - 1);
            exits.push(exitIdx);
            i = exitIdx + 2;
        } else {
            i++;
        }
    }
    return { entries, exits };
}

export function StrategyChartPreview({
    entry,
    exit,
    instrument,
}: {
    entry: ConditionBlock;
    exit: ConditionBlock;
    instrument: string;
}) {
    const width = 720;
    const height = 220;
    const padding = { top: 16, bottom: 16, left: 8, right: 8 };
    const count = 28;

    const candles = useMemo(() => buildCandles(instrument || 'strategy', count), [instrument]);
    const { entries, exits } = useMemo(() => pickTrades(candles), [candles]);

    const min = Math.min(...candles.map((c) => c.low));
    const max = Math.max(...candles.map((c) => c.high));
    const range = Math.max(max - min, 1);
    const chartH = height - padding.top - padding.bottom;
    const slotW = (width - padding.left - padding.right) / count;
    const candleW = Math.max(slotW * 0.55, 3);

    function y(v: number) {
        return padding.top + chartH - ((v - min) / range) * chartH;
    }
    function x(i: number) {
        return padding.left + i * slotW + slotW / 2;
    }

    return (
        <div className="flex flex-col gap-3 rounded border border-border-strong bg-surface-sunken p-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
                {candles.map((c, i) => {
                    const bullish = c.close >= c.open;
                    const color = bullish ? 'var(--color-pnl-positive, #16a34a)' : 'var(--color-pnl-negative, #dc2626)';
                    return (
                        <g key={i}>
                            <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
                            <rect
                                x={x(i) - candleW / 2}
                                y={y(Math.max(c.open, c.close))}
                                width={candleW}
                                height={Math.max(Math.abs(y(c.open) - y(c.close)), 1)}
                                fill={color}
                            />
                        </g>
                    );
                })}

                {entries.map((i) => (
                    <g key={`e${i}`} transform={`translate(${x(i)}, ${y(candles[i].low) + 14})`}>
                        <path d="M -5 -8 L 5 -8 L 0 0 Z" fill="var(--color-accent-trust, #2563eb)" transform="rotate(180)" />
                        <polygon points="0,0 -5,8 5,8" fill="var(--color-accent-trust, #2563eb)" />
                    </g>
                ))}
                {exits.map((i) => (
                    <g key={`x${i}`} transform={`translate(${x(i)}, ${y(candles[i].high) - 14})`}>
                        <polygon points="0,0 -5,-8 5,-8" fill="#f59e0b" />
                    </g>
                ))}
            </svg>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,0 0,10 10,10" fill="#2563eb" /></svg>
                    Entry (buy)
                </span>
                <span className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="5,10 0,0 10,0" fill="#f59e0b" /></svg>
                    Exit (sell)
                </span>
            </div>

            <div className="flex flex-col gap-1 border-t border-border-strong pt-3 text-sm">
                <p>
                    <span className="font-medium text-text-secondary">Entry when: </span>
                    <span className="text-text-tertiary">{describeBlock(entry)}</span>
                </p>
                <p>
                    <span className="font-medium text-text-secondary">Exit when: </span>
                    <span className="text-text-tertiary">{describeBlock(exit)}</span>
                </p>
            </div>

            <p className="text-xs italic text-text-tertiary">
                Illustrative preview only — sample price action used to show roughly where entries and exits would fall,
                not a backtest against real market data.
            </p>
        </div>
    );
}