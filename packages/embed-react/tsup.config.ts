import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  minify: true,
  clean: true,
  external: ["react"],
  banner: {
    js: '"use client";',
  },
  ...options,
}));
