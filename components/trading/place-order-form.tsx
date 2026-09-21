'use client';

import { useState } from 'react';
import { ApiError, BrokerName, OrderSegment, PlaceOrderInput } from '@/lib/api';
import { usePlaceOrder } from '@/lib/queries/useOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Banner } from '@/components/ui/banner';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';

const ORDER_TYPES: PlaceOrderInput['orderType'][] = ['MARKET', 'LIMIT', 'SL', 'SL-M'];
const PRODUCT_TYPES: PlaceOrderInput['productType'][] = ['MIS', 'CNC', 'NRML'];
const SEGMENTS: OrderSegment[] = ['equity', 'fno', 'currency', 'commodity'];

const EMPTY: Omit<PlaceOrderInput, 'broker'> = {
  segment: 'equity',
  tradingSymbol: '',
  exchange: 'NSE',
  side: 'BUY',
  orderType: 'MARKET',
  productType: 'MIS',
  quantity: 1,
};

/**
 * Places a real, one-off order with the broker (POST /orders ->
 * orderPlacement.service.ts — the same path liveEngine.ts uses for
 * automated strategy orders). Every submission goes through a confirmation
 * dialog that restates exactly what's about to happen in plain language —
 * this sends real money moving, so there's no "oops" click here.
 *
 * `initial` prefills the form (e.g. from an options-chain row); pass
 * `lockInstrument` alongside it to keep symbol/exchange/segment read-only
 * so a quick qty/price tweak can't accidentally end up ordering a different
 * contract than the one the person clicked.
 */
export function PlaceOrderForm({
  broker,
  initial,
  lockInstrument,
  onPlaced,
}: {
  broker: BrokerName;
  initial?: Partial<Omit<PlaceOrderInput, 'broker'>>;
  lockInstrument?: boolean;
  onPlaced?: () => void;
}) {
  const [form, setForm] = useState<Omit<PlaceOrderInput, 'broker'>>({ ...EMPTY, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const placeOrderMutation = usePlaceOrder();
  const { confirm, dialog } = useConfirmDialog();

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(null);
  }

  const needsPrice = form.orderType === 'LIMIT' || form.orderType === 'SL';
  const needsTrigger = form.orderType === 'SL' || form.orderType === 'SL-M';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const ok = await confirm({
      title: `${form.side} ${form.quantity} ${form.tradingSymbol || '—'}?`,
      description: (
        <>
          This places a real {form.orderType} order with {broker} — {form.productType}, {form.exchange}.
          {needsPrice ? ` Price: ₹${form.price ?? '—'}.` : ''}
          {needsTrigger ? ` Trigger: ₹${form.triggerPrice ?? '—'}.` : ''} This cannot be undone from here.
        </>
      ),
      confirmLabel: `Place ${form.side} order`,
      tone: form.side === 'BUY' ? 'default' : 'destructive',
    });
    if (!ok) return;

    try {
      const order = await placeOrderMutation.mutateAsync({ ...form, broker });
      setSuccess(`Order placed — ${order.status}${order.brokerOrderId ? ` (broker ref ${order.brokerOrderId})` : ''}.`);
      setForm((prev) => ({ ...EMPTY, ...initial, segment: prev.segment, exchange: prev.exchange, productType: prev.productType }));
      onPlaced?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not place the order.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {dialog}
      {error ? <Banner tone="negative">{error}</Banner> : null}
      {success ? <Banner tone="positive">{success}</Banner> : null}

      <div className="flex overflow-hidden rounded border border-border-strong text-sm">
        {(['BUY', 'SELL'] as const).map((side) => (
          <button
            key={side}
            type="button"
            onClick={() => set('side', side)}
            className={
              form.side === side
                ? side === 'BUY'
                  ? 'flex-1 bg-pnl-positive px-3 py-2 font-semibold text-white'
                  : 'flex-1 bg-risk-critical px-3 py-2 font-semibold text-white'
                : 'flex-1 bg-surface-raised px-3 py-2 font-medium text-text-secondary hover:bg-surface-sunken'
            }
          >
            {side}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Trading symbol"
          value={form.tradingSymbol}
          onChange={(e) => set('tradingSymbol', e.target.value.toUpperCase())}
          required
          placeholder="RELIANCE"
          disabled={lockInstrument}
        />
        <Input
          label="Exchange"
          value={form.exchange}
          onChange={(e) => set('exchange', e.target.value.toUpperCase())}
          required
          disabled={lockInstrument}
        />
        {lockInstrument ? (
          <Input label="Segment" value={form.segment} disabled />
        ) : (
          <Select
            label="Segment"
            value={form.segment}
            onChange={(v) => set('segment', v as OrderSegment)}
            options={SEGMENTS.map((s) => ({ value: s, label: s }))}
            searchable={false}
            allowCustomValue={false}
          />
        )}
        <Select
          label="Product"
          value={form.productType}
          onChange={(v) => set('productType', v as PlaceOrderInput['productType'])}
          options={PRODUCT_TYPES.map((p) => ({ value: p, label: p }))}
          searchable={false}
          allowCustomValue={false}
        />
        <Select
          label="Order type"
          value={form.orderType}
          onChange={(v) => set('orderType', v as PlaceOrderInput['orderType'])}
          options={ORDER_TYPES.map((t) => ({ value: t, label: t }))}
          searchable={false}
          allowCustomValue={false}
        />
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={form.quantity}
          onChange={(e) => set('quantity', Number(e.target.value))}
          required
        />
        {needsPrice ? (
          <Input
            label="Price"
            type="number"
            step="0.05"
            min={0}
            value={form.price ?? ''}
            onChange={(e) => set('price', Number(e.target.value))}
            required
          />
        ) : null}
        {needsTrigger ? (
          <Input
            label="Trigger price"
            type="number"
            step="0.05"
            min={0}
            value={form.triggerPrice ?? ''}
            onChange={(e) => set('triggerPrice', Number(e.target.value))}
            required
          />
        ) : null}
      </div>

      <Button
        type="submit"
        variant={form.side === 'BUY' ? 'primary' : 'destructive'}
        loading={placeOrderMutation.isPending}
        disabled={!form.tradingSymbol || !form.exchange}
      >
        {form.side === 'BUY' ? 'Buy' : 'Sell'} {form.tradingSymbol || ''}
      </Button>
    </form>
  );
}
