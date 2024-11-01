# `@wealthsweet/embed-react`


## Installation

The fastest way to use WealthSweet is to simply install with your package manager of choice.

```
npm install @wealthsweet/embed-react
```

## Usage

There are many possible approaches to embedding WealthSweet in your application. Some approaches are simple, and are
designed to work out of the box. Other approaches are more complex, but allow fine-grained control over the embedded
WealthSweet components.

### Approach 1: React Context

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

### Approach 2: Standalone React Hook

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
> The hook needs to be instantiated within a `WealthSweetContext` OR be provided a token. If it is called and no `WealthSweetContext` can be found or no token has been provided in the properties, an error will be thrown.

### Approach 3: Standalone Function

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
> Multiple levels of `iframe` nesting will not propagate messages to grandparents and older relatives.

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
| `onMessage` | A callback that executes when the page receives any `EmbedMessage` message |
| `onError` | A callback that executes when the page receives an `EmbedMessageError` message |
| `onInitialising` | A callback that executes when the page receives an `EmbedMessageInitialising` message |
| `onInitialisingDone` | A callback that executes when the page receives an `EmbedMessageInitialisingDone` message |
| `onRendering` | A callback that executes when the page receives an `EmbedMessageRendering` message |
| `onRenderingDone` | A callback that executes when the page receives an `EmbedMessageRenderingDone` message |
| `onUserEvent` | A callback that executes when the page receives an `EmbedMessageUserEvent` message. <br> The `iframe` will fire this message if any of the following events occur within it; <br> <ul><li>`mousemove`</li><li>`keydown`</li><li>`wheel`</li><li>`DOMMouseScroll`</li><li>`mousewheel`</li><li>`mousedown`</li><li>`touchstart`</li><li>`touchmove`</li><li>`MSPointerDown`</li><li>`MSPointerMove`</li><li>`visibilitychange`</li></ul> <br> User events are throttled to one message per second |
| `onUserIdle` | A callback that executes when the page receives an `EmbedMessageUserIdle` message. <br> An `onUserIdle` message is sent if the user has not been active for one second. This message contains the last time that the user was active. |

### Hook: useIdleStatus

The `useIdleStatus` hook is a convenient wrapper around the `useWealthSweetMessages` hook that listens to `onUserEvent` and `onUserIdle` messages.

`useWealthSweetMessages` Parameters
| Parameter | Description |
| --- | --- |
| `origin`: object | The origin server you expect messages to be coming from (AKA the same server the iframe is loaded from). <br> Specifies a host and a protocol to distinguish between different instances of the WealthSweet service. <br> <ul> <li>protocol: Defaults to https and should not need to be configured</li><li>host: Set to staging.performance.wealthsweet.com for testing purposes and performance.wealthsweet.com in production</li></ul> |
| `timeout`: number | A timeout in `ms`  for how long to wait until this hook reports a status of `isIidle = true`. <br> The default for `timeout` is 10 minutes |
| `onIdle`: () => void | A callback that executes after a user has been idle for `timeout` ms. |
| `onAction`: () => void | A callback that executes when a user event occurs (based on the `onUserEvent` callback function). |

`useWealthSweetMessages` Returns
| Parameter | Description |
| --- | ---|
| `lastActiveTime`: number | The last time that the user was active as a Unix Timestamp in `ms` |
| `isIdle`: boolean | This is `true` if the user is currently idle |
