---
"@wealthsweet/http-apis": patch
"@wealthsweet/embed-react": patch
"@wealthsweet/embed-message-api": patch
---

Rewrite the READMEs to match the embed API

- Document the current hook signatures, the staging host and the units of both `expires` values
- Describe when each message is sent, including that `INITIALISING` isn't sent and `USER_IDLE` repeats
- Document branding overrides, token scoping and the token endpoint's errors
- The spec states that `expires` is in seconds and links to this repository instead of a dead docs site
