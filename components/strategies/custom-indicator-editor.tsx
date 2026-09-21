'use client';

import { useState } from 'react';
import {
  ApiError,
  CustomIndicator,
  CustomIndicatorInput,
  CustomIndicatorTestResult,
  DEFAULT_INDICATOR_TEMPLATE,
  Segment,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Banner } from '@/components/ui/banner';
import { BrokerSelect, useConnectedBrokers } from '@/components/trading/broker-picker';
import { INSTRUMENTS } from '@/lib/instruments';
import { PythonStrategyEditor } from './python-editor';
import { IndicatorPreviewChart } from './indicator-preview-chart';
import { useCreateCustomIndicator, useTestCustomIndicator, useUpdateCustomIndicator } from '@/lib/queries/useCustomIndicators';

const TIMEFRAMES = ['1m', '3m', '5m', '15m', '30m', '1h', '1d'] as const;

type ParamRow = { key: string; value: string };

function paramsToRows(params: Record<string, number | string>): ParamRow[] {
  const rows = Object.entries(params).map(([key, value]) => ({ key, value: String(value) }));
  return rows.length > 0 ? rows : [{ key: '', value: '' }];
}

function rowsToParams(rows: ParamRow[]): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const row of rows) {
    if (!row.key.trim()) continue;
    const numeric = Number(row.value);
    out[row.key.trim()] = row.value.trim() !== '' && !Number.isNaN(numeric) ? numeric : row.value;
  }
  return out;
}

/**
 * Create/edit a custom indicator: name/description, a params key-value
 * editor, the Python code editor (same component strategies use), and a
 * Validate/Test panel — the design doc's "Run Indicator Test" — that can
 * run against either a small synthetic series or real historical candles
 * from a connected broker.
 */
export function CustomIndicatorEditor({ existing, onSaved, onCancel }: { existing?: CustomIndicator; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [code, setCode] = useState(existing?.code ?? DEFAULT_INDICATOR_TEMPLATE);
  const [paramRows, setParamRows] = useState<ParamRow[]>(paramsToRows(existing?.params ?? {}));
  const [saveError, setSaveError] = useState<string | null>(null);

  const { connections, connectedBrokers, broker, setBroker } = useConnectedBrokers();
  const [segment, setSegment] = useState<Segment>('fno');
  const [instrument, setInstrument] = useState('NIFTY');
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('5m');
  const [testResult, setTestResult] = useState<CustomIndicatorTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const testMutation = useTestCustomIndicator();
  const createMutation = useCreateCustomIndicator();
  const updateMutation = useUpdateCustomIndicator();
  const saving = createMutation.isPending || updateMutation.isPending;

  const instrumentDef = INSTRUMENTS.find((i) => i.symbol === instrument && i.segment === segment);

  async function runTest(withRealData: boolean) {
    setTestError(null);
    setTestResult(null);
    try {
      const result = await testMutation.mutateAsync({
        code,
        params: rowsToParams(paramRows),
        ...(withRealData && broker
          ? { broker, instrument, exchange: instrumentDef?.exchange ?? 'NSE', segment, timeframe }
          : {}),
      });
      setTestResult(result);
    } catch (err) {
      setTestError(err instanceof ApiError ? err.message : 'Could not run the indicator.');
    }
  }

  async function handleSave() {
    setSaveError(null);
    const input: CustomIndicatorInput = { name, description: description || null, code, params: rowsToParams(paramRows) };
    try {
      if (existing) {
        await updateMutation.mutateAsync({ id: existing.id, input });
      } else {
        await createMutation.mutateAsync(input);
      }
      onSaved();
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Could not save this indicator.');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Adaptive Momentum" />
        <Input label="Description" value={description ?? ''} onChange={(e) => setDescription(e.target.value)} placeholder="Momentum based on EMA + ATR" />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-text-primary">Inputs</span>
          <button
            type="button"
            className="text-xs font-medium text-accent-trust hover:text-accent-trust-strong"
            onClick={() => setParamRows((rows) => [...rows, { key: '', value: '' }])}
          >
            + Add input
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {paramRows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                label="Input name"
                hideLabel
                value={row.key}
                onChange={(e) => setParamRows((rows) => rows.map((r, ri) => (ri === i ? { ...r, key: e.target.value } : r)))}
                placeholder="period"
              />
              <Input
                label="Default value"
                hideLabel
                value={row.value}
                onChange={(e) => setParamRows((rows) => rows.map((r, ri) => (ri === i ? { ...r, value: e.target.value } : r)))}
                placeholder="14"
              />
              <button
                type="button"
                onClick={() => setParamRows((rows) => rows.filter((_, ri) => ri !== i))}
                className="shrink-0 px-1 text-text-tertiary hover:text-risk-critical"
                aria-label="Remove input"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-text-primary">Calculation</span>
        <PythonStrategyEditor value={code} onChange={setCode} />
        <p className="mt-1.5 text-xs text-text-tertiary">
          Define <code className="font-mono">calculate(data, params)</code> returning one value (or <code className="font-mono">None</code>) per
          bar in <code className="font-mono">data[&quot;close&quot;]</code>.
        </p>
      </div>

      <div className="rounded border border-border-strong bg-surface-sunken p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-text-primary">Run Indicator Test</span>
          {connections && connectedBrokers.length > 0 ? (
            <>
              <BrokerSelect connections={connectedBrokers} value={broker} onChange={setBroker} />
              <Select
                label="Segment"
                hideLabel
                size="sm"
                searchable={false}
                allowCustomValue={false}
                value={segment}
                onChange={(v) => setSegment(v as Segment)}
                options={[
                  { value: 'fno', label: 'Index (F&O)' },
                  { value: 'equity', label: 'Equity' },
                ]}
              />
              <Select
                label="Instrument"
                hideLabel
                size="sm"
                value={instrument}
                onChange={setInstrument}
                options={INSTRUMENTS.filter((i) => i.segment === segment).map((i) => ({ value: i.symbol, label: i.symbol }))}
              />
              <Select
                label="Timeframe"
                hideLabel
                size="sm"
                searchable={false}
                allowCustomValue={false}
                value={timeframe}
                onChange={(v) => setTimeframe(v as (typeof TIMEFRAMES)[number])}
                options={TIMEFRAMES.map((t) => ({ value: t, label: t }))}
              />
            </>
          ) : null}
          <Button type="button" variant="secondary" loading={testMutation.isPending} onClick={() => runTest(false)}>
            Validate (sample data)
          </Button>
          {broker ? (
            <Button type="button" loading={testMutation.isPending} onClick={() => runTest(true)}>
              Test with live data
            </Button>
          ) : null}
        </div>

        {testError ? <Banner tone="negative">{testError}</Banner> : null}

        {testResult ? (
          <div className="flex flex-col gap-3">
            {testResult.usedSyntheticData ? (
              <p className="text-xs text-text-tertiary">Tested against a small synthetic sample series, not real market data.</p>
            ) : null}
            <IndicatorPreviewChart result={testResult} />
            <div className="flex gap-6 text-sm">
              <span>
                <span className="text-text-tertiary">Current: </span>
                <span className="font-mono font-medium text-text-primary">{testResult.currentValue?.toFixed(2) ?? '—'}</span>
              </span>
              <span>
                <span className="text-text-tertiary">Previous: </span>
                <span className="font-mono text-text-secondary">{testResult.previousValue?.toFixed(2) ?? '—'}</span>
              </span>
              <span>
                <span className="text-text-tertiary">Change: </span>
                <span className={`font-mono font-medium ${(testResult.change ?? 0) >= 0 ? 'text-pnl-positive' : 'text-pnl-negative'}`}>
                  {testResult.change !== null ? `${testResult.change >= 0 ? '+' : ''}${testResult.change.toFixed(2)}` : '—'}
                </span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {saveError ? <Banner tone="negative">{saveError}</Banner> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" loading={saving} disabled={!name.trim() || !code.trim()} onClick={handleSave}>
          {existing ? 'Save changes' : 'Save indicator'}
        </Button>
      </div>
    </div>
  );
}
