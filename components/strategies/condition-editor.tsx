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

const selectClass =
  'h-9 rounded border border-border-strong bg-surface-sunken px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-trust';
const numberClass =
  'h-9 w-24 rounded border border-border-strong bg-surface-sunken px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-trust';
const textClass =
  'h-9 flex-1 min-w-[10rem] rounded border border-border-strong bg-surface-sunken px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-trust';

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
      <select
        className={selectClass}
        value={value.indicator}
        onChange={(e) => {
          const name = e.target.value as IndicatorName;
          const newSpec = catalog.indicators.find((i) => i.name === name)!;
          onChange({ indicator: name, params: Object.fromEntries(newSpec.params.map((p) => [p.name, p.default])) });
        }}
      >
        {catalog.indicators.map((i) => (
          <option key={i.name} value={i.name}>
            {i.name}
          </option>
        ))}
      </select>
      {spec.params.map((p) => (
        <Field key={p.name} label={p.name}>
          <input
            type="number"
            step={p.type === 'float' ? 0.1 : 1}
            min={p.min}
            max={p.max}
            value={value.params?.[p.name] ?? p.default}
            onChange={(e) => onChange({ ...value, params: { ...value.params, [p.name]: Number(e.target.value) } })}
            className={numberClass.replace('w-24', 'w-16')}
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
        <input type="number" className={numberClass} value={lo} onChange={(e) => onChange([Number(e.target.value), hi])} />
        <span className="text-xs text-text-tertiary">and</span>
        <input type="number" className={numberClass} value={hi} onChange={(e) => onChange([lo, Number(e.target.value)])} />
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
        <input
          type="number"
          className={numberClass}
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
            <select className={selectClass} value={c.operator} onChange={(e) => onChange({ ...c, operator: e.target.value as Operator })}>
              {catalog.operators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_LABELS[op]}
                </option>
              ))}
            </select>
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
            <select className={selectClass} value={c.field} onChange={(e) => onChange({ ...c, field: e.target.value as any })}>
              {['open', 'high', 'low', 'close'].map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Field>
          <span className="text-xs text-text-tertiary">is</span>
          <select className={selectClass} value={c.operator} onChange={(e) => onChange({ ...c, operator: e.target.value as Operator })}>
            {catalog.operators.map((op) => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </select>
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
          <select className={selectClass} value={c.operator} onChange={(e) => onChange({ ...c, operator: e.target.value as Operator })}>
            {catalog.operators.map((op) => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </select>
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
              <input
                type="number"
                min={2}
                max={500}
                className={numberClass.replace('w-24', 'w-16')}
                value={(c.compareTo as any).period}
                onChange={(e) => onChange({ ...c, compareTo: { type: 'average_volume', period: Number(e.target.value) } })}
              />
            </Field>
          ) : (
            <input
              type="number"
              className={numberClass}
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
            <select className={selectClass} value={c.pattern} onChange={(e) => onChange({ ...c, pattern: e.target.value as any })}>
              {catalog.candlePatterns.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lookback candles">
            <input
              type="number"
              min={1}
              max={20}
              className={numberClass.replace('w-24', 'w-16')}
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
            <select className={selectClass} value={c.level} onChange={(e) => onChange({ ...c, level: e.target.value as any })}>
              {catalog.breakoutLevels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lookback period">
            <input
              type="number"
              min={2}
              max={500}
              className={numberClass.replace('w-24', 'w-16')}
              value={c.lookbackPeriod}
              onChange={(e) => onChange({ ...c, lookbackPeriod: Number(e.target.value) })}
            />
          </Field>
          <Field label="Buffer %">
            <input
              type="number"
              step={0.1}
              min={0}
              max={10}
              className={numberClass.replace('w-24', 'w-16')}
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
            <select className={selectClass} value={c.level} onChange={(e) => onChange({ ...c, level: e.target.value as any })}>
              <option value="support">support</option>
              <option value="resistance">resistance</option>
            </select>
          </Field>
          <Field label="Proximity %">
            <input
              type="number"
              step={0.1}
              min={0}
              max={10}
              className={numberClass.replace('w-24', 'w-16')}
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
            <select
              className={selectClass}
              value={c.operator}
              onChange={(e) => {
                const op = e.target.value as TimeCondition['operator'];
                onChange({ ...c, operator: op, value: op === 'between' ? ['09:15', '15:15'] : '09:15' } as TimeCondition);
              }}
            >
              <option value="before">before</option>
              <option value="after">after</option>
              <option value="between">between</option>
            </select>
          </Field>
          {isBetween ? (
            <>
              <input
                type="time"
                className={textClass.replace('flex-1 min-w-[10rem]', 'w-28')}
                value={(c.value as [string, string])[0]}
                onChange={(e) => onChange({ ...c, value: [e.target.value, (c.value as [string, string])[1]] })}
              />
              <span className="text-xs text-text-tertiary">and</span>
              <input
                type="time"
                className={textClass.replace('flex-1 min-w-[10rem]', 'w-28')}
                value={(c.value as [string, string])[1]}
                onChange={(e) => onChange({ ...c, value: [(c.value as [string, string])[0], e.target.value] })}
              />
            </>
          ) : (
            <input
              type="time"
              className={textClass.replace('flex-1 min-w-[10rem]', 'w-28')}
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
          <select className={selectClass} value={c.condition} onChange={(e) => onChange({ ...c, condition: e.target.value as any })}>
            {catalog.marketConditions.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </Field>
      );
    }

    case 'custom_formula': {
      const c = condition as CustomFormulaCondition;
      return (
        <div className="flex flex-col gap-1.5">
          <input
            type="text"
            className={textClass}
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
    <select
      className={`${selectClass} mt-3 w-full sm:w-auto`}
      value=""
      onChange={(e) => {
        if (e.target.value) onAdd(e.target.value as Condition['type']);
        e.target.value = '';
      }}
    >
      <option value="">+ Add condition…</option>
      {Object.entries(CONDITION_TYPE_LABELS).map(([type, label]) => (
        <option key={type} value={type}>
          {label}
        </option>
      ))}
    </select>
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
        <select
          className={selectClass}
          value={condition.type}
          onChange={(e) => onChange(defaultConditionFor(e.target.value as Condition['type'], catalog))}
        >
          {Object.entries(CONDITION_TYPE_LABELS).map(([type, label]) => (
            <option key={type} value={type}>
              {label}
            </option>
          ))}
        </select>
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