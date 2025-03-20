---
"@wealthsweet/http-apis": major
---

### Breaking Change: Public Storage Name Renamed

#### What Changed

The public storage name in the API has been renamed to hide implementation details. This change improves encapsulation and ensures that internal implementation details are not exposed as part of the public API.

#### Why This Was Made

Exposing implementation details through public storage names can lead to unintended dependencies on internal structures. By renaming the storage name, we ensure a cleaner and more maintainable API surface.

#### How to Update Your Code

If your code references the name service name `azure`, you will need to update it to use the new name `pubStorage`.
