import * as React from 'react';
import { cn } from '../../lib/utils';

interface ProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

/**
 * A simple progress component that matches the Shadcn UI styling
 */
export function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: ProgressProps & React.HTMLAttributes<HTMLDivElement>) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className={cn('h-full bg-primary transition-all', indicatorClassName)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
