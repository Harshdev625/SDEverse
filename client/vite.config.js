import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        "src/utils/**/*.js",
        "src/constants/**/*.js",
        "src/features/**/*API.js",
        "src/features/theme/themeSlice.js",
        "src/hooks/**/*.js",
        "src/components/AdminRoute.jsx",
        "src/components/NavLinks.jsx",
        "src/components/ScrollToTop.jsx",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
