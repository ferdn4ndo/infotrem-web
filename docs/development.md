# Development

## Environment

Use Node.js `>=26 <27` and Yarn 1.x. The repo ships `.nvmrc` with major version
`26`.

```sh
nvm install
nvm use
npm install -g yarn   # once per Node version when yarn is missing
yarn install
yarn dev
```

When working from the parent `infotrem` repo, `make setup-node` performs the same
toolchain setup and `make web-dev` runs Vite through `./scripts/with-node.sh`.

The development server is provided by Vite. Production preview uses Vite's preview server on port `4173`, which is also the base URL for Cypress e2e tests.

## Scripts

- `yarn dev`: start Vite in development mode.
- `yarn build`: run `vue-tsc`, then build with Vite.
- `yarn preview`: serve the production build locally.
- `yarn lint`: run ESLint, Stylelint, and Prettier checks.
- `yarn lint:fix`: run Prettier and ESLint fixers.
- `yarn test`: run unit tests with Vitest.
- `yarn test:e2e:dev`: run Cypress against a dev server.
- `yarn test:e2e`: run Cypress against the Vite preview server.

## Code Style

Use Vue SFCs with `<script setup lang="ts">` for new components. Prefer typed props and emits. Keep shared types under `src/types`.

Imports from application code should generally use `@/` or `~/`, both of which resolve to `src` in app/test TypeScript configs. Vite maps `@` to `src`.

The repo uses:

- ESLint flat config in `eslint.config.js`
- Stylelint with `postcss-html` for Vue/SCSS files
- Prettier with no semicolons, single quotes, width `100`, and two-space indentation

## Components

Layout components live in `src/components/layout`. Shared primitives and domain-agnostic building blocks live in `src/components/common`. Legacy small controls still exist in `src/components/input` and are used by the header/search shell.

When adding a component:

- Keep styling scoped by default.
- Follow the existing `ComponentName-Element` class naming style.
- Prefer service calls or props for data rather than in-component request duplication.
- Register new FontAwesome icons in `src/plugins/font-awesome.plugin.ts`.

## Services And Types

Services in `src/services/api` are backend-backed and should remain the API boundary for views/components. The metadata registry in `src/services/api/resources.ts` powers generic resource flows in `ResourceListView`, `ResourceDetailView`, and `AdminResourceView`.

Use `ResourceForm` + `RelationManager` for metadata-driven CRUD and nested relations where possible. Prefer bespoke pages only when the UX needs richer aggregate behavior (for example `MediaDetailView`, `AlbumDetailView`, `CompanyDetailView`, `LocationDetailView`, `RollingStockDetailView`, `RouteDetailView`).

Role/access checks for both routes and action buttons should stay aligned with `src/services/api/permissions.ts` and `src/router/index.ts` guards.

Types are exported from `src/types`; prefer `export type` for type-only exports in new files.

## Editor

The repo recommends Volar, ESLint, and Prettier extensions in `.vscode/extensions.json`. Volar is needed for Vue SFC type support.
