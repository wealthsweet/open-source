---
"@wealthsweet/http-apis": minor
---

Make the package importable from Node and match the token and embed endpoints

- The `performance/zod` and `performance/api` exports now resolve in Node as well as in bundlers
- `zod` and `openapi3-ts` are runtime dependencies instead of being bundled or missing
- Add `reportingCurrencyIsoCode` to the embed params and deprecate `currencyIsoCode`, which the embedded page ignores
- Limit `investors` and `investorAccounts` to 100 references each, as the token endpoint does
- `errorResponse.error` is optional and can hold per-field validation errors
- Remove the 403 response from the token endpoint, which never returns it
