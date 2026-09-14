'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import clsx from 'clsx';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, error, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(''));
  };

  const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDigit(index, '');
      return;
    }
    const chars = raw.split('');
    chars.forEach((char, offset) => {
      if (index + offset < length) setDigit(index + offset, char);
    });
    const nextIndex = Math.min(index + chars.length, length - 1);
    refs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            aria-label={`Digit ${index + 1} of ${length}`}
            className={clsx(
              'h-14 w-12 rounded border bg-surface-sunken text-center font-mono text-xl font-medium text-text-primary',
              'transition-colors duration-150 ease-confident',
              'focus:outline-none focus:ring-2 focus:ring-accent-trust focus:ring-offset-2 focus:ring-offset-canvas',
              error ? 'border-risk-critical' : 'border-border-strong focus:border-accent-trust',
            )}
          />
        ))}
      </div>
      {error ? <p className="text-sm text-pnl-negative">{error}</p> : null}
    </div>
  );
}
