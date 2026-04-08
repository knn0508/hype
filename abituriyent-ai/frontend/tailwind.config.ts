import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F0E8',
          100: '#EBDDC0',
          200: '#E2CB98',
          300: '#D8B870',
          400: '#CEA648',
          500: '#D4AF37', // Gold
          600: '#A98C2C',
          700: '#7F6921',
          800: '#544616',
          900: '#2A230B',
        },
        navy: {
          DEFAULT: '#0D1B2A',
          dark: '#070F18',
          light: '#1B3654',
        },
        gold: {
          DEFAULT: '#D4AF37',
          muted: 'rgba(212,175,55,0.5)',
          surface: 'rgba(212,175,55,0.08)',
          border: 'rgba(212,175,55,0.3)',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.03)',
          hover: 'rgba(255,255,255,0.05)',
          border: 'rgba(255,255,255,0.08)',
        },
        text: {
          body: '#F5F0E8',
          muted: 'rgba(245,240,232,0.5)',
        }
      },
      fontFamily: {
        serif: ['var(--font-dm-serif-display)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
export default config
