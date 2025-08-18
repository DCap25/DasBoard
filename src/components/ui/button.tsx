import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  // Base styles with mobile-first responsive enhancements
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-base sm:text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation', // Added touch-manipulation for better mobile performance
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95', // Added active state for mobile
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/95',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground active:bg-accent/95',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/90',
      },
      size: {
        // Enhanced mobile-friendly sizing
        default: 'h-11 sm:h-10 px-6 sm:px-4 py-3 sm:py-2', // Larger touch targets on mobile
        sm: 'h-10 sm:h-9 rounded-md px-4 sm:px-3 py-2',
        lg: 'h-12 sm:h-11 rounded-md px-8 py-3',
        icon: 'h-11 w-11 sm:h-10 sm:w-10', // Touch-friendly icon buttons
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
