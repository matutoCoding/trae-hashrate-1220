import { cn } from '@/lib/utils';
import type { SelectHTMLAttributes, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: ReactNode;
  error?: string;
}

export default function Select({
  label,
  children,
  error,
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
