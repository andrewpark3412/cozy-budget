/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cozy Budget design system
        primary: {
          DEFAULT: '#7C9A7E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#D4845A',
          foreground: '#FFFFFF',
        },
        background: '#FAF7F2',
        surface: '#FFFFFF',
        border: '#E8E2D9',
        muted: {
          DEFAULT: '#F5F1EA',
          foreground: '#8C8479',
        },
        foreground: '#2D2A26',
        danger: {
          DEFAULT: '#C0615A',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#5A8C6A',
          foreground: '#FFFFFF',
        },
        // shadcn/ui compat tokens (mapped to cozy palette)
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D2A26',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#2D2A26',
        },
        secondary: {
          DEFAULT: '#F5F1EA',
          foreground: '#2D2A26',
        },
        destructive: {
          DEFAULT: '#C0615A',
          foreground: '#FFFFFF',
        },
        input: '#E8E2D9',
        ring: '#7C9A7E',
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
