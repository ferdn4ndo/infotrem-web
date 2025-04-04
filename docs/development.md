# Development

## Environment

Use Node.js `>=26 <27` and Yarn 1.x.

```sh
corepack enable
yarn install
yarn dev
```

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

Layout components live in `src/components/layout`. Small reusable controls live in `src/components/input`. Feed-specific presentation lives in `src/components/feed`.

When adding a component:

- Keep styling scoped by default.
- Follow the existing `ComponentName-Element` class naming style.
- Prefer service calls or props for data rather than importing mock arrays directly.
- Register new FontAwesome icons in `src/plugins/font-awesome.plugin.ts`.

## Services And Types

Services in `src/services` return promises even when backed by local constants. Preserve that shape for future backend integration.

Types are simple exported aliases in `src/types`. Prefer `export type` for type-only exports in new files.

## Editor

The repo recommends Volar, ESLint, and Prettier extensions in `.vscode/extensions.json`. Volar is needed for Vue SFC type support.
