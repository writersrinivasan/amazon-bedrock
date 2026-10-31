import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: { 950: "#06060f", 900: "#0b0b1a", 800: "#12122a", 700: "#1b1b3a", 600: "#2a2a52" },
        aws: "#ff9900",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        shimmer: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
        flow: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(300%)" } },
        pop: { "0%": { transform: "scale(.6)", opacity: "0" }, "60%": { transform: "scale(1.08)", opacity: "1" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 4s linear infinite",
        flow: "flow 1.4s linear infinite",
        pop: "pop .5s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
