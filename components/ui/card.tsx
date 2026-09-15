import clsx from 'clsx';

export function Card({
    title,
    description,
    children,
    className,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={clsx('rounded-lg border border-border bg-surface p-6 shadow-panel', className)}>
            {title ? <h2 className="text-lg font-semibold tracking-tight text-text-primary">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-text-secondary">{description}</p> : null}
            <div className={title || description ? 'mt-5' : undefined}>{children}</div>
        </div>
    );
}