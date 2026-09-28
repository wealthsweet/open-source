# `@wealthsweet/http-apis`

Zod schemas, TypeScript types and an OpenAPI 3.1 spec for the WealthSweet token, health and embed endpoints.

```bash
npm install @wealthsweet/http-apis
```

The package is ESM. `require()` works on Node.js 22.12 and later.

| Import                                   | Contents                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `@wealthsweet/http-apis/performance/zod` | Zod schemas (`generateAuthTokenRequestBody`, `embedRequestParams`, ...) and `createPerformanceSwaggerFile()` |
| `@wealthsweet/http-apis/performance/api` | `paths` and `operations` types generated from the spec, for clients such as `openapi-fetch`                  |

Each `@wealthsweet/http-apis` [GitHub release](https://github.com/wealthsweet/open-source/releases) has the spec attached as `wealthsweet-swagger.yaml`.

```ts
import { generateAuthTokenRequestBody } from "@wealthsweet/http-apis/performance/zod";
import type { operations } from "@wealthsweet/http-apis/performance/api";

type TokenRequest =
  operations["token"]["requestBody"]["content"]["application/json"];

const body = generateAuthTokenRequestBody.parse({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  session: "user-123",
  expires: Math.floor(Date.now() / 1000) + 3600,
} satisfies TokenRequest);
```

## Hosts

| Environment | Base URL                                      |
| ----------- | --------------------------------------------- |
| Production  | `https://performance.wealthsweet.com`         |
| Staging     | `https://performance.wealthsweet-staging.com` |

## `POST /api/auth/token`

Issues a token for the embedded page. Call it from your server: the body contains your client secret.

| Field              | Type             | Required | Description                                                                                     |
| ------------------ | ---------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `clientId`         | `string`         | Yes      | Your client ID                                                                                  |
| `clientSecret`     | `string`         | Yes      | Your client secret                                                                              |
| `session`          | `string`         | Yes      | A reference for the user's session, such as your user ID. The embedded page caches per session. |
| `expires`          | `number \| null` | Yes      | When the token expires, as Unix time in **seconds**. `null` gives a token valid for one hour.   |
| `brandingId`       | `string`         | No       | The branding to use. Defaults to your organisation's branding.                                  |
| `nodes`            | `string[]`       | No       | References of the nodes this token can access                                                   |
| `investors`        | `ExternalRef[]`  | No       | Up to 100 investors this token is limited to                                                    |
| `investorAccounts` | `ExternalRef[]`  | No       | Up to 100 investor accounts this token is limited to                                            |

`ExternalRef` is `{ system: string, reference: string }`: the external system identifier agreed with WealthSweet, and the investor's or account's reference in that system.

The response is `{ "token": "..." }`.

### Scoping a token

- Leave `investors` and `investorAccounts` out to give the token everything your platform (and `nodes`, if given) can see.
- Pass a list to limit the token to those investors or accounts. References that don't match anything are skipped. If none of them match, the request fails with a 400.
- Pass an empty list (`[]`) to scope the token to nothing. The embedded page then shows no data.
- If you pass `investorAccounts` without `investors`, the token is also limited to the holders of those accounts.

### Errors

Errors return `{ message: string, error?: ... }`.

| Status | When                                                                                                                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 400    | The body isn't valid JSON or fails validation (`error` maps each invalid field to its messages), or no scoping reference matched |
| 401    | The client ID or secret is wrong                                                                                                 |
| 500    | Anything else                                                                                                                    |

## `GET /api/health`

Returns the health of each service as `{ health: "Healthy" | "Unhealthy", message?, error? }`, under the keys `api`, `database` and `pubStorage`. `azure` is a deprecated copy of `pubStorage`. The status is 200 when every service is healthy and 503 otherwise.

## `GET /embed/pages/performance`

The iframe page. Its query parameters are described by `embedRequestParams`:

| Parameter                  | Type         | Description                                                                        |
| -------------------------- | ------------ | ---------------------------------------------------------------------------------- |
| `token`                    | `string`     | Required. The token from `/api/auth/token`.                                        |
| `from`, `to`               | `YYYY-MM-DD` | The reporting period                                                               |
| `reportingCurrencyIsoCode` | `string`     | Three-letter currency to report in. Defaults to your platform's currency.          |
| `currencyIsoCode`          | `string`     | **Deprecated** and ignored by the page. Use `reportingCurrencyIsoCode`.            |
| `investorExtRefs`          | `string`     | Comma-separated investor references to report on. Currently Seccl references only. |
| `investorAccountExtRefs`   | `string`     | Comma-separated account references to report on. Currently Seccl references only.  |
| `brandingOverrides`        | `string`     | Base64-encoded JSON matching the `brandingOverrides` schema                        |

The [`embed-react` README](../embed-react/README.md#branding-overrides) describes the branding fields.
