---
"@wealthsweet/embed-message-api": minor
"@wealthsweet/embed-react": minor
"@wealthsweet/http-apis": patch
---

Publish ESM as `.mjs` and add an `exports` map to the embed packages

- `embed-message-api` and `embed-react` have an `exports` map, so ESM consumers get the ESM build and its types. Before, Node and TypeScript loaded the CommonJS build with ESM types
- The ESM files are `.mjs` and `.d.mts` instead of `.js` and `.d.ts`. Imports of the package names are unchanged, but deep imports of `dist/` files stop working
