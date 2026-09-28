---
"@wealthsweet/embed-react": minor
---

Fix message delivery and declare runtime dependencies

- Messages are delivered when `origin` omits `protocol`. It now defaults to `https`, as the URL builder already did
- `isListeningToMessages` is `true` while the hook is mounted
- A deprecated `currencyIsoCode` param is sent as `reportingCurrencyIsoCode`
- `@wealthsweet/http-apis` and `@wealthsweet/embed-message-api` are dependencies, so the published types resolve
