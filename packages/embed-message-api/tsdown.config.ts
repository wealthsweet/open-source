import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  minify: true,
  exports: true,
  // Without an export list, every top-level type in a .d.ts is public,
  // including ones the source doesn't export
  footer: {
    dts: "export {};",
  },
});
