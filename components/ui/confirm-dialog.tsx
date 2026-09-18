'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';

interface ConfirmOptions {
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    /** 'destructive' (default) renders the confirm button in the risk-critical red — for disconnect/archive/delete-style actions. 'default' uses the brand blue for non-destructive confirmations. */
    tone?: 'destructive' | 'default';
}

interface PendingConfirm extends ConfirmOptions {
    resolve: (value: boolean) => void;
}

/**
 * Drop-in async replacement for `window.confirm(...)`, styled to match the
 * app instead of the browser chrome.
 *
 * Usage:
 *   const { confirm, dialog } = useConfirmDialog();
 *   // once, near the top of the component's JSX: {dialog}
 *   async function handleDisconnect() {
 *     const ok = await confirm({ title: 'Disconnect broker?', tone: 'destructive' });
 *     if (!ok) return;
 *     ...
 *   }
 */
export function useConfirmDialog() {
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setPending({ ...options, resolve });
        });
    }, []);

    const settle = useCallback(
        (result: boolean) => {
            pending?.resolve(result);
            setPending(null);
        },
        [pending],
    );

    const dialog = (
        <ConfirmDialog
            open={pending !== null}
            title={pending?.title ?? ''}
            description={pending?.description}
            confirmLabel={pending?.confirmLabel}
            cancelLabel={pending?.cancelLabel}
            tone={pending?.tone}
            onConfirm={() => settle(true)}
            onCancel={() => settle(false)}
        />
    );

    return { confirm, dialog };
}

function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'destructive',
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    description?: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'destructive' | 'default';
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onCancel();
        }
        document.addEventListener('keydown', onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onCancel]);

    if (!mounted || !open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-text-primary/40 backdrop-blur-[1px]"
                onClick={onCancel}
                aria-hidden="true"
            />
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                aria-describedby={description ? 'confirm-dialog-description' : undefined}
                className="relative w-full max-w-sm animate-fade-up rounded-lg border border-border bg-surface p-6 shadow-panel"
            >
                <h2 id="confirm-dialog-title" className="text-lg font-semibold tracking-tight text-text-primary">
                    {title}
                </h2>
                {description ? (
                    <p id="confirm-dialog-description" className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {description}
                    </p>
                ) : null}
                <div className="mt-6 flex justify-end gap-2">
                    <Button ref={cancelRef} type="button" variant="secondary" size="md" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={tone === 'destructive' ? 'destructive' : 'primary'}
                        size="md"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}