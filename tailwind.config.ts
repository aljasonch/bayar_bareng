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
        // Calm, low-chroma palette — warm neutrals + a single muted sage accent.
        ink: '#222019', // primary text (warm near-black)
        ink2: '#3A372F', // strong secondary text / figures
        ink3: '#57534A', // secondary text
        muted: '#847F73', // tertiary text / captions
        faint: '#A8A294', // placeholders / icons
        faint2: '#CAC4B6', // disabled / subtle marks
        line: '#E8E4DB', // hairline borders
        line2: '#E2DDD2', // input borders
        surface: '#F0EEE7', // subtle fill
        surface2: '#F6F4EE', // subtler fill
        paper: '#F5F3EC', // app background (warm bone)
        accent: '#4E6A5A', // muted sage-pine accent
        accentDark: '#3E5648', // hover/pressed
        accentSoft: '#E5EBE6', // tinted fill
        sidebar: '#232A25', // deep pine-graphite navigation rail
        sidebarHi: '#2F382F', // sidebar hover/raised
        brand: '#4E6A5A', // alias for safety
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(34, 32, 25, 0.05)',
        pop: '0 12px 30px -16px rgba(34, 32, 25, 0.28)',
      },
    },
  },
  plugins: [],
}

export default config
