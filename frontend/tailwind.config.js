/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content:
      [
        './pages/**/*.{js,jsx}',
        './components/**/*.{js,jsx}',
        './app/**/*.{js,jsx}',
        './src/**/*.{js,jsx}',
      ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)',         /* mystical-purple-border */
        input: 'var(--color-input)',           /* surface-floating-content */
        ring: 'var(--color-ring)',             /* cosmic-energy-focus */
        background: 'var(--color-background)', /* deep-space-foundation */
        foreground: 'var(--color-foreground)', /* white-cosmic-reading */
        primary: {
          DEFAULT: 'var(--color-primary)', /* deep-cosmic-foundation */
          foreground:
              'var(--color-primary-foreground)', /* white-cosmic-reading */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* mystical-discovery-moments */
          foreground:
              'var(--color-secondary-foreground)', /* deep-cosmic-foundation */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* soft-nebula-concern */
          foreground:
              'var(--color-destructive-foreground)', /* white-cosmic-reading */
        },
        muted: {
          DEFAULT: 'var(--color-muted)',               /* deeper-space-canvas */
          foreground: 'var(--color-muted-foreground)', /* elegant-hierarchy */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* celestial-highlights */
          foreground:
              'var(--color-accent-foreground)', /* deep-cosmic-foundation */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* deep-cosmic-foundation */
          foreground:
              'var(--color-popover-foreground)', /* white-cosmic-reading */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* surface-floating-content */
          foreground: 'var(--color-card-foreground)', /* white-cosmic-reading */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* positive-cosmic-energy */
          foreground:
              'var(--color-success-foreground)', /* deep-cosmic-foundation */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* gentle-starlight-caution */
          foreground:
              'var(--color-warning-foreground)', /* deep-cosmic-foundation */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* soft-nebula-concern */
          foreground:
              'var(--color-error-foreground)', /* white-cosmic-reading */
        },
        surface: {
          DEFAULT: 'var(--color-surface)', /* floating-content-areas */
          foreground:
              'var(--color-surface-foreground)', /* white-cosmic-reading */
        },
        'text-primary': 'var(--color-text-primary)', /* clear-cosmic-reading */
        'text-secondary':
            'var(--color-text-secondary)', /* supporting-information */
        'cosmic-energy':
            'var(--color-cosmic-energy)', /* cosmic-energy-conversion */
        'nebula-accent': 'var(--color-nebula-accent)', /* soft-nebula-accent */
        'deep-space': 'var(--color-deep-space)', /* deep-space-foundation */
        'ethereal-lavender':
            'var(--color-ethereal-lavender)', /* ethereal-lavender-text */
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'playfair': ['Playfair Display', 'serif'],
      },
      fontSize: {
        'cosmic-xl': 'clamp(2rem, 5vw, 4rem)',
        'cosmic-lg': 'clamp(1.5rem, 4vw, 2.5rem)',
        'cosmic-md': 'clamp(1.125rem, 3vw, 1.5rem)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'gentle-fade':
            'gentleFade 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'cosmic-glow': 'cosmicGlow 4s ease-in-out infinite',
        'particle-drift': 'particleDrift 8s linear infinite',
      },
      keyframes: {
        'accordion-down': {
          from: {height: '0'},
          to: {height: 'var(--radix-accordion-content-height)'},
        },
        'accordion-up': {
          from: {height: 'var(--radix-accordion-content-height)'},
          to: {height: '0'},
        },
        'float': {
          '0%, 100%': {transform: 'translateY(0px)'},
          '50%': {transform: 'translateY(-10px)'},
        },
        'gentleFade': {
          'from': {
            opacity: '0',
            transform: 'translateY(40px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'cosmicGlow': {
          '0%, 100%': {opacity: '0.3'},
          '50%': {opacity: '0.8'},
        },
        'particleDrift': {
          '0%': {transform: 'translateX(0) translateY(0)'},
          '25%': {transform: 'translateX(10px) translateY(-5px)'},
          '50%': {transform: 'translateX(-5px) translateY(-10px)'},
          '75%': {transform: 'translateX(-10px) translateY(-5px)'},
          '100%': {transform: 'translateX(0) translateY(0)'},
        },
      },
      backdropBlur: {
        'cosmic': '10px',
      },
      boxShadow: {
        'cosmic': '0 0 20px rgba(114, 233, 251, 0.3)',
        'cosmic-lg': '0 0 30px rgba(114, 233, 251, 0.4)',
        'mystical': '0 4px 20px rgba(114, 233, 251, 0.1)',
        'nebula': '0 0 25px rgba(187, 152, 255, 0.3)',
      },
    },
  },
  plugins:
      [
        require('tailwindcss-animate'),
      ],
}