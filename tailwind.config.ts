import type { Config } from 'tailwindcss'

const colorVar = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'Courier New', 'monospace'],
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      colors: {
        white: colorVar('white'),
        ink: colorVar('ink'),
        ink2: colorVar('ink2'),
        ink3: colorVar('ink3'),
        muted: colorVar('muted'),
        faint: colorVar('faint'),
        faint2: colorVar('faint2'),
        line: colorVar('line'),
        line2: colorVar('line2'),
        surface: colorVar('surface'),
        surface2: colorVar('surface2'),
        paper: colorVar('paper'),
        accent: colorVar('accent'),
        accentDark: colorVar('accent-dark'),
        accentSoft: colorVar('accent-soft'),
        sidebar: colorVar('sidebar'),
        sidebarHi: colorVar('sidebar-hi'),
        danger: colorVar('danger'),
        dangerSoft: colorVar('danger-soft'),
        whatsapp: colorVar('whatsapp'),
        whatsappDark: colorVar('whatsapp-dark'),
        brand: colorVar('accent'),
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        pop: 'var(--shadow-pop)',
      },
    },
  },
  plugins: [],
}

export default config
