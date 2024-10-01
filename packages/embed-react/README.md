# `@wealthsweet/embed-react`

## Getting Started

### Installation

The fastest way to use WealthSweet is to simply install with your package manager of choice

```
npm install @wealthsweet/embed-react
```

### Usage - React Context

The easiest way to get started with this SDK is to utilise the `WealthSweetContext` so that this library can manage its own state in your browser.

The `WealthSweetContext` takes a single prop `fetchToken` which the `WealthSweetContext` then uses to fetch and update your embedded api token when it needs to.

```
async function fetchToken() {
    /*
    * Add your backend api call here to use your clientId / secret combination to fetch an embed token from the WealthSweet API.
    * In the response include the UTC timestamp that the token expires so that this library can refresh the token before it goes stale
    */
    return fetch('/api/getWealthSweetToken')
}


export function Providers({children}: {children: ReactNode}) {
    return (
        <WealthSweetProvider fetchToken={fetchToken}>{children}</WealthSweetProvider>
    )
}
```

Then wherever you want to display a `WealthSweetElement` you can use the libraries hooks to create the correct `src` attribute for the `iframe`.

The collection of hooks that are exposed take two parameters:

- `origin` which specifies a `host` and a `protocol`, this is to distinguish between our staging / production instance of the application.
  - `protocol`: Defaults to `https` and should not need to be configured
  - `host`: should be set to `staging.performance.wealthsweet.com` for testing purposes and set to `performance.wealthsweet.com` for production instances

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

Before the token expires the context will call the provided callback function to get a new token and update the `performanceUrl` automatically.

### Usage - Standalone React Hook

If you would like to handle the state management of the token yourself then the hook can be used standalone like so.

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
      className="w-full h-[1000px] border-2 border-green-600"
    />
  );
}
```

> [!WARNING]
> The hook needs to be instanciated within a `WealthSweetContext` OR be provided a token, if it is called and it cannot find a `WealthSweetContext` and has not been provided a token in its props an error will be thrown.

### Usage - Standalone Function

If you would instead prefer to just use this library to types and utilities and do all the react work yourself, you can use the `generateWealthSweetElementUrl` method.

```
function getPerformanceUrl(params: PerformancePageElement["params"]) {
    return generateWealthSweetElementUrl({
      origin,
      path: "embed/pages/performance",
      params,
    }),
}
```

The `origin` configuration is the same as when using the React Hook and the params must include a token for the url to authenticate with.
