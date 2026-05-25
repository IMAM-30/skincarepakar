import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17201d",
        muted: "#64706a",
        paper: "#f7f7f2",
        line: "#dce3dc",
        sage: "#4f7c68",
        mint: "#e5f1e9",
        clay: "#b56b5b",
        amberSoft: "#f2dfb6",
        roseSoft: "#f4d7d4"
      },
      boxShadow: {
        soft: "0 10px 28px rgba(23, 32, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
