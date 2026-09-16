'use client';

import { IndicatorCatalog, RiskConfig } from '@/lib/api';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

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
        <Input
          label="Capital allocated (₹)"
          uiSize="sm"
          type="number"
          min={1}
          value={value.capitalAllocated}
          onChange={(e) => onChange({ ...value, capitalAllocated: Number(e.target.value) })}
        />
        <Input
          label="Max loss / day (₹)"
          uiSize="sm"
          type="number"
          min={1}
          value={value.maxLossPerDay}
          onChange={(e) => onChange({ ...value, maxLossPerDay: Number(e.target.value) })}
        />
        <Input
          label="Max positions"
          uiSize="sm"
          type="number"
          min={1}
          max={50}
          value={value.maxPositions}
          onChange={(e) => onChange({ ...value, maxPositions: Number(e.target.value) })}
        />
        <Input
          label="Max trades / day"
          uiSize="sm"
          type="number"
          min={1}
          max={500}
          value={value.maxTradesPerDay}
          onChange={(e) => onChange({ ...value, maxTradesPerDay: Number(e.target.value) })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Position sizing method">
          <div className="flex gap-2">
            <Select
              label="Position sizing method"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-40"
              value={value.positionSizing.method}
              onChange={(v) =>
                onChange({ ...value, positionSizing: { ...value.positionSizing, method: v as any } })
              }
              options={catalog.positionSizingMethods.map((m) => ({ value: m, label: m.replace(/_/g, ' ') }))}
            />
            <Input
              label="Position sizing value"
              hideLabel
              uiSize="sm"
              type="number"
              min={0}
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
            <Select
              label="Stop loss type"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-32"
              value={value.stopLoss.type}
              onChange={(v) => onChange({ ...value, stopLoss: { ...value.stopLoss, type: v as any } })}
              options={catalog.stopLossTargetTypes.map((t) => ({ value: t, label: t }))}
            />
            <Input
              label="Stop loss value"
              hideLabel
              uiSize="sm"
              type="number"
              step={0.1}
              min={0}
              value={value.stopLoss.value}
              onChange={(e) => onChange({ ...value, stopLoss: { ...value.stopLoss, value: Number(e.target.value) } })}
            />
          </div>
        </Field>

        <Field label="Target">
          <div className="flex gap-2">
            <Select
              label="Target type"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-32"
              value={value.target.type}
              onChange={(v) => onChange({ ...value, target: { ...value.target, type: v as any } })}
              options={catalog.stopLossTargetTypes.map((t) => ({ value: t, label: t }))}
            />
            <Input
              label="Target value"
              hideLabel
              uiSize="sm"
              type="number"
              step={0.1}
              min={0}
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
            <Select
              label="Trailing stop loss type"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-32"
              value={value.trailingStopLoss.type}
              onChange={(v) =>
                onChange({ ...value, trailingStopLoss: { ...value.trailingStopLoss!, type: v as any } })
              }
              options={catalog.stopLossTargetTypes.map((t) => ({ value: t, label: t }))}
            />
            <Input
              label="Trailing stop loss value"
              hideLabel
              uiSize="sm"
              type="number"
              step={0.1}
              min={0}
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
            <Input
              label="Exit time"
              hideLabel
              uiSize="sm"
              type="time"
              widthClassName="w-32"
              value={value.timeBasedExit.exitTime}
              onChange={(e) => onChange({ ...value, timeBasedExit: { ...value.timeBasedExit!, exitTime: e.target.value } })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}