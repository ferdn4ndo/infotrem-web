# Testing And CI

## Unit Tests

Unit tests use Vitest with the `jsdom` environment. The config is in `vitest.config.ts`, which merges the Vite config so tests share aliases and Vue plugin setup.

Run unit tests with:

```sh
yarn test
```

The current unit test surface is still minimal and includes the starter `HelloWorld` component test.

## E2E Tests

Cypress config lives in `cypress.config.ts`. E2E specs are under `cypress/e2e`, with support files under `cypress/support`.

Run e2e tests against a dev server:

```sh
yarn test:e2e:dev
```

Run e2e tests against a production preview:

```sh
yarn build
yarn test:e2e
```

The Cypress base URL is `http://localhost:4173`.

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

CodeQL analysis is configured separately in `.github/workflows/codeql.yml` for JavaScript/TypeScript.

## Dependency Automation

Dependabot is configured in `.github/dependabot.yml` for npm packages and GitHub Actions. It groups core frontend tooling separately from linting/formatting tools.

## Current Verification Caveat

The repo target is Node 26. Running tests on older local Node versions can produce dependency loader failures that are not representative of CI. Use Node 26 before treating local test failures as authoritative.
