import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#0ea5a0',
          dark: '#0d7a8a',
          darker: '#2d6a7f',
        },
        bgy: {
          turquoise: '#0ea5a0',
          teal: '#0d7a8a',
          blue: '#2d6a7f',
        },
      },
      backgroundImage: {
        'gradient-bgy': 'linear-gradient(135deg, #0ea5a0, #0d7a8a, #2d6a7f)',
      },
      animation: {
        'pulse-scale': 'pulse-scale 1.5s ease-in-out infinite',
        'marquee': 'marquee 20s linear infinite',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        'marquee': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
