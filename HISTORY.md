# History

## v5.8.0 2023 December 30

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)
-   Thank you to the sponsors: [Andrew Nesbitt](https://nesbitt.io), [Balsa](https://balsa.com), [Codecov](https://codecov.io), [Poonacha Medappa](https://poonachamedappa.com), [Rob Morris](https://github.com/Rob-Morris), [Sentry](https://sentry.io), [Syntax](https://syntax.fm)

## v5.7.0 2023 December 28

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)
-   Thank you to the sponsors: [Andrew Nesbitt](https://nesbitt.io), [Balsa](https://balsa.com), [Codecov](https://codecov.io/), [Poonacha Medappa](https://poonachamedappa.com), [Rob Morris](https://github.com/Rob-Morris), [Sentry](https://sentry.io), [Syntax](https://syntax.fm)

## v5.6.0 2023 December 6

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v5.5.0 2023 November 25

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v5.4.0 2023 November 21

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v5.3.0 2023 November 20

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v5.2.0 2023 November 20

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v5.1.0 2023 November 2

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v5.0.0 2023 November 1

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)
-   Updated license from [`MIT`](http://spdx.org/licenses/MIT.html) to [`Artistic-2.0`](http://spdx.org/licenses/Artistic-2.0.html)
-   Minimum required node version changed from `node: >=10` to `node: >=18` to keep up with mandatory ecosystem changes
-   No longer uses `node-fetch`, instead uses the [Node.js `fetch` builtin](https://nodejs.org/api/globals.html#fetch)
-   Changed default threshold to 85% to support ES2018 with Node.js 14

## v4.5.0 2021 July 30

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v4.4.0 2021 July 29

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

## v4.3.0 2021 July 28

-   Updated dependencies, [base files](https://github.com/bevry/base), and [editions](https://editions.bevry.me) using [boundation](https://github.com/bevry/boundation)

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
