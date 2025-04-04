# InfoTrem Web

InfoTrem Web is a Vue 3 + Vite frontend for browsing railway-related media, menu navigation, and profile/header UI experiments. The current app uses local mock services for feed and menu data while the UI structure, routing, styling, and test tooling are being built out.

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
- `src/router/index.ts` defines the current `/`, `/feed`, and `/about` routes.
- `src/services/` contains local async mock data services for feed and menu content.
- `src/components/` contains layout, input, feed, table, and starter Vue components.
- `src/styles/` defines global CSS variables, breakpoints, and shared SCSS variables.
- `cypress/` contains the Cypress e2e scaffold.
- `docs/` contains deeper project notes for humans and agents.

## Documentation

- `AGENTS.md` documents repo-specific guidance for AI/code agents.
- `docs/architecture.md` describes the runtime architecture and source layout.
- `docs/development.md` covers local setup, conventions, and coding notes.
- `docs/testing-and-ci.md` covers tests, linting, CI, and current verification caveats.

## Tooling Notes

The project has moved to ESLint flat config in `eslint.config.js`. TypeScript path aliases are configured for `@/*` and `~/*` in app/test configs and should point at `src/*`; Vite also maps `@` to `src`.
