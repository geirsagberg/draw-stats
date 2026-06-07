import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        paper: "#f6f1e8",
        steel: "#51606a",
        signal: "#d6422b",
        mint: "#44b78b",
        brass: "#c49a3a",
        line: "#d8d0c2"
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        rule: "0 1px 0 rgba(23, 23, 23, 0.1)"
      }
    }
  },
  plugins: []
};

export default config;
