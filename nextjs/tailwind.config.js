/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0d9488',
          dark: '#0b7a6f',
          light: '#f0fdfa',
          border: '#99f6e4',
        },
        surface: {
          page: '#f7fafc',
          card: '#ffffff',
          th: '#f8f9fb',
          alt: '#fafbfc',
          hover: '#f0fdfa',
        },
        ink: {
          hi: '#0f172a',
          mid: '#475569',
          lo: '#94a3b8',
        },
        border: {
          DEFAULT: '#e2e8f0',
          mid: '#cbd5e1',
          focus: '#0f172a',
        },
        state: {
          pass: {
            bg: '#ecfdf5',
            text: '#065f46',
            border: '#a7f3d0',
            dot: '#059669',
          },
          warn: {
            bg: '#fffbeb',
            text: '#78350f',
            border: '#fde68a',
            dot: '#b45309',
          },
          fail: {
            bg: '#fef2f2',
            text: '#991b1b',
            border: '#fca5a5',
            dot: '#e53e3e',
          },
          info: {
            bg: '#eff6ff',
            text: '#1d4ed8',
            border: '#93c5fd',
            dot: '#3182ce',
          },
          neutral: {
            bg: '#f8fafc',
            text: '#475569',
            border: '#cbd5e1',
            dot: '#64748b',
          },
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xs: '3px',
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        pill: '9999px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px rgba(15, 23, 42, 0.08)',
        nav: '0 1px 6px rgba(0, 0, 0, 0.08)',
        modal: '0 10px 40px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
};
