# @wealthsweet/http-apis

## 2.0.0

### Major Changes

- a23951d: `createPerformanceSwaggerFile()` returns an OpenAPI 3.2 document type instead of `openapi3-ts`'s `oas31.OpenAPIObject`

  This is a major release because the return type changed, but most code needs no changes. The generated spec is the same, and still declares OpenAPI 3.1.0. The Zod schemas and the `performance/api` types are unchanged.

  You only need to change something if your code does one of these:

  - Assigns the result to `oas31.OpenAPIObject`, or passes it to a function typed with it. Add a cast, since the 3.2 type allows `querystring` as a parameter location and `openapi3-ts`'s 3.1 type doesn't
  - Imports `openapi3-ts` without depending on it yourself. It was a dependency of this package and isn't anymore

### Minor Changes

- abec8aa: Make the package importable from Node and match the token and embed endpoints

  - The `performance/zod` and `performance/api` exports now resolve in Node as well as in bundlers
  - `zod` and `openapi3-ts` are runtime dependencies instead of being bundled or missing
  - Add `reportingCurrencyIsoCode` to the embed params and deprecate `currencyIsoCode`, which the embedded page ignores
  - Limit `investors` and `investorAccounts` to 100 references each, as the token endpoint does
  - `errorResponse.error` is optional and can hold per-field validation errors
  - Remove the 403 response from the token endpoint, which never returns it

### Patch Changes

- ded50aa: Build with tsdown instead of tsup. The published files, exports and types are unchanged.
- 0131e65: Rewrite the READMEs to match the embed API

  - Document the current hook signatures, the staging host and the units of both `expires` values
  - Describe when each message is sent, including that `INITIALISING` isn't sent and `USER_IDLE` repeats
  - Document branding overrides, token scoping and the token endpoint's errors
  - The spec states that `expires` is in seconds and links to this repository instead of a dead docs site

- 9c2a961: Add documentation around logo rendering behaviour
- 9596154: Publish ESM as `.mjs` and add an `exports` map to the embed packages

  - `embed-message-api` and `embed-react` have an `exports` map, so ESM consumers get the ESM build and its types. Before, Node and TypeScript loaded the CommonJS build with ESM types
  - The ESM files are `.mjs` and `.d.mts` instead of `.js` and `.d.ts`. Imports of the package names are unchanged, but deep imports of `dist/` files stop working

- 7c14110: Update dependencies

  - `zod` requires 4.6.5 or later
  - In `http-apis`, `openapi3-ts` requires 4.6.1 or later

## 1.5.0

### Minor Changes

- e092b10: Add investor and account token scoping params

## 1.4.0

### Minor Changes

- fe399f7: Add the ability to provide branding overrides in the embedded api route

### Patch Changes

- 5117454: Update dependencies to latest versions

## 1.3.1

### Patch Changes

- c794c04: Update dependencies for embed-message-api, embed-react, http-apis

## 1.3.0

### Minor Changes

- df80b47: Add the pubStorage field and deprecate the azure field from the healthcheck api to enforce better encapsulation

## 1.2.0

### Minor Changes

- c8ea314: Allow nodes to be optional for the generate token request

## 1.1.0

### Minor Changes

- 500b7b3: Add health API and minor description changes
- 95f63fc: Add brandingId to token request

## 1.0.1

### Patch Changes

- 2ecff90: Fix incorrect query pararmeter names in swagger file

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
