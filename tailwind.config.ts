import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "qc-primary": "var(--qc-primary)",
        "qc-secondary": "var(--qc-secondary)",
        "qc-accent": "var(--qc-accent)",
        "qc-bg": "var(--qc-bg)",
        "qc-card": "var(--qc-card)",
        "qc-text": "var(--qc-text)",
        "qc-muted": "var(--qc-muted)",
        "qc-danger": "var(--qc-danger)",
        "qc-success": "var(--qc-success)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
