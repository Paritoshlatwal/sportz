import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5fbf9",
          100: "#e3f4ee",
          200: "#c4e9db",
          300: "#95d5bd",
          400: "#5bbb96",
          500: "#359c78",
          600: "#287d61",
          700: "#21644f",
          800: "#1e5041",
          900: "#1a4337"
        },
        sand: "#f6f1ea",
        ink: "#0f172a"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(53,156,120,0.16), transparent 30%), radial-gradient(circle at right, rgba(245,158,11,0.16), transparent 25%), linear-gradient(135deg, #f8faf8 0%, #eef6f2 52%, #f7f2eb 100%)"
      },
      boxShadow: {
        glow: "0 18px 50px rgba(33, 100, 79, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
