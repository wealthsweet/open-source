import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  minify: true,
  // Keep tsup's .js and .d.ts names instead of tsdown's .mjs and .d.mts
  fixedExtension: false,
  deps: {
    neverBundle: ["react"],
  },
  banner: {
    js: '"use client";',
  },
});
