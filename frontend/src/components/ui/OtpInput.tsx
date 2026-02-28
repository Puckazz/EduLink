'use client';

import { useRef, useCallback, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, error, disabled }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, '').slice(0, 6).split('');

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus();
  }, []);

  const handleChange = (index: number, char: string) => {
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...digits];
    newDigits[index] = char;
    onChange(newDigits.join(''));

    if (char && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        handleChange(index, '');
      } else if (index > 0) {
        focusInput(index - 1);
        handleChange(index - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < 5) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, '').slice(0, 6));
      focusInput(Math.min(pasted.length, 5));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value.slice(-1))}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`h-14 w-12 rounded-lg border text-center text-lg font-semibold outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
