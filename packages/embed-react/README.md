# `@wealthsweet/embed-react`

## Getting Started

### Installation

The fastest way to use WealthSweet is to simply install with your package manager of choice.

```
npm install @wealthsweet/embed-react
```

### Usage - React Context

The easiest way to get started with this SDK is to utilise the `WealthSweetContext` so that this library can manage its own state in your browser.

The `WealthSweetContext` takes a single prop `fetchToken` which the `WealthSweetContext` then uses to fetch and update the embedded API token when it is required.

```
async function fetchToken() {
  \*
   * Add your backend API call here to use your clientId / secret combination to fetch an embedded token from the WealthSweet API.
   * Include the UTC timestamp of when the token expires in your response of so that this library can refresh the token before it goes stale
  */
  return fetch('/api/getWealthSweetToken')
}

export function Providers({children}: {children: ReactNode}) {
  return (
    <WealthSweetProvider fetchToken={fetchToken}>
      {children}
    </WealthSweetProvider>
  )
}
```

To display a `WealthSweetElement`, you can use the libraries hooks to create the correct `src` attribute for the `iframe`.

The collection of hooks that are exposed take two parameters:

- `origin` - The origin server to connect to.
  - Specifies a `host` and a `protocol` to distinguish between our staging / production instance of the application.
    - `protocol`: Defaults to `https` and should not need to be configured
    - `host`: Set to `staging.performance.wealthsweet.com` for testing purposes and `performance.wealthsweet.com` for production instances
- `apiParams` - The api parameters used to create the IFrame url

```
export default function EmbeddedPerformanceIFrame({
  apiParams,
}: {
  apiParams?: Omit<PerformancePageElement["params"], "token">;
}) {
  const { isTokenLoaded, performanceUrl } = usePerformanceUrl(
    { host: 'staging.performance.wealthsweet.com' },
    apiParams ?? {},
  );
  if (!isTokenLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <iframe
      src={performanceUrl}
      className="w-full h-[1000px] border-2 border-green-600"
    />
  );
}
```

The context will call the provided callback function before the token expires to get a new token and update the `performanceUrl` automatically.

### Usage - Standalone React Hook

If you would like to handle the state management of the token yourself then the hook can be used standalone as shown below:

```
export default function EmbeddedPerformanceIFrame({
  apiParams,
}: {
  apiParams?: PerformancePageElement["params"]
}) {
  const { isTokenLoaded, performanceUrl } = usePerformanceUrl(
    { host: 'staging.performance.wealthsweet.com' },
    apiParams ?? {},
  );
  if (!isTokenLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <iframe
      src={performanceUrl}
      className="w-full h-[1000px]"
    />
  );
}
```

> [!WARNING]
> The hook needs to be instanciated within a `WealthSweetContext` OR be provided a token. If it is called and no `WealthSweetContext` can be found or no token has been provided in the properties, an error will be thrown.

### Usage - Standalone Function

If you would instead prefer to use this library for types and utilities and do all the React work yourself, you can use the `generateWealthSweetElementUrl` method as shown below:

```
function getPerformanceUrl(params: PerformancePageElement["params"]) {
  return generateWealthSweetElementUrl({
    origin,
    path: "embed/pages/performance",
    params,
  }),
}
```

The `origin` configuration is the same as when using the React Hook and the parameters must include a token for the URL to authenticate with.
