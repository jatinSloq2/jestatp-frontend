'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banner } from '@/components/ui/banner';
import { Select } from '@/components/ui/select';
import { ConditionBlockEditor } from './condition-editor';
import { RiskConfigForm } from './risk-config-form';
import { StrategyBacktestPanel } from './strategy-backtest-panel';
import { ApiError, IndicatorCatalog, Segment, StrategyInput, ValidationResult } from '@/lib/api';
import { EXCHANGES_BY_SEGMENT, instrumentsForSegment } from '@/lib/instruments';
import { useValidateStrategy } from '@/lib/queries/useStrategies';

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

  function set<K extends keyof StrategyInput>(key: K, value: StrategyInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
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
          <div className="sm:w-64">
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
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Entry conditions</h2>
          <ConditionBlockEditor block={input.entry} onChange={(entry) => set('entry', entry)} catalog={catalog} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Exit conditions</h2>
          <ConditionBlockEditor block={input.exit} onChange={(exit) => set('exit', exit)} catalog={catalog} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-tertiary">Backtest preview</h2>
          <StrategyBacktestPanel
            instrument={input.instrument}
            exchange={input.exchange}
            segment={input.segment ?? 'equity'}
            timeframe={input.timeframe}
            entry={input.entry}
            exit={input.exit}
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