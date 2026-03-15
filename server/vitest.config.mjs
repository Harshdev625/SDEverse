import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Recursively discover all tests under tests/ regardless of depth
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: [
        // App entry point
        "app.js",
        // Middleware
        "middleware/error.middleware.js",
        "middleware/auth.middleware.js",
        "middleware/validateAlgorithm.js",
        "middleware/validateDataStructure.js",
        "middleware/validateProblem.js",
        "middleware/validateProposal.js",
        // Controllers
        "controllers/auth.controller.js",
        "controllers/note.controller.js",
        "controllers/contact.controller.js",
        "controllers/feedback.controller.js",
        "controllers/bookmark.controller.js",
        "controllers/notification.controller.js",
        // Utils
        "utils/generateToken.js",
        "utils/generateUniqueSlug.js",
        "utils/categoryTypes.js",
        "utils/keepAlive.js",
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 45,
        statements: 60,
      },
    },
  },
});