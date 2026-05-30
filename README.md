# InfoTrem Web

InfoTrem Web is a Vue 3 + Vite frontend for InfoTrem. It now includes
backend-backed auth/account flows, contact, media and album discovery,
guided media upload, search, map results, generic resource browsing,
information contributions, and staff/admin resource management.

## Requirements

- Node.js `>=26 <27`
- Yarn 1.x via Corepack or a compatible global Yarn install

```sh
corepack enable
yarn install
```

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
- `src/services/api/` contains backend-backed feature services.
- `src/stores/auth.store.ts` owns token persistence, `/me` hydration, and
  account mutations.
- `src/components/` contains layout, input, feed, table, and starter Vue components.
- `src/styles/` defines global CSS variables, breakpoints, and shared SCSS variables.
- `cypress/` contains the Cypress e2e scaffold.
- `docs/` contains deeper project notes for humans and agents.

## Documentation

- `AGENTS.md` documents repo-specific guidance for AI/code agents.
- `docs/architecture.md` describes the runtime architecture and source layout.
- `docs/backend-integration.md` describes the planned API client, auth, routing, and service integration strategy.
- `docs/development.md` covers local setup, conventions, and coding notes.
- `docs/testing-and-ci.md` covers tests, linting, CI, and current verification caveats.

## Tooling Notes

The app calls the backend through same-origin `/api/*`; Vite dev/preview proxy
rewrites that path to `VITE_INFOTREM_API_BASE_URL`. In production this same
path should be routed by the deployment gateway or reverse proxy.

The project has moved to ESLint flat config in `eslint.config.js`. TypeScript path aliases are configured for `@/*` and `~/*` in app/test configs and should point at `src/*`; Vite also maps `@` to `src`.
