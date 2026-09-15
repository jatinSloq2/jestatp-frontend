import clsx from 'clsx';
import { BrokerConnectionStatus, StrategyStatus } from '@/lib/api';

const toneByStatus: Record<BrokerConnectionStatus, string> = {
  connected: 'bg-pnl-positive/10 text-pnl-positive border-pnl-positive/30',
  pending: 'bg-risk-warning/10 text-risk-warning border-risk-warning/30',
  expired: 'bg-risk-warning/10 text-risk-warning border-risk-warning/30',
  error: 'bg-risk-critical/10 text-pnl-negative border-risk-critical/30',
  revoked: 'bg-surface-raised text-text-tertiary border-border-strong',
};

const labelByStatus: Record<BrokerConnectionStatus, string> = {
  connected: 'Connected',
  pending: 'Pending',
  expired: 'Expired',
  error: 'Error',
  revoked: 'Disconnected',
};

export function StatusBadge({ status }: { status: BrokerConnectionStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneByStatus[status],
      )}
    >
      {labelByStatus[status]}
    </span>
  );
}

const toneByStrategyStatus: Record<StrategyStatus, string> = {
  active: 'bg-pnl-positive/10 text-pnl-positive border-pnl-positive/30',
  draft: 'bg-surface-raised text-text-tertiary border-border-strong',
  paused: 'bg-risk-warning/10 text-risk-warning border-risk-warning/30',
  archived: 'bg-surface-raised text-text-tertiary border-border-strong',
};

const labelByStrategyStatus: Record<StrategyStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  paused: 'Paused',
  archived: 'Archived',
};

export function StrategyStatusBadge({ status }: { status: StrategyStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        toneByStrategyStatus[status],
      )}
    >
      {labelByStrategyStatus[status]}
    </span>
  );
}