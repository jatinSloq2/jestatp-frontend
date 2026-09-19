'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertRecord } from '@/lib/api';
import { useAcknowledgeAlert, useAlerts } from '@/lib/queries/useAlerts';
import { useUser } from '@/lib/useUser';

const severityStyles: Record<AlertRecord['severity'], string> = {
  critical: 'border-risk-critical/40 bg-risk-critical/10 text-pnl-negative',
  warning: 'border-risk-warning/40 bg-risk-warning/10 text-risk-warning',
  info: 'border-accent-trust/40 bg-accent-trust-soft text-accent-trust-strong',
};

function AlertCard({ alert }: { alert: AlertRecord }) {
  const acknowledgeMutation = useAcknowledgeAlert();
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <span className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs font-medium ${severityStyles[alert.severity]}`}>
          {alert.severity}
        </span>
        <p className="text-sm text-text-primary">{alert.message}</p>
        <span className="text-xs text-text-tertiary">
          {new Date(alert.createdAt).toLocaleString()}
          {alert.acknowledgedAt ? ` · Acknowledged ${new Date(alert.acknowledgedAt).toLocaleString()}` : ''}
        </span>
      </div>
      {!alert.acknowledgedAt ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          loading={acknowledgeMutation.isPending}
          onClick={() => acknowledgeMutation.mutate(alert.id)}
        >
          Acknowledge
        </Button>
      ) : null}
    </Card>
  );
}

export default function AlertsPage() {
  const { user } = useUser();
  const [onlyUnacknowledged, setOnlyUnacknowledged] = useState(true);
  const [page, setPage] = useState(1);
  const { alerts, meta, isLoading } = useAlerts({ unacknowledged: onlyUnacknowledged, page, limit: 20 });

  return (
    <DashboardShell user={user}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Alerts</h1>
            <p className="text-sm text-text-secondary">
              Events raised by your strategies — rejected live orders, stuck positions, and execution errors.
            </p>
          </div>
          <div className="flex overflow-hidden rounded border border-border-strong text-sm">
            <button
              type="button"
              onClick={() => {
                setOnlyUnacknowledged(true);
                setPage(1);
              }}
              className={onlyUnacknowledged ? 'bg-accent-trust px-3 py-1.5 font-medium text-white' : 'bg-surface-raised px-3 py-1.5 text-text-secondary'}
            >
              Unacknowledged
            </button>
            <button
              type="button"
              onClick={() => {
                setOnlyUnacknowledged(false);
                setPage(1);
              }}
              className={!onlyUnacknowledged ? 'bg-accent-trust px-3 py-1.5 font-medium text-white' : 'bg-surface-raised px-3 py-1.5 text-text-secondary'}
            >
              All
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-text-tertiary">Loading…</p>
        ) : alerts.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">
              {onlyUnacknowledged ? "No unacknowledged alerts — you're all caught up." : 'No alerts yet.'}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {meta && meta.totalPages > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <Button type="button" variant="secondary" size="md" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-sm text-text-tertiary">
              Page {meta.page} of {meta.totalPages}
            </span>
            <Button type="button" variant="secondary" size="md" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
