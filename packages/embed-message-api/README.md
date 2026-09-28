# `@wealthsweet/embed-message-api`

TypeScript types and [Zod](https://zod.dev/) schemas for the messages the embedded WealthSweet page posts to its parent window. React apps can use the hooks in [`@wealthsweet/embed-react`](../embed-react) instead.

```bash
npm install @wealthsweet/embed-message-api
```

## Usage

Check the origin, then validate the message:

```ts
import { embedMessageSchema } from "@wealthsweet/embed-message-api";

window.addEventListener("message", (event) => {
  if (event.origin !== "https://performance.wealthsweet.com") return;

  const result = embedMessageSchema.safeParse(event.data);
  if (!result.success) return;

  const message = result.data;
  switch (message.type) {
    case "INITIALISING_DONE":
      console.log("Report loaded");
      break;
    case "USER_IDLE":
      console.log("Idle since", message.lastActiveTime);
      break;
    case "ERROR":
      console.error(message.message, message.errorDigest);
      break;
  }
});
```

The page posts with target origin `"*"`, because it can't know yours. Always check `event.origin` yourself.

## Messages

Every message has `type`, `messageTime` (Unix time in milliseconds) and an optional `message` string.

| `type`              | Extra fields                     | When it is sent                                                                                       |
| ------------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `INITIALISING`      |                                  | Reserved. The page doesn't send it at the moment.                                                     |
| `INITIALISING_DONE` |                                  | Once, when the page has loaded                                                                        |
| `RENDERING`         |                                  | When the page's message component re-renders. Don't treat it as a signal that the report has changed. |
| `RENDERING_DONE`    |                                  | After each `RENDERING`                                                                                |
| `USER_EVENT`        | `userEventTime: number \| null`  | When the user interacts with the page, at most once a second                                          |
| `USER_IDLE`         | `lastActiveTime: number \| null` | After one second without interaction, then every second until the user interacts again                |
| `ERROR`             | `errorDigest?: string`           | When the page shows an error. `errorDigest` identifies the error for WealthSweet support.             |

These events count as interaction: `mousemove`, `keydown`, `wheel`, `DOMMouseScroll`, `mousewheel`, `mousedown`, `touchstart`, `touchmove`, `MSPointerDown`, `MSPointerMove`, `visibilitychange` and `focus`.

Messages describe the page's state only. They never contain user or portfolio data.
