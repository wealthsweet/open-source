import eslintReact from "@eslint-react/eslint-plugin";
import eslintjs from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
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
const reactConfig = [
  {
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    // The type-checked rules need type information, which the JS files don't have
    files: ["**/*.{ts,tsx}"],
    ...eslintReact.configs["recommended-type-checked"],
    settings: {
      "react-x": {
        ...eslintReact.configs["recommended-type-checked"].settings?.["react-x"],
        // The peer range includes React 18, so don't suggest React 19 only APIs
        version: "18.0.0",
      },
    },
    rules: {
      ...eslintReact.configs["recommended-type-checked"].rules,
      // eslint-plugin-react-hooks checks these
      "@eslint-react/error-boundaries": "off",
      "@eslint-react/exhaustive-deps": "off",
      "@eslint-react/purity": "off",
      "@eslint-react/rules-of-hooks": "off",
      "@eslint-react/set-state-in-effect": "off",
      "@eslint-react/set-state-in-render": "off",
      "@eslint-react/static-components": "off",
      "@eslint-react/unsupported-syntax": "off",
      "@eslint-react/use-memo": "off",
    },
  },
  reactHooks.configs.flat.recommended,
  {
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },
  },
];

export default [...baseConfig, ...reactConfig];
