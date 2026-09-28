<h1 align="center">WealthSweet</h1>

<p align="center">
  SDKs and API definitions for embedding WealthSweet performance reporting in your application.
</p>

<p align="center">
  <a href="https://github.com/wealthsweet/open-source/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" />
  </a>
</p>

---

## How embedding works

1. Your backend exchanges your `clientId` and `clientSecret` for a short-lived token by calling `POST /api/auth/token`. Keep the secret on the server. An Admin user in your WealthSweet organisation can issue credentials.
2. Your frontend loads `/embed/pages/performance?token=...` in an `iframe`.
3. The embedded page posts lifecycle and activity messages to your page through `window.postMessage`.

## Packages

| Package                                                          | Use it for                                                                                       | npm                                                                                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`@wealthsweet/embed-react`](./packages/embed-react)             | React hooks and providers that build the iframe URL, refresh the token and listen to messages    | [![npm](https://img.shields.io/npm/v/@wealthsweet/embed-react)](https://www.npmjs.com/package/@wealthsweet/embed-react)             |
| [`@wealthsweet/http-apis`](./packages/http-apis)                 | Zod schemas, TypeScript types and the OpenAPI 3.1 spec for the token, health and embed endpoints | [![npm](https://img.shields.io/npm/v/@wealthsweet/http-apis)](https://www.npmjs.com/package/@wealthsweet/http-apis)                 |
| [`@wealthsweet/embed-message-api`](./packages/embed-message-api) | Types and Zod schemas for the `postMessage` messages, if you are not using React                 | [![npm](https://img.shields.io/npm/v/@wealthsweet/embed-message-api)](https://www.npmjs.com/package/@wealthsweet/embed-message-api) |

`@wealthsweet/embed-react` depends on the other two, so a React app only needs that one. Each package README is the reference for its part of the API.

## Quick start (React)

```bash
npm install @wealthsweet/embed-react
```

```tsx
import {
  usePerformanceUrl,
  WealthSweetProvider,
} from "@wealthsweet/embed-react";

// Your backend route calls POST /api/auth/token and returns
// { token, expires } with `expires` in milliseconds since the epoch.
async function fetchToken() {
  const res = await fetch("/api/wealthsweet-token");
  return res.json();
}

export function App() {
  return (
    <WealthSweetProvider
      origin={{ host: "performance.wealthsweet.com" }}
      fetchToken={fetchToken}
    >
      <PerformanceReport />
    </WealthSweetProvider>
  );
}

function PerformanceReport() {
  const { isTokenLoaded, performanceUrl } = usePerformanceUrl({
    from: "2024-01-01",
    reportingCurrencyIsoCode: "GBP",
  });
  if (!isTokenLoaded) return <div>Loading...</div>;
  return (
    <iframe src={performanceUrl} style={{ width: "100%", height: 1000 }} />
  );
}
```

See the [`embed-react` README](./packages/embed-react/README.md) for the backend half, the other ways to build the URL, branding and messages.

## Environments

| Environment | Host                                  |
| ----------- | ------------------------------------- |
| Production  | `performance.wealthsweet.com`         |
| Staging     | `performance.wealthsweet-staging.com` |

Use the host exactly as listed. The SDK checks each message's `event.origin` against it, so a host that redirects elsewhere (such as the old `staging.performance.wealthsweet.com`) causes every message to be ignored.

## Requirements

- Node.js 22 or later
- React 18 or 19 for `@wealthsweet/embed-react`

---

## Development

This repository is a [pnpm](https://pnpm.io/) monorepo managed with [Turborepo](https://turbo.build/).

```bash
pnpm install
```

| Command           | Description                            |
| ----------------- | -------------------------------------- |
| `pnpm build`      | Build all packages                     |
| `pnpm turbo test` | Run all tests                          |
| `pnpm lint`       | Lint all packages                      |
| `pnpm typecheck`  | Type-check all packages                |
| `pnpm format`     | Format all files with Prettier         |
| `pnpm clean`      | Remove build artifacts and lock file   |
| `pnpm clean:full` | Full clean including `node_modules`    |
| `pnpm deps`       | List dependency version mismatches     |
| `pnpm deps:fix`   | Auto-fix dependency version mismatches |

### Releasing

This project uses [Changesets](https://github.com/changesets/changesets). Add a changeset with `pnpm changeset` in any PR that changes a published package. On merge to `main`, a GitHub Action opens or updates a "Version Packages" PR. Merging that PR publishes the packages to npm.

---

## License

[MIT](./LICENSE)
