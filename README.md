<h1 align="center">WealthSweet</h1>

<p align="center">
  Official SDKs and API definitions for integrating WealthSweet performance reporting into your applications.
</p>

<p align="center">
  <a href="https://github.com/wealthsweet/open-source/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  </a>
</p>

---

## Overview

This monorepo contains everything you need to embed WealthSweet's investment performance reporting UI into your web application. It provides:

- A **React SDK** for embedding WealthSweet components as iframes with automatic token management, lifecycle messaging, and idle detection
- **TypeScript types and Zod schemas** for the WealthSweet HTTP API, including a generated OpenAPI 3.1 specification
- **Message type definitions** for communicating with embedded WealthSweet components via the browser `postMessage` API

## Packages

| Package                                                          | Description                                                          | npm                                                                                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`@wealthsweet/embed-react`](./packages/embed-react)             | React SDK for embedding WealthSweet components                       | [![npm](https://img.shields.io/npm/v/@wealthsweet/embed-react)](https://www.npmjs.com/package/@wealthsweet/embed-react)             |
| [`@wealthsweet/http-apis`](./packages/http-apis)                 | TypeScript types, Zod schemas, and OpenAPI spec for WealthSweet APIs | [![npm](https://img.shields.io/npm/v/@wealthsweet/http-apis)](https://www.npmjs.com/package/@wealthsweet/http-apis)                 |
| [`@wealthsweet/embed-message-api`](./packages/embed-message-api) | Message types and schemas for iframe `postMessage` communication     | [![npm](https://img.shields.io/npm/v/@wealthsweet/embed-message-api)](https://www.npmjs.com/package/@wealthsweet/embed-message-api) |

---

## Getting Started

### Prerequisites

- Node.js v20+
- React 18 or 19 (for the React SDK)
- A WealthSweet `clientId` and `clientSecret` (Can be setup by an Admin user of your organisation in WealthSweet)

### Installation

Install the React SDK (which includes the other packages as dependencies):

```bash
npm install @wealthsweet/embed-react
```

Or if you only need the API types/schemas without React:

```bash
npm install @wealthsweet/http-apis
```

Or just the message types:

```bash
npm install @wealthsweet/embed-message-api
```

---

## Usage

### Embedding WealthSweet in a React Application

There are three approaches to embedding WealthSweet, from simplest to most flexible.

#### Approach 1: React Context (Recommended)

Wrap your application with `WealthSweetProvider` and let the SDK manage token lifecycle automatically. The provider accepts a `fetchToken` callback that should call your backend to exchange your credentials for an embed token.

```tsx
import { WealthSweetProvider } from "@wealthsweet/embed-react";

async function fetchToken() {
  // Call your backend, which uses your clientId/clientSecret
  // to generate a token via the WealthSweet API
  const res = await fetch("/api/getWealthSweetToken");
  return res.json(); // { token: string, expires: number }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WealthSweetProvider
      origin={{ host: "performance.wealthsweet.com" }}
      fetchToken={fetchToken}
    >
      {children}
    </WealthSweetProvider>
  );
}
```

Then use the `usePerformanceUrl` hook anywhere inside the provider to get the iframe URL:

```tsx
import { usePerformanceUrl } from "@wealthsweet/embed-react";

export default function PerformancePage() {
  const { isTokenLoaded, performanceUrl } = usePerformanceUrl({
    host: "performance.wealthsweet.com",
  });

  if (!isTokenLoaded) return <div>Loading...</div>;

  return (
    <iframe src={performanceUrl} style={{ width: "100%", height: 1000 }} />
  );
}
```

The provider automatically refreshes the token before it expires. You can also pass optional `apiParams` to filter the report:

```tsx
const { performanceUrl } = usePerformanceUrl(
  { host: "performance.wealthsweet.com" },
  {
    from: "2023-01-01",
    to: "2024-01-01",
    currencyIsoCode: "GBP",
    investorExtRefs: ["inv-1", "inv-2"],
    investorAccountExtRefs: ["acc-1"],
  },
);
```

#### Approach 2: Standalone Hook

Use `usePerformanceUrl` without the context by passing the token directly in the params. This gives you full control over token management:

```tsx
import { usePerformanceUrl } from "@wealthsweet/embed-react";

export default function PerformancePage({ token }: { token: string }) {
  const { isTokenLoaded, performanceUrl } = usePerformanceUrl(
    { host: "performance.wealthsweet.com" },
    { token },
  );

  if (!isTokenLoaded) return <div>Loading...</div>;

  return (
    <iframe src={performanceUrl} style={{ width: "100%", height: 1000 }} />
  );
}
```

> **Note:** The hook must either be inside a `WealthSweetProvider` OR receive a token directly. Otherwise it will throw an error.

#### Approach 3: Standalone Function

For non-React code or full manual control, use `generateWealthSweetElementUrl` directly:

```ts
import { generateWealthSweetElementUrl } from "@wealthsweet/embed-react";

const url = generateWealthSweetElementUrl({
  origin: { host: "performance.wealthsweet.com", protocol: "https" },
  path: "embed/pages/performance",
  params: {
    token: "your-token-here",
    from: "2023-01-01",
    to: "2024-01-01",
  },
});
```

---

### Listening to Embed Messages

Once the WealthSweet UI loads in the iframe, it sends lifecycle messages to the parent window via the [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API. The SDK provides hooks to listen for these messages with type-safe callbacks.

> **Important:** WealthSweet posts messages to the **immediate parent** window only. Nested iframes will not propagate messages to grandparent frames.

#### `useWealthsweetMessages`

Subscribe to all message types with individual callbacks:

```tsx
import { useWealthsweetMessages } from "@wealthsweet/embed-react";

useWealthsweetMessages({
  origin: { host: "performance.wealthsweet.com" },
  onMessage: (msg) => console.log("Any message:", msg),
  onInitialising: (msg) => console.log("Embed is initialising"),
  onInitialisingDone: (msg) => console.log("Initialisation complete"),
  onRendering: (msg) => console.log("Embed is rendering"),
  onRenderingDone: (msg) => console.log("Rendering complete"),
  onUserEvent: (msg) => console.log("User active at:", msg.userEventTime),
  onUserIdle: (msg) => console.log("User idle since:", msg.lastActiveTime),
  onError: (msg) => console.error("Embed error:", msg.errorDigest),
});
```

**Message types:**

| Type                | Description                                         | Extra Fields     |
| ------------------- | --------------------------------------------------- | ---------------- |
| `INITIALISING`      | Embed has started loading                           | -                |
| `INITIALISING_DONE` | Embed finished loading                              | -                |
| `RENDERING`         | Embed is rendering content                          | -                |
| `RENDERING_DONE`    | Embed finished rendering                            | -                |
| `USER_EVENT`        | User interacted with the embed (throttled to 1/sec) | `userEventTime`  |
| `USER_IDLE`         | User has been inactive for 1 second                 | `lastActiveTime` |
| `ERROR`             | An error occurred in the embed                      | `errorDigest`    |

All messages include `messageTime` (timestamp) and an optional `message` string.

#### `useWealthsweetIdleStatus`

A convenience hook that wraps `useWealthsweetMessages` to track user idle state:

```tsx
import { useWealthsweetIdleStatus } from "@wealthsweet/embed-react";

const { isIdle, lastActiveTime } = useWealthsweetIdleStatus({
  origin: { host: "performance.wealthsweet.com" },
  timeout: 600_000, // 10 minutes (default)
  onIdle: () => console.log("User went idle"),
  onAction: () => console.log("User became active"),
});
```

| Parameter  | Description                                                 |
| ---------- | ----------------------------------------------------------- |
| `origin`   | The WealthSweet server origin to validate messages against  |
| `timeout`  | Idle threshold in milliseconds (default: 10 minutes)        |
| `onIdle`   | Callback fired when the user has been idle for `timeout` ms |
| `onAction` | Callback fired when the user becomes active again           |

Returns `isIdle` (boolean) and `lastActiveTime` (Unix timestamp in ms).

---

### Using the HTTP API Types

The `@wealthsweet/http-apis` package provides TypeScript types and Zod schemas for the WealthSweet API, useful for building backend integrations.

#### Zod Schemas

```ts
import {
  generateAuthTokenRequestBody,
  generateAuthTokenResponse,
  embedRequestParams,
  serviceHealthResponse,
} from "@wealthsweet/http-apis/performance/zod";

// Validate a token request body
const parsed = generateAuthTokenRequestBody.parse({
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  expires: Date.now() + 3600_000,
  session: "user-session-123",
  nodes: ["node-1", "node-2"],
});
```

#### OpenAPI-Generated Types

```ts
import type { paths, operations } from "@wealthsweet/http-apis/performance/api";

// Use with any OpenAPI-compatible client (e.g., openapi-fetch)
type TokenRequest =
  operations["token"]["requestBody"]["content"]["application/json"];
type TokenResponse =
  operations["token"]["responses"]["200"]["content"]["application/json"];
```

#### API Endpoints

| Method | Path                       | Description                                                               |
| ------ | -------------------------- | ------------------------------------------------------------------------- |
| `POST` | `/api/auth/token`          | Generate an authentication token using your `clientId` and `clientSecret` |
| `GET`  | `/api/health`              | Check the health of WealthSweet services                                  |
| `GET`  | `/embed/pages/performance` | Load the embedded performance page (used as iframe `src`)                 |

**Token request parameters:**

| Field              | Type               | Required | Description                                                         |
| ------------------ | ------------------ | -------- | ------------------------------------------------------------------- |
| `clientId`         | `string`           | Yes      | Your client identifier                                              |
| `clientSecret`     | `string`           | Yes      | Your client secret                                                  |
| `expires`          | `number \| null`   | Yes      | UTC timestamp when the token expires                                |
| `session`          | `string`           | Yes      | Session reference for scoping access                                |
| `brandingId`       | `string`           | No       | Custom branding identifier                                          |
| `nodes`            | `string[]`         | No       | Node references the token grants access to                          |
| `investors`        | `ExternalRef[]`    | No       | Scope the token to specific investors by external reference         |
| `investorAccounts` | `ExternalRef[]`    | No       | Scope the token to specific investor accounts by external reference |

Where `ExternalRef` is:

| Field       | Type     | Description                                    |
| ----------- | -------- | ---------------------------------------------- |
| `system`    | `string` | The external system this reference belongs to  |
| `reference` | `string` | The unique reference within the external system |

**Embed query parameters:**

| Field                    | Type            | Required | Description                          |
| ------------------------ | --------------- | -------- | ------------------------------------ |
| `token`                  | `string`        | Yes      | Access token                         |
| `from`                   | `ISO 8601 date` | No       | Report period start                  |
| `to`                     | `ISO 8601 date` | No       | Report period end                    |
| `currencyIsoCode`        | `string`        | No       | 3-letter currency code (e.g., `GBP`) |
| `investorExtRefs`        | `string[]`      | No       | Investor references to filter by     |
| `investorAccountExtRefs` | `string[]`      | No       | Account references to filter by      |

---

### Using the Message API Directly

If you are not using React, you can use `@wealthsweet/embed-message-api` to validate messages from the iframe:

```ts
import { embedMessageSchema } from "@wealthsweet/embed-message-api";

window.addEventListener("message", (event) => {
  if (event.origin !== "https://performance.wealthsweet.com") return;

  const result = embedMessageSchema.safeParse(event.data);
  if (result.success) {
    const message = result.data;
    switch (message.type) {
      case "INITIALISING":
        // handle initialising
        break;
      case "RENDERING_DONE":
        // handle rendering complete
        break;
      case "USER_IDLE":
        console.log("Last active:", message.lastActiveTime);
        break;
      case "ERROR":
        console.error("Error:", message.errorDigest);
        break;
    }
  }
});
```

---

## Environments

| Environment | Host                                  |
| ----------- | ------------------------------------- |
| Production  | `performance.wealthsweet.com`         |
| Staging     | `staging.performance.wealthsweet.com` |

---

## Development

This repository is a [pnpm](https://pnpm.io/) monorepo managed with [Turborepo](https://turbo.build/).

### Setup

```bash
pnpm install
```

### Commands

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `pnpm build`      | Build all packages                     |
| `pnpm lint`       | Lint all packages                      |
| `pnpm typecheck`  | Type-check all packages                |
| `pnpm format`     | Format all files with Prettier         |
| `pnpm clean`      | Remove build artifacts and lock file   |
| `pnpm clean:full` | Full clean including `node_modules`    |
| `pnpm deps`       | List dependency version mismatches     |
| `pnpm deps:fix`   | Auto-fix dependency version mismatches |

### Releasing

This project uses [Changesets](https://github.com/changesets/changesets) for version management and publishing. On merge to `main`, a GitHub Action creates or updates a release PR. When that PR is merged, packages are automatically published to npm.

---

## License

[MIT](./LICENSE) - Copyright 2024 WealthSweet
