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

## Listening to messages

Once the WealthSweet UI is loaded into your iframe the WealthSweet UI will begin posting messages to its parent window via the browser [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) api.

Internally this is done with code similar to

```
window.parent.postMessage(message, "*");
```

> [!IMPORTANT]
> WealthSweet posts messages to the **immediate parent** of the window in which it is loaded. So listening to those messages has to be done by the immediate parent.
> Mutliple levels of `iframe` nesting is will not propogate messages to grandparents and older relatives.

> [!NOTE]
> Since WealthSweet does not know the domain that the parent window is hosted on we post this message to _any_ domain (`*`).
> The messages that WealthSweet posts are purely lifecycle messages of the WealthSweet application and will **NEVER** contain user information.
> The WealthSweet SDK requires that a `origin` be supplied to read from the `postMessage` api, this is so that the SDK can check that the message originates from the expected `origin` of the WealthSweet UI (via the `event.origin` field).
> All messages not from this `origin` will be ignored.

### Hook: useWealthSweetMessages

The `useWealthSweetMessages` hook is a way to supply typesafe callbacks that will be called when the SDK receives an `EmbedMessage` from the `postMessage` api.

`useWealthSweetMessages` Params
| Parameter | Description |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `origin` | The origin server you expect messages to be coming from (AKA the same server the iframe is loaded from). <br> Specifies a host and a protocol to distinguish between our staging / production instance of the application. <br><ul><li>protocol: Defaults to https and should not need to be configured</li><li>host: Set to staging.performance.wealthsweet.com for testing purposes and performance.wealthsweet.com in production</li></ul> |
| `onMessage` | A callback that will be called when any `EmbedMessage` message is received |
| `onError` | A callback that will be called when an `EmbedMessageError` message is received |
| `onInitialising` | A callback that will be called when an `EmbedMessageInitialising` message is received |
| `onInitialisingDone` | "A callback that will be called when an `EmbedMessageInitialisingDone` message is received |
| `onRendering` | A callback that will be called when an `EmbedMessageRendering` message is received |
| `onRenderingDone` | A callback that will be called when an `EmbedMessageRenderingDone` message is received |
| `onUserEvent` | A callback that will be called when an `EmbedMessageUserEvent` message is received. <br> The following events on the `iframe` are listened to and if any are triggered then we fire this message; <br> <ul><li>`mousemove`</li><li>`keydown`</li><li>`wheel`</li><li>`DOMMouseScroll`</li><li>`mousewheel`</li><li>`mousedown`</li><li>`touchstart`</li><li>`touchmove`</li><li>`MSPointerDown`</li><li>`MSPointerMove`</li><li>`visibilitychange`</li></ul> <br> User events are throttled to one message per second |
| `onUserIdle` | A callback that will be called when an `EmbedMessageUserIdle` message is received. <br> An `onUserIdle` message is sent if the user has not been active for one second and contains the last time that the user was active. |

### Hook: useIdleStatus

The `useIdleStatus` hook is a wrapper around the `useWealthSweetMessages` hook and listens to `onUserEvent` and `onUserIdle` messages.

`useWealthSweetMessages` Parameters
| Parameter | Description |
| --- | --- |
| `origin`: object | The origin server you expect messages to be coming from (AKA the same server the iframe is loaded from). <br> Specifies a host and a protocol to distinguish between our staging / production instance of the application. <br> <ul> <li>protocol: Defaults to https and should not need to be configured</li><li>host: Set to staging.performance.wealthsweet.com for testing purposes and performance.wealthsweet.com in production</li></ul> |
| `timeout`: number | A timeout in `ms` for for how long to wait untill this hook reports a status of `isIidle = true`. <br> The default for `timeout` is 10 minutes |
| `onIdle`: () => void | A callback that will be called after a user has been idle for `timeout` ms. |
| `onAction`: () => void | A callback to forward to the onUserEvent callback function. This will be called for every user event. |

`useWealthSweetMessages` Returns
| Parameter | Description |
| --- | ---|
| `lastActiveTime`: number | The last time that the user was active as a Unix Timestamp in `ms` |
| `isIdle`: boolean | Whether the user is currently idle |
