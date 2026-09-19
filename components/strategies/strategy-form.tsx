'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banner } from '@/components/ui/banner';
import { Select } from '@/components/ui/select';
import { ConditionBlockEditor } from './condition-editor';
import { RiskConfigForm } from './risk-config-form';
import { StrategyBacktestPanel } from './strategy-backtest-panel';
import { PythonStrategyEditor, DEFAULT_STRATEGY_TEMPLATE } from './python-editor';
import { ApiError, IndicatorCatalog, Segment, StrategyInput, StrategyLanguage, ValidationResult } from '@/lib/api';
import { EXCHANGES_BY_SEGMENT, instrumentsForSegment } from '@/lib/instruments';
import { useValidateStrategy } from '@/lib/queries/useStrategies';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';

const SEGMENT_OPTIONS: { value: Segment; label: string }[] = [
  { value: 'equity', label: 'Equity — cash market' },
  { value: 'fno', label: 'F&O — futures & options' },
  { value: 'currency', label: 'Currency derivatives' },
  { value: 'commodity', label: 'Commodity' },
];

export function StrategyForm({
  initial,
  catalog,
  submitLabel,
  disabled,
  disabledReason,
  onSubmit,
}: {
  initial: StrategyInput;
  catalog: IndicatorCatalog;
  submitLabel: string;
  disabled?: boolean;
  disabledReason?: string;
  onSubmit: (input: StrategyInput) => Promise<void>;
}) {
  const [input, setInput] = useState<StrategyInput>(initial);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const validateMutation = useValidateStrategy();
  const { connections, connectedBrokers, loading: brokersLoading } = useConnectedBrokers();
  const language: StrategyLanguage = input.language ?? 'dsl';

  function set<K extends keyof StrategyInput>(key: K, value: StrategyInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function setLanguage(next: StrategyLanguage) {
    // Switching language starts that side's payload fresh rather than
    // carrying over the other language's fields — mirrors the backend's
    // assertLanguagePayload, which rejects entry/exit alongside pythonCode.
    setInput((prev) => ({
      ...prev,
      language: next,
      entry: next === 'python' ? undefined : prev.entry ?? { conditions: [], logic: 'AND' },
      exit: next === 'python' ? undefined : prev.exit ?? { conditions: [], logic: 'AND' },
      pythonCode: next === 'python' ? prev.pythonCode ?? DEFAULT_STRATEGY_TEMPLATE : undefined,
    }));
    setValidation(null);
  }

  async function handleValidate() {
    setError(null);
    try {
      const result = await validateMutation.mutateAsync(input);
      setValidation(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not validate. Try again.');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await validateMutation.mutateAsync(input);
      setValidation(result);
      if (!result.valid) {
        setError('Fix the validation issues below before saving.');
        return;
      }
      await onSubmit(input);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this strategy. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {disabled && disabledReason ? <Banner tone="warning">{disabledReason}</Banner> : null}
      {error ? <Banner tone="negative">{error}</Banner> : null}

      <fieldset disabled={disabled} className="flex flex-col gap-8 disabled:opacity-60">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Strategy details</h2>
          <Input label="Name" value={input.name} onChange={(e) => set('name', e.target.value)} required maxLength={150} />
          <Input
            label="Description (optional)"
            value={input.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            maxLength={1000}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Select
              label="Segment"
              required
              value={input.segment ?? 'equity'}
              onChange={(v) => {
                const segment = v as Segment;
                set('segment', segment);
                // Keep exchange valid for the newly picked segment instead of
                // silently carrying over one that no longer applies.
                const validExchanges = EXCHANGES_BY_SEGMENT[segment]?.map((e) => e.value) ?? [];
                if (!validExchanges.includes(input.exchange)) {
                  set('exchange', validExchanges[0] ?? '');
                }
              }}
              options={SEGMENT_OPTIONS}
              searchable={false}
              allowCustomValue={false}
            />
            <Select
              label="Instrument"
              required
              value={input.instrument}
              onChange={(v) => {
                set('instrument', v);
                // Picking a known instrument fills in its usual exchange automatically.
                const match = instrumentsForSegment(input.segment ?? 'equity').find((i) => i.symbol === v);
                if (match) set('exchange', match.exchange);
              }}
              options={instrumentsForSegment(input.segment ?? 'equity').map((i) => ({
                value: i.symbol,
                label: i.symbol,
                sublabel: i.name,
              }))}
              placeholder="Search e.g. NIFTY, RELIANCE…"
              hint="Pick from the list, or type your own symbol."
            />
            <Select
              label="Exchange"
              required
              value={input.exchange}
              onChange={(v) => set('exchange', v.toUpperCase())}
              options={EXCHANGES_BY_SEGMENT[input.segment ?? 'equity'] ?? []}
              searchable={false}
            />
            <Select
              label="Timeframe"
              required
              value={input.timeframe}
              onChange={(v) => set('timeframe', v as any)}
              options={catalog.timeframes.map((t) => ({ value: t, label: t }))}
              searchable={false}
              allowCustomValue={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:w-fit">
            {connections ? (
              <BrokerSelect connections={connectedBrokers} value={input.broker ?? null} onChange={(b) => set('broker', b)} />
            ) : null}
            <Select
              label="Execution mode"
              value={input.executionMode ?? 'paper'}
              onChange={(v) => set('executionMode', v as any)}
              options={[
                { value: 'paper', label: 'Paper (simulated)' },
                { value: 'live', label: 'Live (real orders)' },
              ]}
              searchable={false}
              allowCustomValue={false}
            />
            <Select
              label="Product type"
              value={input.productType ?? 'MIS'}
              onChange={(v) => set('productType', v as any)}
              options={[
                { value: 'MIS', label: 'MIS (intraday)' },
                { value: 'CNC', label: 'CNC (delivery)' },
                { value: 'NRML', label: 'NRML (F&O carry-forward)' },
              ]}
              searchable={false}
              allowCustomValue={false}
              hint="Live/paper orders always use MARKET orders with this product type."
            />
          </div>
          {!brokersLoading && connectedBrokers.length === 0 ? (
            <Banner tone="warning">Connect a broker before saving — a strategy needs to know which account to trade through.</Banner>
          ) : null}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Strategy logic</h2>
            <div className="flex overflow-hidden rounded border border-border-strong text-sm">
              {(['dsl', 'python'] as StrategyLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={
                    language === lang
                      ? 'bg-accent-trust px-3 py-1.5 font-medium text-white'
                      : 'bg-surface-raised px-3 py-1.5 text-text-secondary hover:bg-surface-sunken'
                  }
                >
                  {lang === 'dsl' ? 'Builder (no-code)' : 'Python'}
                </button>
              ))}
            </div>
          </div>

          {language === 'python' ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-text-tertiary">
                Write an <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs">on_bar(ctx)</code> function that
                returns <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs">Signal.buy()</code>,{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs">Signal.exit()</code>, or{' '}
                <code className="rounded bg-surface-sunken px-1 py-0.5 font-mono text-xs">None</code>. Runs in an isolated sandbox — no
                filesystem or network access.
              </p>
              <PythonStrategyEditor value={input.pythonCode ?? DEFAULT_STRATEGY_TEMPLATE} onChange={(code) => set('pythonCode', code)} />
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Entry conditions</h3>
                <ConditionBlockEditor
                  block={input.entry ?? { conditions: [], logic: 'AND' }}
                  onChange={(entry) => set('entry', entry)}
                  catalog={catalog}
                />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Exit conditions</h3>
                <ConditionBlockEditor
                  block={input.exit ?? { conditions: [], logic: 'AND' }}
                  onChange={(exit) => set('exit', exit)}
                  catalog={catalog}
                />
              </div>
            </>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Backtest preview</h2>
          <StrategyBacktestPanel
            instrument={input.instrument}
            exchange={input.exchange}
            segment={input.segment ?? 'equity'}
            timeframe={input.timeframe}
            language={language}
            entry={input.entry}
            exit={input.exit}
            pythonCode={input.pythonCode}
            risk={input.risk}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Risk management</h2>
          <RiskConfigForm value={input.risk} onChange={(risk) => set('risk', risk)} catalog={catalog} />
        </section>
      </fieldset>

      {validation ? (
        <div>
          {validation.valid ? (
            <Banner tone="positive">Strategy JSON is valid.</Banner>
          ) : (
            <Banner tone="negative">
              <div className="flex flex-col gap-1.5">
                <span className="font-medium">Found {validation.issues.length} issue(s):</span>
                <ul className="list-disc pl-5">
                  {validation.issues.map((issue, i) => (
                    <li key={i}>
                      <span className="font-mono text-xs text-pnl-negative">{issue.path}</span> — {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            </Banner>
          )}
        </div>
      ) : null}

      {!disabled ? (
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleValidate} loading={validateMutation.isPending}>
            Validate
          </Button>
          <Button type="submit" loading={saving}>
            {submitLabel}
          </Button>
        </div>
      ) : null}
    </form>
  );
}