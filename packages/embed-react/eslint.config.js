import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import eslintjs from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

/*********************************  Base TS config **************************************/
const baseConfig = [
  {
    // These files will not be linted
    ignores: ["dist/*"],
  },
  {
    languageOptions: {
      parserOptions: {
        // Enable typescript-eslint parser
        project: true,
      },
    },
  },
  // Recommended js config
  eslintjs.configs.recommended,
  // Typescript recommended config
  ...tseslint.configs.recommendedTypeChecked,
  // Stylistic rules for typescript code
  ...tseslint.configs.stylisticTypeChecked,
  {
    // Disable type-checking for non-typescript files
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
];

/*********************************  React **************************************/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslintjs.configs.recommended,
  allConfig: eslintjs.configs.all,
});

const patchedConfig = fixupConfigRules([
  ...compat.extends("plugin:react-hooks/recommended"),
]);

const reactConfig = [
  { settings: { react: { version: "detect" } } },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"],
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  ...patchedConfig,
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
    },
  },
];

export default [...baseConfig, ...reactConfig];
