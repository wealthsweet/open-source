import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  format: ["esm"],
  entry: {
    "performance/zod": "./src/index.ts",
    "performance/api": "./dist/api/performance.ts",
  },
});
