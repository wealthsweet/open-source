import { defineConfig } from "tsdown";

export default defineConfig({
  dts: true,
  format: ["esm"],
  exports: true,
  // The build generates dist/api/performance.ts before bundling it
  clean: false,
  deps: {
    onlyBundle: ["zod-openapi"],
  },
  // zod-openapi's types are bundled into zod.d.ts, and without an export list
  // every top-level type in a .d.ts is public, including those
  footer: {
    dts: "export {};",
  },
  entry: {
    "performance/zod": "./src/index.ts",
    "performance/api": "./dist/api/performance.ts",
  },
});
