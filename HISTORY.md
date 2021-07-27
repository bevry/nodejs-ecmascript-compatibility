# History

## v4.2.1 2021 July 28

-   Fixed the functionality of `v4.2.1` for its intended use case

## v4.2.0 2021 July 28

-   For the simpler API methods, it now supports a fallback return pre-seeded by a specified ECMAScript version (defaults to `ES5`) for when the API is inaccessible or the Node.js release has not yet had data added for it, such as Node.js v0.8.x.

## v4.1.0 2021 July 28

-   Now supports significant Node.js version numbers, such as `12` or `0.12`

## v4.0.0 2021 July 28

-   Prior `fetchExclusiveCompatibleESVersionsForNodeVersions` is now `fetchAllCompatibleESVersionsForNodeVersions`
-   `fetchExclusiveCompatibleESVersionsForNodeVersions` now only returns the minimum amount of ECMAScript versions that are required to support the specified Node.js releases, which was its intent

## v3.0.0 2021 July 28

-   Same API, however additional properties and methods for simplifying the identification of which ECMAScript versions are actually compatible

## v2.0.0 2021 July 27

-   Now explicit about what version is what
-   Now includes the information of the versions in each ECMAScript version compatibility result for simplicity

## v1.0.0 2021 July 26

-   Initial working release
