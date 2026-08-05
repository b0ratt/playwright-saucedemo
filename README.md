# playwright-saucedemo

End-to-end tests for [saucedemo.com](https://www.saucedemo.com) written in Playwright + TypeScript.

## Test scope

- **`tests/e2e/login.spec.ts`**
  - `TC-01` (positive, `@smoke`) — logging in as a valid user (`standard_user`) lands on the
    product list,
  - `TC-02`–`TC-04` (negative, `@regression`, data-driven) — wrong password, locked out user
    (`locked_out_user`), empty credentials.
- **`tests/e2e/cart.spec.ts`**
  - `TC-05` (positive, `@smoke`) — adding a product updates the cart badge and the cart contents,
  - `TC-06` (`@regression`) — adding multiple products increases the badge count,
  - `TC-11` (`@regression`) — removing the last product hides the cart badge.
- **`tests/e2e/checkout.spec.ts`**
  - `TC-07` (positive, `@smoke`) — full path: cart → personal info → order overview (product and
    totals consistent with the cart, `total = subtotal + tax`) → placing the order,
  - `TC-08` (`@regression`) — continuing without personal info shows a validation error,
  - `TC-09` (`@regression`) — canceling on the overview step returns to the product list,
  - `TC-10` (`@regression`) — the downloaded PDF receipt contains the customer details, the
    product, and the total amount shown on the overview screen.

## Project structure

```
pages/        Page Object Model — BasePage (goto/loginViaCookie/expectLoaded) plus
              LoginPage, InventoryPage, CartPage, CheckoutInfoPage,
              CheckoutOverviewPage, CheckoutCompletePage
fixtures/     base.ts — Playwright fixture (test.extend()): loginPage/inventoryPage/cartPage/
              checkoutInfoPage/checkoutOverviewPage/checkoutCompletePage
test-data/    users.ts, products.ts, checkout.ts — static test data
utils/        cart.ts — cart seeding via localStorage (seedCart)
tests/e2e/    test specifications
```

The Page Object Model separates page access logic from test assertions, so a selector change in
one place does not require editing multiple tests. Selectors are based on `data-test` attributes,
which are stable and independent of styling or user-visible text.

`fixtures/` contains only actual Playwright fixtures (`test.extend()`) — `base.ts` extends the
base `test` with ready-made Page Object instances (`loginPage`, `inventoryPage`, `cartPage`), so
tests never construct them manually (`new LoginPage(page)`); they just declare the fixture they
need as a test parameter.

`pages/BasePage.ts` — every page declares its own `url` and inherits three methods: `goto()`
(plain navigation), `loginViaCookie()` (injects the `session-username` session cookie, skipping
the login form, then navigates straight to the page's `url`), and a default `expectLoaded()`
(URL assertion built from `url`, extended in subclasses with additional checks where needed).

`tests/e2e/cart.spec.ts` and `tests/e2e/checkout.spec.ts` do not test the login flow, so instead
of going through the login form they call `loginViaCookie()` on the target page
(`inventoryPage.loginViaCookie()`, `cartPage.loginViaCookie()`) — each lands directly on its own
`url` with no intermediate hops. `checkout.spec.ts` additionally seeds the cart without clicking
"Add to cart": `utils/cart.ts` (`seedCart`) injects the `cart-contents` entry into `localStorage`
via `page.addInitScript()`.

`CheckoutCompletePage.downloadOrderPdfText()` captures the `download` event triggered by the
"Generate PDF order" button, reads the downloaded file from disk and extracts its text with the
`pdf-parse` library — this lets `TC-10` verify the actual receipt content, not just the fact that
a file was downloaded.

## Test tagging

Tests are tagged `@smoke` (critical path) and `@regression` (remaining cases) using Playwright's
native tag mechanism. This allows running a subset of tests, e.g. a quick smoke run in CI on every
PR and the full regression suite before a release.

## Requirements

- Node.js version from `.nvmrc` (currently 20; `nvm use` picks it up automatically)
- npm

## Installation

```bash
npm install
npx playwright install
```

## Running tests

```bash
npm test                # all tests, headless
npm run test:headed     # with a visible browser
npm run test:ui         # Playwright UI mode
npm run test:smoke      # @smoke tests only
npm run test:regression # @regression tests only
npm run report          # open the HTML report from the last run
```

The browsers the tests run on are configured in `playwright/playwright.config.ts`
(the `projects` section).

## Code quality

The project uses Prettier (formatting), ESLint (static analysis, including
`eslint-plugin-playwright` rules such as detecting tests without assertions) and the TypeScript
compiler as a type gate:

```bash
npm run format         # format files
npm run format:check   # check formatting without modifying (e.g. in CI)
npm run lint           # static analysis
npm run lint:fix       # static analysis with autofix where possible
npm run typecheck      # TypeScript type check (tsc --noEmit)
```

## CI

`.github/workflows/playwright.yml` runs on push/PR to `master`: installs dependencies (Node
version from `.nvmrc`), checks formatting (`format:check`), lint and types (`typecheck`), caches
browser binaries, runs the full test suite and publishes the HTML report as a build artifact.
