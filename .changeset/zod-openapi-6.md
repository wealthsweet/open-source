---
"@wealthsweet/http-apis": major
---

`createPerformanceSwaggerFile()` returns an OpenAPI 3.2 document type instead of `openapi3-ts`'s `oas31.OpenAPIObject`

This is a major release because the return type changed, but most code needs no changes. The generated spec is the same, and still declares OpenAPI 3.1.0. The Zod schemas and the `performance/api` types are unchanged.

You only need to change something if your code does one of these:

- Assigns the result to `oas31.OpenAPIObject`, or passes it to a function typed with it. Add a cast, since the 3.2 type allows `querystring` as a parameter location and `openapi3-ts`'s 3.1 type doesn't
- Imports `openapi3-ts` without depending on it yourself. It was a dependency of this package and isn't anymore
