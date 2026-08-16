import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coconut: {
          50: "#FFFDF8",
          100: "#FFF8EC",
          200: "#FAF3E7",
          300: "#F5EAD4",
          400: "#EDE0C8",
        },
        leaf: {
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
          light: "#4CAF50",
          accent: "#81C784",
          soft: "#E8F5E9",
          muted: "#A5D6A7",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#F9A825",
          warm: "#FFB300",
          soft: "#FFF8E1",
          deep: "#B78103",
          temple: "#C5960C",
          shimmer: "#E5C158",
        },
        maroon: {
          DEFAULT: "#8E2430",
          dark: "#621B24",
          light: "#B73242",
          soft: "#FBEAEB",
          deep: "#5C1018",
        },
        kerala: {
          cream: "#FFFDF8",
          ivory: "#FFF8EC",
          green: "#2E7D32",
          gold: "#D4AF37",
          maroon: "#8E2430",
          orange: "#E67E22",
          turmeric: "#F9A825",
          sandalwood: "#D2691E",
          laterite: "#A0522D",
          clay: "#C0392B",
        }
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Poppins", "sans-serif"],
      },
      fontSize: {
        'mobile-base': ['16px', { lineHeight: '1.5' }],
        'mobile-lg': ['18px', { lineHeight: '1.5' }],
        'mobile-xl': ['20px', { lineHeight: '1.4' }],
      },
      spacing: {
        'touch': '44px',
        'touch-lg': '48px',
        'nav-height': '96px',
      },
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 4px 24px -4px rgba(46, 125, 50, 0.08), 0 2px 8px -2px rgba(0, 0, 0, 0.04)',
        'gold': '0 6px 24px -4px rgba(212, 175, 55, 0.28), 0 0 8px rgba(212, 175, 55, 0.1)',
        'card': '0 12px 36px -8px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'card-lg': '0 20px 50px -12px rgba(0, 0, 0, 0.08)',
        'glow-green': '0 0 24px rgba(46, 125, 50, 0.2), 0 0 48px rgba(46, 125, 50, 0.08)',
        'glow-gold': '0 0 24px rgba(212, 175, 55, 0.25), 0 0 48px rgba(212, 175, 55, 0.1)',
        'inner-gold': 'inset 0 2px 4px rgba(212, 175, 55, 0.15)',
        'lamp': '0 0 20px rgba(249, 168, 37, 0.3), 0 0 40px rgba(249, 168, 37, 0.15), 0 0 60px rgba(212, 175, 55, 0.08)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(3deg)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-4deg)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.82' },
        },
        'sway': {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'float': 'float-slow 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 7s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'sway': 'sway 8s ease-in-out infinite',
        'spin-slow': 'spin-slow 30s linear infinite',
      },
      backgroundImage: {
        'kasavu-stripe': 'linear-gradient(90deg, transparent 0%, #D4AF37 20%, #B78103 40%, #D4AF37 60%, transparent 100%)',
        'leaf-gradient': 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #E8F5E9 100%)',
        'warm-section': 'linear-gradient(180deg, #FFFDF8 0%, #FFF8EC 40%, #FAF3E7 70%, #FFFDF8 100%)',
        'hero-gradient': 'linear-gradient(160deg, #FFF8EC 0%, #FFFDF8 30%, #FAF3E7 60%, #FFF8EC 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
