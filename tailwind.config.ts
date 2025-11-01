import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        aSky: "#C3EBFA",
        aSkyLight: "#EDF9FD",
        aPurple: "#CFCEFF",
        aPurpleLight: "#F1F0FF",
        aYellow: "#FAE27C",
        aYellowLight: "#FEFCE8",
      },
    },
  },
  plugins: [],
};
export default config;