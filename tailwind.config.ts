// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1C6E4A",
          dark:    "#155238",
          light:   "#2A8F62",
        },
        olive:  "#556B2F",
        matcha: "#A8C686",
        forest: {
          950: "#0D1F1A",
          900: "#122B20",
          800: "#1A3D2B",
          700: "#234D38",
        },
      },
      fontFamily: {
        inter:  ["Inter", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      borderRadius: {
        btn:  "10px",
        card: "16px",
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(168,198,134,0.1)",
        "glass-light":
          "0 8px 32px rgba(28,110,74,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        "brand-glow": "0 0 20px rgba(28,110,74,0.4)",
      },
      animation: {
        "fade-up":    "fadeUp 0.4s ease forwards",
        "fade-in":    "fadeIn 0.3s ease forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "spin-slow":  "spin 8s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(28,110,74,0.3)" },
          "50%":      { boxShadow: "0 0 30px rgba(28,110,74,0.7)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;