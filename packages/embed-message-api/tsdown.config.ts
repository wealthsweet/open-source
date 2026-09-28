import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  minify: true,
  // Keep tsup's .js and .d.ts names instead of tsdown's .mjs and .d.mts
  fixedExtension: false,
  // Without an export list, every top-level type in a .d.ts is public,
  // including ones the source doesn't export
  footer: {
    dts: "export {};",
  },
});
