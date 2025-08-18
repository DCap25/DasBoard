/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    // Enhanced responsive breakpoints for mobile-first design
    screens: {
      'xs': '475px',      // Extra small devices (large phones)
      'sm': '640px',      // Small devices (tablets)
      'md': '768px',      // Medium devices (small laptops)
      'lg': '1024px',     // Large devices (desktops)
      'xl': '1280px',     // Extra large devices
      '2xl': '1536px',    // 2X large devices
      // Custom mobile-specific breakpoints
      'mobile': {'max': '767px'},           // Mobile-only styles
      'tablet': {'min': '768px', 'max': '1023px'}, // Tablet-only styles
      'desktop': {'min': '1024px'},         // Desktop and up
      // Touch device specific
      'touch': {'raw': '(hover: none) and (pointer: coarse)'},
      'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      // Orientation specific
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
      // High DPI screens
      'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        app: {
          DEFAULT: '#ffffff',
          dark: '#1a1a1a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Enhanced mobile-friendly spacing scale
      spacing: {
        '18': '4.5rem',   // 72px - Good for mobile touch targets
        '22': '5.5rem',   // 88px - Large mobile elements
        '88': '22rem',    // 352px - Mobile container widths
        '104': '26rem',   // 416px - Mobile max widths
        '128': '32rem',   // 512px - Tablet max widths
      },
      // Mobile-optimized font sizes with better scaling
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.05em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.05em' }],
        // Mobile-specific font sizes
        'mobile-xs': ['0.8rem', { lineHeight: '1.4' }],
        'mobile-sm': ['0.9rem', { lineHeight: '1.5' }],
        'mobile-base': ['1rem', { lineHeight: '1.6' }],
        'mobile-lg': ['1.1rem', { lineHeight: '1.5' }],
        'mobile-xl': ['1.2rem', { lineHeight: '1.4' }],
        // Touch-friendly button text
        'touch-sm': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        'touch-base': ['1rem', { lineHeight: '1.25', fontWeight: '500' }],
        'touch-lg': ['1.125rem', { lineHeight: '1.25', fontWeight: '500' }],
      },
      // Enhanced line heights for better mobile readability
      lineHeight: {
        'relaxed-mobile': '1.75',
        'loose-mobile': '2',
      },
      // Mobile-optimized max widths
      maxWidth: {
        'mobile': '100vw',
        'mobile-content': 'calc(100vw - 2rem)',
        'tablet': '768px',
        'desktop': '1024px',
      },
      // Minimum touch target sizes
      minHeight: {
        'touch': '44px',     // iOS recommended minimum
        'touch-lg': '48px',  // Android recommended minimum
        'touch-xl': '56px',  // Comfortable touch target
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
        'touch-xl': '56px',
      },
      // Mobile-safe z-index scale
      zIndex: {
        'mobile-nav': '1000',
        'mobile-overlay': '1100',
        'mobile-modal': '1200',
        'mobile-tooltip': '1300',
        'mobile-toast': '1400',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        // Mobile-specific animations
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Mobile-optimized animations
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      // Mobile-optimized transitions
      transitionDuration: {
        'mobile': '200ms',    // Fast for mobile interactions
        'mobile-slow': '300ms', // Slightly slower for complex animations
      },
      // Mobile-friendly backdrop blur
      backdropBlur: {
        'mobile': '8px',
        'mobile-lg': '12px',
      },
      // Enhanced box shadows for mobile depth
      boxShadow: {
        'mobile': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'mobile-lg': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'mobile-xl': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'touch': '0 2px 4px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'touch-lg': '0 4px 8px 0 rgba(0, 0, 0, 0.12), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for mobile-specific utilities
    function({ addUtilities }) {
      const newUtilities = {
        // Touch manipulation utilities
        '.touch-manipulation': {
          'touch-action': 'manipulation',
        },
        '.touch-pan-x': {
          'touch-action': 'pan-x',
        },
        '.touch-pan-y': {
          'touch-action': 'pan-y',
        },
        '.touch-pinch-zoom': {
          'touch-action': 'pinch-zoom',
        },
        '.touch-none': {
          'touch-action': 'none',
        },
        
        // Mobile-safe overflow utilities
        '.overflow-touch': {
          '-webkit-overflow-scrolling': 'touch',
          'overflow': 'auto',
        },
        '.overflow-x-touch': {
          '-webkit-overflow-scrolling': 'touch',
          'overflow-x': 'auto',
        },
        '.overflow-y-touch': {
          '-webkit-overflow-scrolling': 'touch',
          'overflow-y': 'auto',
        },
        
        // Text rendering optimizations for mobile
        '.text-render-mobile': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'text-rendering': 'optimizeLegibility',
        },
        
        // Prevent zoom on input focus (iOS)
        '.input-no-zoom': {
          'font-size': '16px',
          '@screen sm': {
            'font-size': '0.875rem',
          },
        },
        
        // Mobile-safe line clamping
        '.line-clamp-1': {
          'display': '-webkit-box',
          '-webkit-line-clamp': '1',
          '-webkit-box-orient': 'vertical',
          'overflow': 'hidden',
        },
        '.line-clamp-2': {
          'display': '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          'overflow': 'hidden',
        },
        '.line-clamp-3': {
          'display': '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          'overflow': 'hidden',
        },
        
        // Mobile-optimized aspect ratios
        '.aspect-mobile-card': {
          'aspect-ratio': '16 / 10',
        },
        '.aspect-mobile-banner': {
          'aspect-ratio': '5 / 2',
        },
        
        // Safe area insets for mobile devices
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-x': {
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        '.safe-y': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-all': {
          'padding-top': 'env(safe-area-inset-top)',
          'padding-bottom': 'env(safe-area-inset-bottom)',
          'padding-left': 'env(safe-area-inset-left)',
          'padding-right': 'env(safe-area-inset-right)',
        },
        
        // Mobile-friendly tap highlights
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.tap-highlight-blue': {
          '-webkit-tap-highlight-color': 'rgba(59, 130, 246, 0.3)',
        },
        
        // Mobile container utilities
        '.container-mobile': {
          'width': '100%',
          'max-width': '100vw',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'max-width': '640px',
            'margin-left': 'auto',
            'margin-right': 'auto',
          },
          '@screen md': {
            'max-width': '768px',
          },
          '@screen lg': {
            'max-width': '1024px',
          },
          '@screen xl': {
            'max-width': '1280px',
          },
        },
        
        // Mobile scrollbar styling
        '.scrollbar-mobile': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'rgba(156, 163, 175, 0.5) transparent',
          '&::-webkit-scrollbar': {
            'width': '6px',
            'height': '6px',
          },
          '&::-webkit-scrollbar-track': {
            'background': 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'rgba(156, 163, 175, 0.5)',
            'border-radius': '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background-color': 'rgba(156, 163, 175, 0.7)',
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};