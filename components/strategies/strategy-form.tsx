'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Banner } from '@/components/ui/banner';
import { ConditionBlockEditor } from './condition-editor';
import { RiskConfigForm } from './risk-config-form';
import { api, ApiError, IndicatorCatalog, Segment, StrategyInput, ValidationResult } from '@/lib/api';

const selectClass =
  'h-11 w-full rounded border border-border-strong bg-surface-sunken px-3.5 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-trust';

const SEGMENTS: Segment[] = ['equity', 'fno', 'currency', 'commodity'];

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
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof StrategyInput>(key: K, value: StrategyInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleValidate() {
    setError(null);
    setValidating(true);
    try {
      const result = await api.validateStrategy(input);
      setValidation(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not validate. Try again.');
    } finally {
      setValidating(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await api.validateStrategy(input);
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
            <Input label="Instrument" value={input.instrument} onChange={(e) => set('instrument', e.target.value)} required />
            <Input
              label="Exchange"
              value={input.exchange}
              onChange={(e) => set('exchange', e.target.value.toUpperCase())}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Segment</label>
              <select className={selectClass} value={input.segment ?? 'equity'} onChange={(e) => set('segment', e.target.value as Segment)}>
                {SEGMENTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Timeframe</label>
              <select className={selectClass} value={input.timeframe} onChange={(e) => set('timeframe', e.target.value as any)}>
                {catalog.timeframes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 sm:w-64">
            <label className="text-sm font-medium text-text-secondary">Execution mode</label>
            <select
              className={selectClass}
              value={input.executionMode ?? 'paper'}
              onChange={(e) => set('executionMode', e.target.value as any)}
            >
              <option value="paper">Paper (simulated)</option>
              <option value="live">Live (real orders)</option>
            </select>
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
          <Button type="button" variant="secondary" onClick={handleValidate} loading={validating}>
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