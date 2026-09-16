'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  /** Small secondary text shown next to the label, e.g. an exchange tag. */
  sublabel?: string;
}

interface SelectProps {
  /**
   * Accessible label. Always required, even when `hideLabel` is set — it's
   * what gets read to screen-reader users when the visible label is omitted.
   */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  /** If true (default), typing filters the list. If false, it behaves like a plain dropdown. */
  searchable?: boolean;
  /**
   * If true (default), a typed value that doesn't match any option is still
   * accepted on blur/Enter — useful for fields like "Instrument" where the
   * curated list is a helper, not an exhaustive source of truth.
   */
  allowCustomValue?: boolean;
  className?: string;
  /**
   * 'md' (default) is the standard full-size form field used on strategy
   * forms. 'sm' is a denser trigger for inline/toolbar use (condition
   * builder rows, table filters) — matches the h-9 controls around it.
   */
  size?: 'md' | 'sm';
  /**
   * Visually hides the label (kept for screen readers via sr-only) — for
   * spots where a neighboring label already describes the field, or where
   * there's no room for one (inline builder rows, toolbars).
   */
  hideLabel?: boolean;
  /**
   * Overrides the trigger's width classes. Defaults to full width; pass
   * e.g. 'w-auto min-w-[9rem]' for compact inline selects that should size
   * to their content instead of stretching.
   */
  triggerClassName?: string;
}

/**
 * A searchable dropdown ("combobox"): type to filter, click or use
 * arrow keys + Enter to pick. Replaces free-text `<input>`s where the value
 * should really come from a known list, and replaces native `<select>`s
 * where the option list is long enough that search helps.
 */
export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = 'Search…',
  error,
  hint,
  required,
  disabled,
  searchable = true,
  allowCustomValue = true,
  className,
  size = 'md',
  hideLabel = false,
  triggerClassName,
}: SelectProps) {
  const isSm = size === 'sm';
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);

  const selected = options.find((o) => o.value === value);

  // What the text box shows: the query while actively typing/open, otherwise the selected label (or raw value as a fallback for custom entries).
  const displayValue = open ? query : (selected?.label ?? value ?? '');

  const filtered = useMemo(() => {
    if (!searchable || !open || query.trim() === '') return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
  }, [options, query, open, searchable]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeAndCommit();
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open]);

  function openList() {
    if (disabled) return;
    setQuery('');
    setHighlighted(0);
    setOpen(true);
  }

  function closeAndCommit() {
    if (!open) return;
    setOpen(false);
    const trimmed = query.trim();
    if (trimmed === '') {
      setQuery('');
      return;
    }
    const exact = options.find((o) => o.label.toLowerCase() === trimmed.toLowerCase());
    if (exact) {
      onChange(exact.value);
    } else if (allowCustomValue) {
      onChange(trimmed);
    }
    setQuery('');
  }

  function pick(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlighted]) {
        pick(filtered[highlighted]);
      } else {
        closeAndCommit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div className={clsx('flex flex-col', isSm ? 'gap-1' : 'gap-1.5', className)} ref={rootRef}>
      <label htmlFor={id} className={clsx(hideLabel ? 'sr-only' : clsx('font-medium text-text-secondary', isSm ? 'text-xs' : 'text-sm'))}>
        {label}
        {required ? <span className="text-pnl-negative"> *</span> : null}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          placeholder={open ? placeholder : selected?.label ? undefined : placeholder}
          value={displayValue}
          onFocus={openList}
          onClick={openList}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlighted(0);
            if (!open) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={clsx(
            'rounded border bg-surface-sunken text-text-primary placeholder:text-text-tertiary',
            isSm ? 'h-9 px-2.5 pr-7 text-sm' : 'h-11 px-3.5 pr-9 text-base',
            triggerClassName ?? 'w-full',
            'transition-colors duration-150 ease-confident',
            'focus:outline-none focus:ring-2 focus:ring-accent-trust focus:ring-offset-2 focus:ring-offset-canvas',
            error ? 'border-risk-critical' : 'border-border-strong focus:border-accent-trust',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        />
        <svg
          className={clsx(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-tertiary transition-transform',
            isSm ? 'right-2 h-3.5 w-3.5' : 'right-3 h-4 w-4',
            open && 'rotate-180',
          )}
          viewBox="0 0 20 20"
          fill="none"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {open ? (
          <ul
            ref={listRef}
            role="listbox"
            className={clsx(
              'absolute z-20 mt-1 max-h-60 min-w-full overflow-y-auto overflow-x-hidden rounded border border-border-strong bg-surface-raised py-1 shadow-lg',
              isSm ? 'w-max' : 'w-full',
            )}
          >
            {filtered.length === 0 ? (
              <li className={clsx('text-text-tertiary', isSm ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm')}>
                {allowCustomValue ? 'No matches — press Enter to use this value as typed.' : 'No matches.'}
              </li>
            ) : (
              filtered.map((option, i) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={option.value === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(option);
                  }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={clsx(
                    'flex cursor-pointer flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5',
                    isSm ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
                    i === highlighted ? 'bg-accent-trust/10 text-text-primary' : 'text-text-secondary',
                    option.value === value && 'font-medium text-accent-trust',
                  )}
                >
                  <span className="min-w-0 flex-1 whitespace-normal break-words">{option.label}</span>
                  {option.sublabel ? (
                    <span className="shrink-0 whitespace-normal break-words text-xs text-text-tertiary">{option.sublabel}</span>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
      {error ? <p className="text-sm text-pnl-negative">{error}</p> : hint ? <p className="text-sm text-text-tertiary">{hint}</p> : null}
    </div>
  );
}