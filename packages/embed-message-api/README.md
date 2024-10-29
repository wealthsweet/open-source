# `@wealthsweet/embed-message-api`

This is a library of the message schemas that WealthSweet embedded packages use for messages sent through the `postMessage` browser api.

This library creates:

- TypeScript types of the messages being sent via the `postMessage` api
- A Zod Validation Schema of the Embedded message that will validate the message satisfies one of the wealthsweet message types

To generate these files to the `dist` directory, run the following command:

```
pnpm build
```
