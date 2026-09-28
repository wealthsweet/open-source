# @wealthsweet/embed-react

## 1.4.0

### Minor Changes

- abec8aa: Fix message delivery and declare runtime dependencies

  - Messages are delivered when `origin` omits `protocol`. It now defaults to `https`, as the URL builder already did
  - `isListeningToMessages` is `true` while the hook is mounted
  - A deprecated `currencyIsoCode` param is sent as `reportingCurrencyIsoCode`
  - `@wealthsweet/http-apis` and `@wealthsweet/embed-message-api` are dependencies, so the published types resolve

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

- Updated dependencies [ded50aa]
- Updated dependencies [0131e65]
- Updated dependencies [9c2a961]
- Updated dependencies [abec8aa]
- Updated dependencies [9596154]
- Updated dependencies [7c14110]
- Updated dependencies [a23951d]
  - @wealthsweet/embed-message-api@1.3.0
  - @wealthsweet/http-apis@2.0.0

## 1.3.0

### Minor Changes

- fe399f7: Add the ability to provide branding overrides in the embedded api route

### Patch Changes

- 5117454: Update dependencies to latest versions

## 1.2.2

### Patch Changes

- c794c04: Update dependencies for embed-message-api, embed-react, http-apis

## 1.2.1

### Patch Changes

- df3ee16: Release new version of embed-react to get new embed-message-api changes

## 1.2.0

### Minor Changes

- c995d87: Add token refetch functionality to token provider, introduce linting, and update readme

## 1.1.2

### Patch Changes

- 0774d01: Update the way useEffect will schedule token refreshes

## 1.1.1

### Patch Changes

- 9c41e94: Make the message api less noisy when other apps use the post message api
- 9c41e94: Regenerate token when the error handler changes

## 1.1.0

### Minor Changes

- 4d4846c: Add fetch failure recovery mechanism

  _NOTE_: The `usePerformanceUrl` hook api has changed so that the function now takes a single parameter that includes the `origin` param.
  This would usually be a major version bump but given the age of the package this is only going to be a minor version bump.
  API changes like this in the future will be major version bumps.

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
