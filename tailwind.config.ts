import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-jetbrains-mono)', 'Courier New', 'monospace'],
        sans: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
      },
      colors: {
        // Flat, solid tokens — colored but no gradients.
        ink: '#1E1B33', // primary text
        ink2: '#3B355C', // strong secondary text / figures
        ink3: '#5A5280', // secondary text
        muted: '#8B83B8', // tertiary text / captions
        faint: '#A9A2CE', // placeholders / icons
        faint2: '#C7C1E3', // disabled / subtle marks
        line: '#E6E2F7', // hairline borders
        line2: '#E0DCF2', // input borders
        surface: '#F2F0FB', // subtle fill
        surface2: '#F7F6FD', // subtler fill
        paper: '#F3F1FB', // app background (soft lavender-gray)
        accent: '#5B4BE0', // primary indigo
        accentDark: '#4938C9', // hover/pressed
        accentSoft: '#EDEAFB', // tinted fill
        sidebar: '#221C4A', // deep indigo navigation rail
        sidebarHi: '#2E2760', // sidebar hover/raised
        brand: '#5B4BE0', // alias for safety
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(34, 28, 74, 0.06)',
        pop: '0 12px 30px -16px rgba(34, 28, 74, 0.35)',
      },
    },
  },
  plugins: [],
}

export default config
