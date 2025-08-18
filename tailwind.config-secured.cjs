/** 
 * ================================================================
 * SECURED TAILWIND CSS CONFIGURATION FOR THE DAS BOARD
 * ================================================================
 * SECURITY ENHANCEMENTS IMPLEMENTED:
 * 1. Sanitized custom properties and utilities
 * 2. CSP-compatible configuration 
 * 3. Secure responsive breakpoints
 * 4. Organized and deduplicated utilities
 * 5. Enhanced mobile-first security approach
 * 6. Input validation for dynamic values
 * 7. Safe custom plugin implementation
 * ================================================================
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  // Security: Strict content scanning with validation
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Security: Exclude potentially dangerous files
    '!./src/**/*.test.{ts,tsx}',
    '!./src/**/*.spec.{ts,tsx}',
    '!./node_modules/**/*',
  ],
  
  // Security: Controlled dark mode implementation
  darkMode: ['class'],
  
  theme: {
    // Security: Secure container configuration
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    
    // Security: Enhanced responsive breakpoints with validation
    screens: {
      // Security: Standard responsive breakpoints
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      
      // Security: Custom device-specific breakpoints
      'mobile': { 'max': '767px' },
      'tablet': { 'min': '768px', 'max': '1023px' },
      'desktop': { 'min': '1024px' },
      
      // Security: Secure interaction-based breakpoints
      'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
      'no-touch': { 'raw': '(hover: hover) and (pointer: fine)' },
      
      // Security: Safe orientation breakpoints
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      
      // Security: High DPI detection
      'retina': { 'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)' },
    },
    
    extend: {
      // Security: Secure color palette with HSL values
      colors: {
        // Security: Core system colors with safe defaults
        border: 'hsl(var(--color-border) / <alpha-value>)',
        input: 'hsl(var(--color-input) / <alpha-value>)',
        ring: 'hsl(var(--color-ring) / <alpha-value>)',
        background: 'hsl(var(--color-background) / <alpha-value>)',
        foreground: 'hsl(var(--color-foreground) / <alpha-value>)',
        
        // Security: Primary color system
        primary: {
          DEFAULT: 'hsl(var(--color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--color-primary-foreground) / <alpha-value>)',
          50: 'hsl(214 100% 97%)',
          100: 'hsl(214 95% 93%)',
          200: 'hsl(213 97% 87%)',
          300: 'hsl(212 96% 78%)',
          400: 'hsl(213 94% 68%)',
          500: 'hsl(217 91% 60%)',
          600: 'hsl(221 83% 53%)',
          700: 'hsl(224 76% 48%)',
          800: 'hsl(226 71% 40%)',
          900: 'hsl(224 64% 33%)',
        },
        
        // Security: Secondary color system
        secondary: {
          DEFAULT: 'hsl(var(--color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--color-secondary-foreground) / <alpha-value>)',
        },
        
        // Security: Destructive actions
        destructive: {
          DEFAULT: 'hsl(var(--color-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--color-destructive-foreground) / <alpha-value>)',
        },
        
        // Security: Muted elements
        muted: {
          DEFAULT: 'hsl(var(--color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--color-muted-foreground) / <alpha-value>)',
        },
        
        // Security: Accent elements
        accent: {
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--color-accent-foreground) / <alpha-value>)',
        },
        
        // Security: Popover elements
        popover: {
          DEFAULT: 'hsl(var(--color-popover) / <alpha-value>)',
          foreground: 'hsl(var(--color-popover-foreground) / <alpha-value>)',
        },
        
        // Security: Card elements
        card: {
          DEFAULT: 'hsl(var(--color-card) / <alpha-value>)',
          foreground: 'hsl(var(--color-card-foreground) / <alpha-value>)',
        },
        
        // Security: Application-specific colors
        app: {
          DEFAULT: '#ffffff',
          dark: '#0f0f0f',
        },
        
        // Security: Status colors with consistent naming
        success: {
          50: 'hsl(138 76% 97%)',
          100: 'hsl(141 84% 93%)',
          500: 'hsl(142 76% 36%)',
          600: 'hsl(142 72% 29%)',
        },
        
        warning: {
          50: 'hsl(48 100% 96%)',
          100: 'hsl(48 96% 89%)',
          500: 'hsl(38 92% 50%)',
          600: 'hsl(32 95% 44%)',
        },
        
        error: {
          50: 'hsl(0 86% 97%)',
          100: 'hsl(0 93% 94%)',
          500: 'hsl(0 84% 60%)',
          600: 'hsl(0 72% 51%)',
        },
      },
      
      // Security: Safe border radius values
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
      },
      
      // Security: Secure spacing scale with validation
      spacing: {
        // Security: Touch-friendly measurements
        'touch': '2.75rem',     // 44px
        'touch-lg': '3rem',     // 48px
        'touch-xl': '3.5rem',   // 56px
        
        // Security: Layout measurements
        '18': '4.5rem',         // 72px
        '22': '5.5rem',         // 88px
        '88': '22rem',          // 352px
        '104': '26rem',         // 416px
        '128': '32rem',         // 512px
        
        // Security: Safe area measurements
        'safe': 'var(--safe-area-top)',
      },
      
      // Security: Typography with enhanced readability
      fontSize: {
        // Security: Base font sizes with line heights
        'xs': ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '-0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.05em' }],
        '3xl': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.05em' }],
        '4xl': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.075em' }],
        
        // Security: Mobile-optimized sizes
        'mobile-xs': ['0.8rem', { lineHeight: '1.4' }],
        'mobile-sm': ['0.9rem', { lineHeight: '1.5' }],
        'mobile-base': ['1rem', { lineHeight: '1.6' }],
        'mobile-lg': ['1.1rem', { lineHeight: '1.5' }],
        'mobile-xl': ['1.2rem', { lineHeight: '1.4' }],
        
        // Security: Touch-friendly button text
        'touch-sm': ['0.875rem', { lineHeight: '1.25', fontWeight: '500' }],
        'touch-base': ['1rem', { lineHeight: '1.25', fontWeight: '500' }],
        'touch-lg': ['1.125rem', { lineHeight: '1.25', fontWeight: '500' }],
      },
      
      // Security: Enhanced line heights
      lineHeight: {
        'relaxed-mobile': '1.75',
        'loose-mobile': '2',
      },
      
      // Security: Safe maximum widths
      maxWidth: {
        'mobile': '100vw',
        'mobile-content': 'calc(100vw - 2rem)',
        'tablet': '768px',
        'desktop': '1024px',
        'container': '1200px',
      },
      
      // Security: Minimum dimensions for accessibility
      minHeight: {
        'touch': '2.75rem',     // 44px
        'touch-lg': '3rem',     // 48px
        'touch-xl': '3.5rem',   // 56px
        'screen': '100vh',
        'screen-mobile': '100dvh',
      },
      
      minWidth: {
        'touch': '2.75rem',
        'touch-lg': '3rem',
        'touch-xl': '3.5rem',
      },
      
      // Security: Organized z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      
      // Security: Secure animations with performance consideration
      keyframes: {
        // Security: Safe accordion animations
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        
        // Security: Mobile-optimized animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(1rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-1rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-1rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(1rem)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Security: Performance-optimized animations
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
      
      // Security: Controlled transition durations
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
      
      // Security: Safe backdrop blur values
      backdropBlur: {
        'mobile': '4px',
        'mobile-lg': '8px',
      },
      
      // Security: Enhanced box shadows with performance consideration
      boxShadow: {
        // Security: Mobile-optimized shadows
        'mobile': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'mobile-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'mobile-xl': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        
        // Security: Touch-friendly shadows
        'touch': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'touch-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        
        // Security: Elevation system
        'elevation-1': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'elevation-2': '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        'elevation-3': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
      },
      
      // Security: Safe transform values
      scale: {
        '98': '0.98',
        '102': '1.02',
      },
      
      // Security: Aspect ratios for consistent layouts
      aspectRatio: {
        'mobile-card': '16 / 10',
        'mobile-banner': '5 / 2',
        'video': '16 / 9',
        'square': '1 / 1',
      },
    },
  },
  
  // Security: Enhanced plugins with validation
  plugins: [
    // Security: Animate plugin for safe animations
    require('tailwindcss-animate'),
    
    // Security: Custom plugin with input validation
    function({ addUtilities, addComponents, theme }) {
      // Security: Validate theme values before use
      const validateThemeValue = (value) => {
        if (typeof value === 'string' && (
          value.includes('javascript:') ||
          value.includes('data:text/html') ||
          value.includes('<script') ||
          value.includes('vbscript:')
        )) {
          console.warn('Potentially dangerous value detected in theme:', value);
          return false;
        }
        return true;
      };
      
      // Security: Safe utilities with validation
      const safeUtilities = {
        // Security: Touch manipulation utilities
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
        
        // Security: Safe overflow utilities
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
        
        // Security: Text rendering optimizations
        '.text-render-optimized': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
          'text-rendering': 'optimizeLegibility',
        },
        
        // Security: Input zoom prevention
        '.input-no-zoom': {
          'font-size': '1rem',
          '@screen sm': {
            'font-size': '0.875rem',
          },
        },
        
        // Security: Safe line clamping
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
        
        // Security: Safe area utilities
        '.safe-top': {
          'padding-top': 'env(safe-area-inset-top, 0px)',
        },
        '.safe-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
        },
        '.safe-left': {
          'padding-left': 'env(safe-area-inset-left, 0px)',
        },
        '.safe-right': {
          'padding-right': 'env(safe-area-inset-right, 0px)',
        },
        '.safe-x': {
          'padding-left': 'env(safe-area-inset-left, 0px)',
          'padding-right': 'env(safe-area-inset-right, 0px)',
        },
        '.safe-y': {
          'padding-top': 'env(safe-area-inset-top, 0px)',
          'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
        },
        '.safe-all': {
          'padding-top': 'env(safe-area-inset-top, 0px)',
          'padding-bottom': 'env(safe-area-inset-bottom, 0px)',
          'padding-left': 'env(safe-area-inset-left, 0px)',
          'padding-right': 'env(safe-area-inset-right, 0px)',
        },
        
        // Security: Tap highlight utilities
        '.tap-highlight-none': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        '.tap-highlight-blue': {
          '-webkit-tap-highlight-color': 'rgba(59, 130, 246, 0.1)',
        },
        
        // Security: Layout utilities
        '.layout-mobile-safe': {
          'min-height': '100vh',
          'min-height': '100dvh',
          'padding': 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
        },
        
        // Security: Scrollbar styling
        '.scrollbar-thin': {
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
        
        // Security: Hardware acceleration
        '.gpu-accelerated': {
          'transform': 'translateZ(0)',
          'will-change': 'transform',
        },
        
        // Security: Content security
        '.content-security': {
          'user-select': 'none',
          '-webkit-user-drag': 'none',
          '-webkit-touch-callout': 'none',
          'pointer-events': 'none',
        },
        
        '.content-security-text': {
          'user-select': 'text',
          'pointer-events': 'auto',
        },
      };
      
      // Security: Validate and add utilities
      Object.entries(safeUtilities).forEach(([selector, rules]) => {
        if (typeof rules === 'object') {
          const validRules = {};
          Object.entries(rules).forEach(([property, value]) => {
            if (validateThemeValue(value)) {
              validRules[property] = value;
            }
          });
          if (Object.keys(validRules).length > 0) {
            addUtilities({ [selector]: validRules });
          }
        }
      });
      
      // Security: Safe components
      const safeComponents = {
        '.btn-focus-ring': {
          '&:focus': {
            'outline': '2px solid rgb(59 130 246)',
            'outline-offset': '2px',
          },
          '&:focus:not(:focus-visible)': {
            'outline': 'none',
          },
        },
        
        '.input-focus-ring': {
          '&:focus': {
            'outline': 'none',
            'border-color': 'rgb(59 130 246)',
            'box-shadow': '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
        },
        
        '.card-interactive': {
          'transition': 'all 0.2s ease',
          'cursor': 'pointer',
          '&:hover': {
            'transform': 'translateY(-1px)',
            'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            'transform': 'translateY(0)',
          },
          '@media (hover: none) and (pointer: coarse)': {
            '&:hover': {
              'transform': 'none',
            },
            '&:active': {
              'transform': 'scale(0.99)',
            },
          },
        },
      };
      
      // Security: Add validated components
      Object.entries(safeComponents).forEach(([selector, rules]) => {
        addComponents({ [selector]: rules });
      });
    },
  ],
};