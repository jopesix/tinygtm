// Separate vitest config for the eval suite — kept apart from regular tests
// so a normal `npm test` doesn't accidentally hit the Anthropic API.

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(here, "./src"),
    },
  },
  test: {
    include: ["evals/**/*.eval.ts"],
    testTimeout: 90_000,
    hookTimeout: 90_000,
  },
});
