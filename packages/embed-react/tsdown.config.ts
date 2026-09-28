import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  minify: true,
  exports: true,
  deps: {
    neverBundle: ["react"],
  },
  banner: {
    js: '"use client";',
  },
});
