'use client';

import { useRef, useState } from 'react';
import clsx from 'clsx';

const DEFAULT_STRATEGY_TEMPLATE = `def on_bar(ctx):
    # ctx gives you: ctx.close/open/high/low/volume,
    # ctx.sma/ema/rsi/atr/vwap(period, offset=0) - offset=1 means "one bar back",
    # ctx.macd()/.bbands()/.stochastic()/.supertrend() (each returns a small object, e.g. ctx.macd().line),
    # ctx.custom("your indicator name") for a saved Custom Indicator,
    # ctx.position (None when flat), ctx.state (persisted across calls), ctx.params.
    # crossed_above(a_now, b_now, a_prev, b_prev) / crossed_below(...) helpers are also available.
    if ctx.sma(20) is None or ctx.sma(50) is None:
        return None  # not enough history yet

    if ctx.position is None and ctx.sma(20) > ctx.sma(50):
        return Signal.buy()

    if ctx.position is not None and ctx.sma(20) < ctx.sma(50):
        return Signal.exit()

    return None
`;

/**
 * Plain-textarea code editor for the Python strategy sandbox (see
 * jestatp-sandbox-service/app/sdk/contract.py for what `on_bar` can do).
 * Deliberately not Monaco/CodeMirror for now — this keeps the frontend
 * dependency-free and the bundle small; swap in a real editor component
 * here later for syntax highlighting/autocomplete without touching
 * anything that calls PythonStrategyEditor, since the props are just
 * `value`/`onChange`.
 */
export function PythonStrategyEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const el = e.currentTarget;
    const { selectionStart, selectionEnd } = el;
    const next = value.slice(0, selectionStart) + '    ' + value.slice(selectionEnd);
    onChange(next);
    // Restore cursor position after the inserted indent — React controls
    // the value, so this has to happen on the next tick post-render.
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = selectionStart + 4;
    });
  }

  const lineCount = value.split('\n').length;

  return (
    <div
      className={clsx(
        'flex overflow-hidden rounded border bg-surface-sunken font-mono text-sm',
        focused ? 'border-accent-trust' : 'border-border-strong',
      )}
    >
      <div
        aria-hidden
        className="select-none border-r border-border-strong bg-surface-raised px-2 py-3 text-right text-text-tertiary"
        style={{ lineHeight: '1.5rem' }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        spellCheck={false}
        placeholder={DEFAULT_STRATEGY_TEMPLATE}
        className="min-h-[320px] flex-1 resize-y bg-transparent px-3 py-3 text-text-primary outline-none disabled:opacity-60"
        style={{ lineHeight: '1.5rem', tabSize: 4 }}
      />
    </div>
  );
}

export { DEFAULT_STRATEGY_TEMPLATE };
