import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': '0.6875rem',
        '3xs': '0.625rem',
        '4xs': '0.5625rem',
      },
      spacing: {
        '0.2': '0.05rem',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
      colors: {
        zinc: {
          850: '#18181b',
        },
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      keyframes: {
        rise: {
          from: { transform: 'translate3d(0, var(--rise), 0)', opacity: '0' },
          to: { transform: 'translate3d(0, 0, 0)', opacity: '1' },
        },
        'ridge-fade': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        rise: 'rise 1200ms cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
};

export default config;
