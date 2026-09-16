'use client';

import {
  BreakoutCondition,
  CandlePatternCondition,
  Condition,
  ConditionBlock,
  ConditionOperand,
  CustomFormulaCondition,
  GroupCondition,
  IndicatorCatalog,
  IndicatorCondition,
  IndicatorName,
  IndicatorRef,
  MarketConditionCondition,
  Operator,
  PriceActionCondition,
  SupportResistanceCondition,
  TimeCondition,
  VolumeCondition,
} from '@/lib/api';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const OPERATOR_LABELS: Record<Operator, string> = {
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater or equal to',
  '<=': 'less or equal to',
  '==': 'equal to',
  '!=': 'not equal to',
  between: 'between',
  cross_above: 'crosses above',
  cross_below: 'crosses below',
};

const CONDITION_TYPE_LABELS: Record<Condition['type'], string> = {
  indicator: 'Indicator',
  candle_pattern: 'Candle pattern',
  price_action: 'Price action',
  volume: 'Volume',
  breakout: 'Breakout',
  support_resistance: 'Support / resistance',
  time: 'Time',
  market_condition: 'Market condition',
  custom_formula: 'Custom formula',
  group: 'Group (AND/OR)',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-text-tertiary">
      {label}
      {children}
    </label>
  );
}

function defaultConditionFor(type: Condition['type'], catalog: IndicatorCatalog): Condition {
  switch (type) {
    case 'indicator': {
      const spec = catalog.indicators[0];
      return {
        type: 'indicator',
        indicator: spec.name,
        params: Object.fromEntries(spec.params.map((p) => [p.name, p.default])),
        operator: '>',
        value: 0,
      };
    }
    case 'candle_pattern':
      return { type: 'candle_pattern', pattern: catalog.candlePatterns[0], lookback: 1 };
    case 'price_action':
      return { type: 'price_action', field: 'close', operator: '>', value: 0 };
    case 'volume':
      return { type: 'volume', operator: '>', compareTo: { type: 'average_volume', period: 20 } };
    case 'breakout':
      return { type: 'breakout', level: catalog.breakoutLevels[0], lookbackPeriod: 20, bufferPercent: 0.1 };
    case 'support_resistance':
      return { type: 'support_resistance', level: 'support', proximityPercent: 0.5 };
    case 'time':
      return { type: 'time', operator: 'after', value: '09:15' };
    case 'market_condition':
      return { type: 'market_condition', condition: catalog.marketConditions[0] };
    case 'custom_formula':
      return { type: 'custom_formula', formula: '' };
    case 'group':
      return { type: 'group', operator: 'AND', conditions: [defaultConditionFor('indicator', catalog)] };
  }
}

function IndicatorRefEditor({
  value,
  onChange,
  catalog,
}: {
  value: IndicatorRef;
  onChange: (v: IndicatorRef) => void;
  catalog: IndicatorCatalog;
}) {
  const spec = catalog.indicators.find((i) => i.name === value.indicator) ?? catalog.indicators[0];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        label="Indicator"
        hideLabel
        size="sm"
        searchable={false}
        allowCustomValue={false}
        triggerClassName="w-auto min-w-[8rem]"
        value={value.indicator}
        onChange={(v) => {
          const name = v as IndicatorName;
          const newSpec = catalog.indicators.find((i) => i.name === name)!;
          onChange({ indicator: name, params: Object.fromEntries(newSpec.params.map((p) => [p.name, p.default])) });
        }}
        options={catalog.indicators.map((i) => ({ value: i.name, label: i.name }))}
      />
      {spec.params.map((p) => (
        <Field key={p.name} label={p.name}>
          <Input
            label={p.name}
            hideLabel
            uiSize="sm"
            type="number"
            step={p.type === 'float' ? 0.1 : 1}
            min={p.min}
            max={p.max}
            widthClassName="w-16"
            value={value.params?.[p.name] ?? p.default}
            onChange={(e) => onChange({ ...value, params: { ...value.params, [p.name]: Number(e.target.value) } })}
          />
        </Field>
      ))}
    </div>
  );
}

function OperandEditor({
  operator,
  value,
  onChange,
  catalog,
}: {
  operator: Operator;
  value: ConditionOperand;
  onChange: (v: ConditionOperand) => void;
  catalog: IndicatorCatalog;
}) {
  if (operator === 'between') {
    const [lo, hi] = Array.isArray(value) ? value : [0, 0];
    return (
      <div className="flex items-center gap-2">
        <Input label="Lower bound" hideLabel uiSize="sm" type="number" widthClassName="w-24" value={lo} onChange={(e) => onChange([Number(e.target.value), hi])} />
        <span className="text-xs text-text-tertiary">and</span>
        <Input label="Upper bound" hideLabel uiSize="sm" type="number" widthClassName="w-24" value={hi} onChange={(e) => onChange([lo, Number(e.target.value)])} />
      </div>
    );
  }

  const isIndicatorRef = typeof value === 'object' && value !== null && !Array.isArray(value);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex overflow-hidden rounded border border-border-strong text-xs">
        <button
          type="button"
          onClick={() => onChange(0)}
          className={`px-2 py-1.5 ${!isIndicatorRef ? 'bg-accent-trust text-text-on-accent' : 'bg-surface-sunken text-text-tertiary'}`}
        >
          Number
        </button>
        <button
          type="button"
          onClick={() => onChange({ indicator: catalog.indicators[0].name })}
          className={`px-2 py-1.5 ${isIndicatorRef ? 'bg-accent-trust text-text-on-accent' : 'bg-surface-sunken text-text-tertiary'}`}
        >
          Indicator
        </button>
      </div>
      {isIndicatorRef ? (
        <IndicatorRefEditor value={value as IndicatorRef} onChange={onChange} catalog={catalog} />
      ) : (
        <Input
          label="Value"
          hideLabel
          uiSize="sm"
          type="number"
          widthClassName="w-24"
          value={typeof value === 'number' ? value : 0}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </div>
  );
}

function ConditionFields({
  condition,
  onChange,
  catalog,
  depth,
}: {
  condition: Condition;
  onChange: (c: Condition) => void;
  catalog: IndicatorCatalog;
  depth: number;
}) {
  switch (condition.type) {
    case 'indicator': {
      const c = condition as IndicatorCondition;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-tertiary">Indicator</span>
            <IndicatorRefEditor
              value={{ indicator: c.indicator, params: c.params }}
              onChange={(ref) => onChange({ ...c, indicator: ref.indicator, params: ref.params })}
              catalog={catalog}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-tertiary">is</span>
            <Select
              label="Operator"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-auto min-w-[9rem]"
              value={c.operator}
              onChange={(v) => onChange({ ...c, operator: v as Operator })}
              options={catalog.operators.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }))}
            />
            <OperandEditor operator={c.operator} value={c.value} onChange={(v) => onChange({ ...c, value: v })} catalog={catalog} />
          </div>
        </div>
      );
    }

    case 'price_action': {
      const c = condition as PriceActionCondition;
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Field label="Field">
            <Select
              label="Field"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-24"
              value={c.field}
              onChange={(v) => onChange({ ...c, field: v as any })}
              options={['open', 'high', 'low', 'close'].map((f) => ({ value: f, label: f }))}
            />
          </Field>
          <span className="text-xs text-text-tertiary">is</span>
          <Select
            label="Operator"
            hideLabel
            size="sm"
            searchable={false}
            allowCustomValue={false}
            triggerClassName="w-auto min-w-[9rem]"
            value={c.operator}
            onChange={(v) => onChange({ ...c, operator: v as Operator })}
            options={catalog.operators.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }))}
          />
          <OperandEditor operator={c.operator} value={c.value} onChange={(v) => onChange({ ...c, value: v })} catalog={catalog} />
        </div>
      );
    }

    case 'volume': {
      const c = condition as VolumeCondition;
      const isAvg = typeof c.compareTo === 'object';
      return (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-tertiary">Volume is</span>
          <Select
            label="Operator"
            hideLabel
            size="sm"
            searchable={false}
            allowCustomValue={false}
            triggerClassName="w-auto min-w-[9rem]"
            value={c.operator}
            onChange={(v) => onChange({ ...c, operator: v as Operator })}
            options={catalog.operators.map((op) => ({ value: op, label: OPERATOR_LABELS[op] }))}
          />
          <div className="flex overflow-hidden rounded border border-border-strong text-xs">
            <button
              type="button"
              onClick={() => onChange({ ...c, compareTo: 0 })}
              className={`px-2 py-1.5 ${!isAvg ? 'bg-accent-trust text-text-on-accent' : 'bg-surface-sunken text-text-tertiary'}`}
            >
              Fixed
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...c, compareTo: { type: 'average_volume', period: 20 } })}
              className={`px-2 py-1.5 ${isAvg ? 'bg-accent-trust text-text-on-accent' : 'bg-surface-sunken text-text-tertiary'}`}
            >
              Avg volume
            </button>
          </div>
          {isAvg ? (
            <Field label="over N candles">
              <Input
                label="Number of candles"
                hideLabel
                uiSize="sm"
                type="number"
                min={2}
                max={500}
                widthClassName="w-16"
                value={(c.compareTo as any).period}
                onChange={(e) => onChange({ ...c, compareTo: { type: 'average_volume', period: Number(e.target.value) } })}
              />
            </Field>
          ) : (
            <Input
              label="Volume"
              hideLabel
              uiSize="sm"
              type="number"
              widthClassName="w-24"
              value={c.compareTo as number}
              onChange={(e) => onChange({ ...c, compareTo: Number(e.target.value) })}
            />
          )}
        </div>
      );
    }

    case 'candle_pattern': {
      const c = condition as CandlePatternCondition;
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Field label="Pattern">
            <Select
              label="Pattern"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-auto min-w-[9rem]"
              value={c.pattern}
              onChange={(v) => onChange({ ...c, pattern: v as any })}
              options={catalog.candlePatterns.map((p) => ({ value: p, label: p.replace(/_/g, ' ') }))}
            />
          </Field>
          <Field label="Lookback candles">
            <Input
              label="Lookback candles"
              hideLabel
              uiSize="sm"
              type="number"
              min={1}
              max={20}
              widthClassName="w-16"
              value={c.lookback ?? 1}
              onChange={(e) => onChange({ ...c, lookback: Number(e.target.value) })}
            />
          </Field>
        </div>
      );
    }

    case 'breakout': {
      const c = condition as BreakoutCondition;
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Field label="Level">
            <Select
              label="Level"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-auto min-w-[8rem]"
              value={c.level}
              onChange={(v) => onChange({ ...c, level: v as any })}
              options={catalog.breakoutLevels.map((l) => ({ value: l, label: l }))}
            />
          </Field>
          <Field label="Lookback period">
            <Input
              label="Lookback period"
              hideLabel
              uiSize="sm"
              type="number"
              min={2}
              max={500}
              widthClassName="w-16"
              value={c.lookbackPeriod}
              onChange={(e) => onChange({ ...c, lookbackPeriod: Number(e.target.value) })}
            />
          </Field>
          <Field label="Buffer %">
            <Input
              label="Buffer %"
              hideLabel
              uiSize="sm"
              type="number"
              step={0.1}
              min={0}
              max={10}
              widthClassName="w-16"
              value={c.bufferPercent ?? 0}
              onChange={(e) => onChange({ ...c, bufferPercent: Number(e.target.value) })}
            />
          </Field>
        </div>
      );
    }

    case 'support_resistance': {
      const c = condition as SupportResistanceCondition;
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Field label="Level">
            <Select
              label="Level"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-28"
              value={c.level}
              onChange={(v) => onChange({ ...c, level: v as any })}
              options={[
                { value: 'support', label: 'support' },
                { value: 'resistance', label: 'resistance' },
              ]}
            />
          </Field>
          <Field label="Proximity %">
            <Input
              label="Proximity %"
              hideLabel
              uiSize="sm"
              type="number"
              step={0.1}
              min={0}
              max={10}
              widthClassName="w-16"
              value={c.proximityPercent}
              onChange={(e) => onChange({ ...c, proximityPercent: Number(e.target.value) })}
            />
          </Field>
        </div>
      );
    }

    case 'time': {
      const c = condition as TimeCondition;
      const isBetween = c.operator === 'between';
      return (
        <div className="flex flex-wrap items-center gap-2">
          <Field label="When">
            <Select
              label="When"
              hideLabel
              size="sm"
              searchable={false}
              allowCustomValue={false}
              triggerClassName="w-28"
              value={c.operator}
              onChange={(v) => {
                const op = v as TimeCondition['operator'];
                onChange({ ...c, operator: op, value: op === 'between' ? ['09:15', '15:15'] : '09:15' } as TimeCondition);
              }}
              options={[
                { value: 'before', label: 'before' },
                { value: 'after', label: 'after' },
                { value: 'between', label: 'between' },
              ]}
            />
          </Field>
          {isBetween ? (
            <>
              <Input
                label="From time"
                hideLabel
                uiSize="sm"
                type="time"
                widthClassName="w-28"
                value={(c.value as [string, string])[0]}
                onChange={(e) => onChange({ ...c, value: [e.target.value, (c.value as [string, string])[1]] })}
              />
              <span className="text-xs text-text-tertiary">and</span>
              <Input
                label="To time"
                hideLabel
                uiSize="sm"
                type="time"
                widthClassName="w-28"
                value={(c.value as [string, string])[1]}
                onChange={(e) => onChange({ ...c, value: [(c.value as [string, string])[0], e.target.value] })}
              />
            </>
          ) : (
            <Input
              label="Time"
              hideLabel
              uiSize="sm"
              type="time"
              widthClassName="w-28"
              value={c.value as string}
              onChange={(e) => onChange({ ...c, value: e.target.value })}
            />
          )}
        </div>
      );
    }

    case 'market_condition': {
      const c = condition as MarketConditionCondition;
      return (
        <Field label="Market is">
          <Select
            label="Market is"
            hideLabel
            size="sm"
            searchable={false}
            allowCustomValue={false}
            triggerClassName="w-auto min-w-[9rem]"
            value={c.condition}
            onChange={(v) => onChange({ ...c, condition: v as any })}
            options={catalog.marketConditions.map((m) => ({ value: m, label: m.replace(/_/g, ' ') }))}
          />
        </Field>
      );
    }

    case 'custom_formula': {
      const c = condition as CustomFormulaCondition;
      return (
        <div className="flex flex-col gap-1.5">
          <Input
            label="Formula"
            hideLabel
            uiSize="sm"
            type="text"
            widthClassName="w-full min-w-[10rem]"
            placeholder="e.g. close - open > 0"
            value={c.formula}
            onChange={(e) => onChange({ ...c, formula: e.target.value })}
          />
          <p className="text-xs text-text-tertiary">Numbers, +-*/, comparisons, and parentheses only.</p>
        </div>
      );
    }

    case 'group': {
      const c = condition as GroupCondition;
      return (
        <ConditionListEditor
          conditions={c.conditions}
          combinator={c.operator}
          onCombinatorChange={(operator) => onChange({ ...c, operator })}
          onConditionsChange={(conditions) => onChange({ ...c, conditions })}
          catalog={catalog}
          depth={depth + 1}
        />
      );
    }
  }
}

function CombinatorToggle({ value, onChange }: { value: 'AND' | 'OR'; onChange: (v: 'AND' | 'OR') => void }) {
  return (
    <div className="flex overflow-hidden rounded border border-border-strong text-xs font-medium">
      {(['AND', 'OR'] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1.5 ${value === opt ? 'bg-accent-trust text-text-on-accent' : 'bg-surface-sunken text-text-tertiary'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function AddConditionMenu({ onAdd }: { onAdd: (type: Condition['type']) => void }) {
  return (
    <Select
      label="Add condition"
      hideLabel
      size="sm"
      searchable={false}
      allowCustomValue={false}
      triggerClassName="mt-3 w-full sm:w-auto sm:min-w-[12rem]"
      placeholder="+ Add condition…"
      value=""
      onChange={(v) => {
        if (v) onAdd(v as Condition['type']);
      }}
      options={Object.entries(CONDITION_TYPE_LABELS).map(([type, label]) => ({ value: type, label }))}
    />
  );
}

function ConditionRow({
  condition,
  onChange,
  onRemove,
  catalog,
  depth,
}: {
  condition: Condition;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  catalog: IndicatorCatalog;
  depth: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <Select
          label="Condition type"
          hideLabel
          size="sm"
          searchable={false}
          allowCustomValue={false}
          triggerClassName="w-auto min-w-[10rem]"
          value={condition.type}
          onChange={(v) => onChange(defaultConditionFor(v as Condition['type'], catalog))}
          options={Object.entries(CONDITION_TYPE_LABELS).map(([type, label]) => ({ value: type, label }))}
        />
        <button type="button" onClick={onRemove} className="text-xs font-medium text-text-tertiary hover:text-pnl-negative">
          Remove
        </button>
      </div>
      <ConditionFields condition={condition} onChange={onChange} catalog={catalog} depth={depth} />
    </div>
  );
}

function ConditionListEditor({
  conditions,
  combinator,
  onCombinatorChange,
  onConditionsChange,
  catalog,
  depth,
}: {
  conditions: Condition[];
  combinator: 'AND' | 'OR';
  onCombinatorChange: (c: 'AND' | 'OR') => void;
  onConditionsChange: (conditions: Condition[]) => void;
  catalog: IndicatorCatalog;
  depth: number;
}) {
  function updateAt(index: number, next: Condition) {
    const copy = conditions.slice();
    copy[index] = next;
    onConditionsChange(copy);
  }
  function removeAt(index: number) {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  }
  function add(type: Condition['type']) {
    onConditionsChange([...conditions, defaultConditionFor(type, catalog)]);
  }

  return (
    <div className={depth > 0 ? 'rounded-lg border border-dashed border-border-strong bg-surface-sunken p-3' : ''}>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-text-tertiary">Match</span>
        <CombinatorToggle value={combinator} onChange={onCombinatorChange} />
        <span className="text-xs font-medium text-text-tertiary">of the following:</span>
      </div>
      <div className="flex flex-col gap-3">
        {conditions.map((c, i) => (
          <ConditionRow key={i} condition={c} onChange={(next) => updateAt(i, next)} onRemove={() => removeAt(i)} catalog={catalog} depth={depth} />
        ))}
        {conditions.length === 0 ? <p className="text-sm text-text-tertiary">No conditions yet.</p> : null}
      </div>
      <AddConditionMenu onAdd={add} />
    </div>
  );
}

export function ConditionBlockEditor({
  block,
  onChange,
  catalog,
}: {
  block: ConditionBlock;
  onChange: (block: ConditionBlock) => void;
  catalog: IndicatorCatalog;
}) {
  return (
    <ConditionListEditor
      conditions={block.conditions}
      combinator={block.logic ?? 'AND'}
      onCombinatorChange={(logic) => onChange({ ...block, logic })}
      onConditionsChange={(conditions) => onChange({ ...block, conditions })}
      catalog={catalog}
      depth={0}
    />
  );
}