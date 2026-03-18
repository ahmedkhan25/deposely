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
        "deposly-blue": "#4F6EF7",
        "deposly-dark": "#0F1629",
        "deposly-gray": "#F7F7F7",
        "deposly-border": "#E5E5E5",
        "deposly-muted": "#6B7280",
        "deposly-accent": "#2D8B5E",
        "deposly-coral": "#C74B2A",
      },
    },
  },
  plugins: [],
};
export default config;
