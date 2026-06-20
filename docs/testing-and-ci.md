# Testing And CI

## Unit Tests

Unit tests use Vitest with the `jsdom` environment. `vitest.config.ts` merges Vite config so aliases and Vue transforms match app runtime behavior.

Run unit tests with:

```sh
yarn test
```

Current suite size is approximately:

- 54 spec files
- 164 tests

Coverage is centered on shipped behavior, including:

- common/form/layout components and accessibility behavior
- route pages (public, account, auth, admin)
- API service modules and API contract expectations
- auth store + route-access/redirect guard logic
- permissions gating utilities

## E2E Tests

Cypress config lives in `cypress.config.ts`. Specs are under `cypress/e2e`, with shared setup in `cypress/support`.

Run e2e tests against a dev server:

```sh
yarn test:e2e:dev
```

Run e2e tests against a production preview:

```sh
yarn build
yarn test:e2e
```

The Cypress base URL is `http://localhost:4173`. In this environment, headless Cypress execution is currently blocked by a missing system dependency (`libnspr4.so`). Specs are still maintained as TypeScript e2e coverage.

## Linting And Formatting

Run all lint checks with:

```sh
yarn lint
```

This runs:

- ESLint over `src`
- Stylelint over `src/**/*.{css,scss,sass,html,vue}`
- Prettier check over `src`

Use `yarn lint:fix` for formatter and ESLint autofixes.

## Continuous Integration

`.github/workflows/ci.yml` runs on pushes and pull requests targeting `main`. The job uses:

- `ubuntu-latest`
- Node `26.x`
- `actions/checkout@v6`
- `actions/setup-node@v6`
- Yarn dependency caching through `setup-node`

The CI command sequence is:

```sh
yarn --frozen-lockfile
yarn lint
yarn test
```

CI currently runs lint + unit tests; it does not run Cypress e2e in this workflow.

CodeQL analysis runs separately in `.github/workflows/codeql.yml` for JavaScript/TypeScript.

## Dependency Automation

Dependabot is configured in `.github/dependabot.yml` for npm packages and GitHub Actions. It groups core frontend tooling separately from linting/formatting tools.

## Verification Caveat

The repo target is Node 26. Running checks on older local Node versions can produce dependency/runtime failures that are not representative of CI.
