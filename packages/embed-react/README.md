# `@wealthsweet/embed-react`

React hooks and providers for embedding WealthSweet performance reporting in an `iframe`.

```bash
npm install @wealthsweet/embed-react
```

Requires React 18 or 19. The package depends on [`@wealthsweet/http-apis`](../http-apis) and [`@wealthsweet/embed-message-api`](../embed-message-api) and re-exports the message types.

## The origin

Every hook and the provider take an `origin` naming the WealthSweet server:

```ts
type WealthSweetElementOrigin = {
  host: string; // e.g. "performance.wealthsweet.com"
  protocol?: "https" | "http"; // defaults to "https"
};
```

| Environment | `host`                                |
| ----------- | ------------------------------------- |
| Production  | `performance.wealthsweet.com`         |
| Staging     | `performance.wealthsweet-staging.com` |

The SDK uses the origin to build the iframe URL and to discard messages whose `event.origin` doesn't match it. Pass `protocol: "http"` only for a local server.

## Tokens

The embedded page authenticates with a token that your backend requests from `POST /api/auth/token` using your `clientId` and `clientSecret`. Never send the secret to the browser. The [`http-apis` README](../http-apis/README.md#post-apiauthtoken) documents the request body, scoping and errors.

Two different `expires` values are involved, and they use different units:

| Where                                       | Unit                          | Meaning                                                             |
| ------------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| `expires` you **send** to `/api/auth/token` | Unix time in **seconds**      | When the token expires. `null` gives a token valid for one hour.    |
| `expires` your `fetchToken` **returns**     | Unix time in **milliseconds** | When the provider should treat the token as expired and refresh it. |

A backend route might look like this:

```ts
// POST /api/wealthsweet-token (runs on your server)
export async function POST() {
  const expiresInSeconds = Math.floor(Date.now() / 1000) + 60 * 60; // one hour

  const res = await fetch(
    "https://performance.wealthsweet.com/api/auth/token",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.WEALTHSWEET_CLIENT_ID,
        clientSecret: process.env.WEALTHSWEET_CLIENT_SECRET,
        session: "user-123", // a reference for the signed-in user
        expires: expiresInSeconds,
      }),
    },
  );
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const { token } = await res.json();

  return Response.json({ token, expires: expiresInSeconds * 1000 });
}
```

## Building the iframe URL

There are three ways to do it, from least to most manual.

### 1. Provider and hook (recommended)

`WealthSweetProvider` calls `fetchToken` on mount and again one minute before each token expires. Hooks inside it read the origin and token from context.

```tsx
import {
  usePerformanceUrl,
  WealthSweetProvider,
} from "@wealthsweet/embed-react";

async function fetchToken() {
  const res = await fetch("/api/wealthsweet-token", { method: "POST" });
  return res.json(); // { token: string, expires: number (ms) }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WealthSweetProvider
      origin={{ host: "performance.wealthsweet.com" }}
      fetchToken={fetchToken}
      onFetchTokenError={(error) => console.error(error)}
    >
      {children}
    </WealthSweetProvider>
  );
}

export function PerformanceReport() {
  const { isTokenLoaded, isTokenError, performanceUrl } = usePerformanceUrl({
    from: "2024-01-01",
    to: "2025-01-01",
    reportingCurrencyIsoCode: "GBP",
  });

  if (isTokenError) return <div>Could not load the report</div>;
  if (!isTokenLoaded) return <div>Loading...</div>;
  return (
    <iframe src={performanceUrl} style={{ width: "100%", height: 1000 }} />
  );
}
```

To fetch a new token before the current one expires, for example after the signed-in user changes, call `forceRefetch` from `useTokenContext()`:

```tsx
import { useTokenContext } from "@wealthsweet/embed-react";

const { forceRefetch } = useTokenContext();
```

### 2. Hook without the provider

Pass `origin` and `token` to the hook and manage the token yourself:

```tsx
import { usePerformanceUrl } from "@wealthsweet/embed-react";

export function PerformanceReport({ token }: { token: string }) {
  const { performanceUrl } = usePerformanceUrl({
    origin: { host: "performance.wealthsweet.com" },
    token,
    reportingCurrencyIsoCode: "GBP",
  });
  return (
    <iframe src={performanceUrl} style={{ width: "100%", height: 1000 }} />
  );
}
```

A value passed to the hook takes precedence over the provider's. The hook throws if it can't find an `origin`, or a token, in either its arguments or a surrounding `WealthSweetProvider`.

`usePerformanceUrl` returns:

| Field             | Type                                                  | Description                                         |
| ----------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `isTokenLoaded`   | `boolean`                                             | `true` once `performanceUrl` is set                 |
| `performanceUrl`  | `string \| undefined`                                 | The iframe `src`                                    |
| `isTokenError`    | `boolean`                                             | `true` if `fetchToken` threw                        |
| `tokenError`      | `{ message: string; error: unknown } \| undefined`    | What `fetchToken` threw                             |
| `tokenFetchState` | `"INITIALISED" \| "FETCHING" \| "FETCHED" \| "ERROR"` | Provider fetch state. Absent when you pass `token`. |

### 3. Plain function

`generateWealthSweetElementUrl` has no React dependency:

```ts
import { generateWealthSweetElementUrl } from "@wealthsweet/embed-react";

const url = generateWealthSweetElementUrl({
  origin: { host: "performance.wealthsweet.com" },
  path: "embed/pages/performance",
  params: { token: "your-token", from: "2024-01-01", to: "2025-01-01" },
  brandingOverrides: { primaryColor: "#0f172a" },
});
```

## Report parameters

All three approaches accept these parameters. The SDK joins arrays with commas and base64-encodes `brandingOverrides`.

| Parameter                  | Type                    | Description                                                                           |
| -------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| `token`                    | `string`                | The embed token. Required unless the provider supplies it.                            |
| `from`                     | `string` (`YYYY-MM-DD`) | Start of the reporting period                                                         |
| `to`                       | `string` (`YYYY-MM-DD`) | End of the reporting period                                                           |
| `reportingCurrencyIsoCode` | `string`                | Three-letter currency to report in, e.g. `GBP`. Defaults to your platform's currency. |
| `currencyIsoCode`          | `string`                | **Deprecated.** Use `reportingCurrencyIsoCode`. The SDK sends it under the new name.  |
| `investorExtRefs`          | `string[]`              | Investor references to report on                                                      |
| `investorAccountExtRefs`   | `string[]`              | Account references to report on                                                       |
| `brandingOverrides`        | `BrandingOverrides`     | Colours, font and logo for this embed. See below.                                     |

`investorExtRefs` and `investorAccountExtRefs` narrow the report within whatever the token allows. They currently resolve Seccl references only. To restrict what a user can see, scope the token instead.

## Branding overrides

`brandingOverrides` overrides the branding configured for your organisation, or for the `brandingId` used when the token was issued. Every field is optional.

| Field                                                                                                                                                                                                                                      | Description                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `primaryColor`, `primaryForegroundColor`, `secondaryColor`, `secondaryForegroundColor`, `callToActionColor`, `callToActionForegroundColor`                                                                                                 | Interface colours                                                                   |
| `balanceColor`, `timeWeightedPerformanceColor`, `moneyWeightedPerformanceColor`, `positiveCapitalMovementColor`, `negativeCapitalMovementColor`                                                                                            | Chart colours                                                                       |
| `pdfBalanceColor`, `pdfTimeWeightedPerformanceColor`, `pdfMoneyWeightedPerformanceColor`, `pdfPositiveCapitalMovementColor`, `pdfNegativeCapitalMovementColor`, `pdfTextColor`, `pdfBannerColor`, `pdfPageColor`, `pdfBannerContrastColor` | PDF report colours                                                                  |
| `fontFamily`                                                                                                                                                                                                                               | One of `Inter`, `Open Sans`, `Roboto`, `Poppins`, `Brown Regular`, `Whitney Medium` |
| `logoUrl`                                                                                                                                                                                                                                  | Logo image URL. Use PNG or JPG: PDF reports can't render SVG.                       |

Colours accept any CSS colour string, such as `#ffffff`, `rgb(255, 255, 255)` or `hsl(0, 0%, 100%)`. The page ignores an invalid colour. An invalid `fontFamily` makes it ignore the whole override.

## Listening to messages

The embedded page posts messages to its immediate parent window with `window.parent.postMessage(message, "*")`. Only the page that contains the `iframe` receives them. They carry lifecycle and activity information, never user data. The [`embed-message-api` README](../embed-message-api/README.md#messages) lists every message and when it is sent.

### `useWealthsweetMessages`

Registers a callback per message type:

```tsx
import { useWealthsweetMessages } from "@wealthsweet/embed-react";

const { isListeningToMessages } = useWealthsweetMessages({
  origin: { host: "performance.wealthsweet.com" }, // optional inside WealthSweetProvider
  onMessage: (message) => console.log(message.type),
  onInitialisingDone: () => console.log("Report loaded"),
  onUserEvent: ({ userEventTime }) => console.log("Active at", userEventTime),
  onUserIdle: ({ lastActiveTime }) => console.log("Idle since", lastActiveTime),
  onError: ({ message, errorDigest }) => console.error(message, errorDigest),
});
```

The other callbacks are `onInitialising`, `onRendering` and `onRenderingDone`. `onMessage` receives every message, before the type-specific callback. Wrap callbacks in `useCallback`: a new function on every render re-registers the listener.

### `useWealthsweetIdleStatus`

Tracks whether the user has been inactive inside the iframe for longer than `timeout`:

```tsx
import { useWealthsweetIdleStatus } from "@wealthsweet/embed-react";

const { isIdle, lastActiveTime } = useWealthsweetIdleStatus({
  origin: { host: "performance.wealthsweet.com" }, // optional inside WealthSweetProvider
  timeout: 10 * 60 * 1000, // default: 10 minutes
  onIdle: () => console.log("Idle"),
  onAction: () => console.log("Active"),
});
```

| Option     | Description                                                                                                                                           |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origin`   | The WealthSweet server origin                                                                                                                         |
| `timeout`  | Milliseconds of inactivity before `isIdle` becomes `true`. Default 10 minutes.                                                                        |
| `onIdle`   | Called for each `USER_IDLE` message once the user has been inactive for longer than `timeout`. That repeats about once a second while they stay idle. |
| `onAction` | Called for each `USER_EVENT` message, at most once a second while the user is active                                                                  |

It returns `isIdle`, `lastActiveTime` (Unix time in milliseconds, `undefined` until the first activity message) and `isListeningToMessages`.
