# InfoTrem Web

InfoTrem Web is a Vue 3 + Vite frontend for InfoTrem. It includes
auth/account flows, contact, media and album discovery, guided
media upload, search, map results, generic resource browsing,
information contributions, and staff/admin resource management.

## Requirements

- Node.js `>=26 <27` (`.nvmrc` pins major version `26`; use [nvm](https://github.com/nvm-sh/nvm))
- Yarn 1.x installed globally under that Node version (`npm install -g yarn`)

```sh
nvm install
nvm use
npm install -g yarn   # if yarn is not on PATH after switching Node versions
yarn install
```

From the parent `infotrem` repo: `make setup-node` or `make bootstrap`.

## Common Commands

```sh
yarn dev
yarn build
yarn lint
yarn test
yarn test:e2e:dev
```

`yarn build` runs `vue-tsc` type checking and then builds with Vite. `yarn lint` runs ESLint, Stylelint, and Prettier checks. CI runs install, lint, and unit tests on Ubuntu with Node 26.

## Project Layout

- `src/main.ts` boots Vue, Pinia, Vue Router, global SCSS, and FontAwesome.
- `src/App.vue` owns the app shell: fixed header, side menu toggle, profile collapse, and routed content.
- `src/router/index.ts` defines public, account, media, album, resource, and
  staff/admin routes.
- `src/services/http/` contains the shared API client, errors, and pagination
  helpers.
- `src/services/api/` contains backend-backed feature services, permissions, and
  the resource registry.
- `src/stores/auth.store.ts` owns token persistence, `/me` hydration, and
  account mutations.
- `src/components/` contains layout, common primitives, input helpers, feed, and
  table components.
- `src/styles/` defines global CSS variables, breakpoints, and shared SCSS variables.
- `cypress/` contains Cypress e2e specs and support code.
- `docs/` contains deeper project notes for humans and agents.

## Documentation

- [`AGENTS.md`](./AGENTS.md) documents repo-specific guidance for AI/code agents.
- [`docs/architecture.md`](./docs/architecture.md) describes the runtime architecture and source layout.
- [`docs/backend-integration.md`](./docs/backend-integration.md) documents the current API integration and endpoint usage.
- [`docs/development.md`](./docs/development.md) covers local setup, conventions, and coding notes.
- [`docs/testing-and-ci.md`](./docs/testing-and-ci.md) covers tests, linting, CI, and current verification caveats.

## Tooling Notes

The app calls the backend using `VITE_INFOTREM_API_BASE_URL` as the request
base URL. This env var is required for both dev and production builds.

The project has moved to ESLint flat config in `eslint.config.js`. TypeScript path aliases are configured for `@/*` and `~/*` in app/test configs and should point at `src/*`; Vite also maps `@` to `src`.
