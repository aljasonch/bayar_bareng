import type { Config } from 'tailwindcss'

const colorVar = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-plex-mono)', 'Courier New', 'monospace'],
        sans: ['var(--font-archivo)', 'sans-serif'],
      },
      colors: {
        white: colorVar('white'),
        counter: colorVar('counter'),
        paper: colorVar('paper'),
        paper2: colorVar('paper2'),
        ink: colorVar('ink'),
        ink2: colorVar('ink2'),
        ink3: colorVar('ink3'),
        muted: colorVar('muted'),
        faint: colorVar('faint'),
        rule: colorVar('rule'),
        rule2: colorVar('rule2'),
        stamp: colorVar('stamp'),
        stampSoft: colorVar('stamp-soft'),
        wa: colorVar('wa'),
        waDark: colorVar('wa-dark'),
      },
      boxShadow: {
        receipt: 'var(--shadow-receipt)',
      },
    },
  },
  plugins: [],
}

export default config
