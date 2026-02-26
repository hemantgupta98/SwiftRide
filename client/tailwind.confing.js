/** @type {import("tailwindcss").Config} */
const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#22C55E",
        dark: "#0F172A",
      },
    },
  },
  plugins: [],
};

export default config;
