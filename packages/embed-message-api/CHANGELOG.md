# @wealthsweet/embed-message-api

## 1.3.0

### Minor Changes

- 9596154: Publish ESM as `.mjs` and add an `exports` map to the embed packages

  - `embed-message-api` and `embed-react` have an `exports` map, so ESM consumers get the ESM build and its types. Before, Node and TypeScript loaded the CommonJS build with ESM types
  - The ESM files are `.mjs` and `.d.mts` instead of `.js` and `.d.ts`. Imports of the package names are unchanged, but deep imports of `dist/` files stop working

### Patch Changes

- ded50aa: Build with tsdown instead of tsup. The published files, exports and types are unchanged.
- 0131e65: Rewrite the READMEs to match the embed API

  - Document the current hook signatures, the staging host and the units of both `expires` values
  - Describe when each message is sent, including that `INITIALISING` isn't sent and `USER_IDLE` repeats
  - Document branding overrides, token scoping and the token endpoint's errors
  - The spec states that `expires` is in seconds and links to this repository instead of a dead docs site

- 7c14110: Update dependencies

  - `zod` requires 4.6.5 or later
  - In `http-apis`, `openapi3-ts` requires 4.6.1 or later

## 1.2.0

### Minor Changes

- fe399f7: Add the ability to provide branding overrides in the embedded api route

### Patch Changes

- 5117454: Update dependencies to latest versions

## 1.1.1

### Patch Changes

- c794c04: Update dependencies for embed-message-api, embed-react, http-apis

## 1.1.0

### Minor Changes

- 4098c42: Extend message API schema to include optional message and errorDigest field

## 1.0.0

### Major Changes

- 46eb79e: Initial release

## 0.0.5

### Patch Changes

- 41bb6a8: Test github action runner

## 0.0.4

### Patch Changes

- Test changeset version bump

## 0.0.3

### Patch Changes

- Publish to npm

## 0.0.2

### Patch Changes

- Update access to public

## 0.0.1

### Patch Changes

- 35c24b6: Test release procedure
