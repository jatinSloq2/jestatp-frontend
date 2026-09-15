'use client';

import { IndicatorCatalog, RiskConfig } from '@/lib/api';

const inputClass =
  'h-9 w-full rounded border border-border-strong bg-surface-sunken px-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-trust';
const selectClass = inputClass;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      {children}
      {hint ? <p className="text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

export function RiskConfigForm({
  value,
  onChange,
  catalog,
}: {
  value: RiskConfig;
  onChange: (v: RiskConfig) => void;
  catalog: IndicatorCatalog;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Capital allocated (₹)">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={value.capitalAllocated}
            onChange={(e) => onChange({ ...value, capitalAllocated: Number(e.target.value) })}
          />
        </Field>
        <Field label="Max loss / day (₹)">
          <input
            type="number"
            min={1}
            className={inputClass}
            value={value.maxLossPerDay}
            onChange={(e) => onChange({ ...value, maxLossPerDay: Number(e.target.value) })}
          />
        </Field>
        <Field label="Max positions">
          <input
            type="number"
            min={1}
            max={50}
            className={inputClass}
            value={value.maxPositions}
            onChange={(e) => onChange({ ...value, maxPositions: Number(e.target.value) })}
          />
        </Field>
        <Field label="Max trades / day">
          <input
            type="number"
            min={1}
            max={500}
            className={inputClass}
            value={value.maxTradesPerDay}
            onChange={(e) => onChange({ ...value, maxTradesPerDay: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Position sizing method">
          <div className="flex gap-2">
            <select
              className={selectClass}
              value={value.positionSizing.method}
              onChange={(e) =>
                onChange({ ...value, positionSizing: { ...value.positionSizing, method: e.target.value as any } })
              }
            >
              {catalog.positionSizingMethods.map((m) => (
                <option key={m} value={m}>
                  {m.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={value.positionSizing.value}
              onChange={(e) =>
                onChange({ ...value, positionSizing: { ...value.positionSizing, value: Number(e.target.value) } })
              }
            />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Stop loss">
          <div className="flex gap-2">
            <select
              className={selectClass}
              value={value.stopLoss.type}
              onChange={(e) => onChange({ ...value, stopLoss: { ...value.stopLoss, type: e.target.value as any } })}
            >
              {catalog.stopLossTargetTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="number"
              step={0.1}
              min={0}
              className={inputClass}
              value={value.stopLoss.value}
              onChange={(e) => onChange({ ...value, stopLoss: { ...value.stopLoss, value: Number(e.target.value) } })}
            />
          </div>
        </Field>

        <Field label="Target">
          <div className="flex gap-2">
            <select
              className={selectClass}
              value={value.target.type}
              onChange={(e) => onChange({ ...value, target: { ...value.target, type: e.target.value as any } })}
            >
              {catalog.stopLossTargetTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="number"
              step={0.1}
              min={0}
              className={inputClass}
              value={value.target.value}
              onChange={(e) => onChange({ ...value, target: { ...value.target, value: Number(e.target.value) } })}
            />
          </div>
        </Field>
      </div>

      <div className="rounded-lg border border-border bg-surface-sunken p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            checked={!!value.trailingStopLoss?.enabled}
            onChange={(e) =>
              onChange({
                ...value,
                trailingStopLoss: e.target.checked
                  ? { enabled: true, type: value.trailingStopLoss?.type ?? 'percent', value: value.trailingStopLoss?.value ?? 0.5 }
                  : undefined,
              })
            }
          />
          Trailing stop loss
        </label>
        {value.trailingStopLoss?.enabled ? (
          <div className="mt-3 flex gap-2">
            <select
              className={selectClass}
              value={value.trailingStopLoss.type}
              onChange={(e) =>
                onChange({ ...value, trailingStopLoss: { ...value.trailingStopLoss!, type: e.target.value as any } })
              }
            >
              {catalog.stopLossTargetTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="number"
              step={0.1}
              min={0}
              className={inputClass}
              value={value.trailingStopLoss.value}
              onChange={(e) =>
                onChange({ ...value, trailingStopLoss: { ...value.trailingStopLoss!, value: Number(e.target.value) } })
              }
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-border bg-surface-sunken p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <input
            type="checkbox"
            checked={!!value.timeBasedExit?.enabled}
            onChange={(e) =>
              onChange({
                ...value,
                timeBasedExit: e.target.checked
                  ? { enabled: true, exitTime: value.timeBasedExit?.exitTime ?? '15:15' }
                  : undefined,
              })
            }
          />
          Force-exit at a fixed time
        </label>
        {value.timeBasedExit?.enabled ? (
          <div className="mt-3">
            <input
              type="time"
              className={`${inputClass} w-32`}
              value={value.timeBasedExit.exitTime}
              onChange={(e) => onChange({ ...value, timeBasedExit: { ...value.timeBasedExit!, exitTime: e.target.value } })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}