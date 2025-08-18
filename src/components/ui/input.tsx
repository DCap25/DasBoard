import * as React from 'react';

import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles with mobile-first responsive enhancements
          'flex h-11 sm:h-10 w-full rounded-md border-2 border-gray-400 bg-background px-4 sm:px-3 py-3 sm:py-2 text-base sm:text-sm ring-offset-background',
          // File input styling
          'file:border-0 file:bg-transparent file:text-base sm:file:text-sm file:font-medium',
          // Placeholder and focus styles
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Disabled state
          'disabled:cursor-not-allowed disabled:opacity-50',
          // Touch-friendly sizing on mobile
          'touch-manipulation', // Optimizes for touch input
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
