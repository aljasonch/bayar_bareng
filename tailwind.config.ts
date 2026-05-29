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
        brand: '#FF6B35',
      },
    },
  },
  plugins: [],
}
export default config
