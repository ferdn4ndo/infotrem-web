# AGENTS.md

## Repo Snapshot

InfoTrem Web is a Vue 3 single-page app built with Vite, TypeScript, Pinia, Vue Router, SCSS, FontAwesome, Vitest, Cypress, ESLint, Stylelint, and Prettier. It is backend-backed through the InfoTrem API using the shared HTTP client under `src/services/http` and feature services under `src/services/api`.

The runtime target is Node.js `>=26 <27`. CI uses GitHub Actions on `ubuntu-latest` with `actions/setup-node@v6` and `node-version: 26.x`.

## Important Files

- `src/main.ts` creates the app, registers Pinia, Vue Router, global SCSS, and FontAwesome.
- `src/App.vue` controls the app shell: header, side menu, profile collapse panel, and router outlet.
- `src/router/index.ts` defines public, auth/account, media, album, generic resource, and staff/admin routes.
- `src/services/api/` contains backend-backed API modules for auth, contact, resources, media, albums, search, map, social actions, and information contributions.
- `src/services/feed.service.ts` maps `/media` rows to legacy feed cards and only uses mock data when explicitly enabled for development.
- `src/plugins/font-awesome.plugin.ts` is the single place to register FontAwesome icons before use.
- `src/styles/colors.scss` defines CSS custom properties for light/dark themes.
- `src/styles/variables.scss` defines SCSS breakpoints and z-index tokens.
- `eslint.config.js`, `.stylelintrc.json`, and `.prettierrc.json` define formatting and lint behavior.
- `.github/workflows/ci.yml` runs install, lint, and unit tests.

## Conventions

- Prefer Vue single-file components with `<script setup lang="ts">`.
- Use `@/` or `~/` imports for files under `src`; avoid long relative imports when crossing feature folders.
- Keep shared types under `src/types` and export them with `export type` when possible.
- Register any new FontAwesome icon in `src/plugins/font-awesome.plugin.ts` before using it in templates.
- Keep SCSS component styles scoped unless a style is intentionally global.
- Use existing BEM-like class naming, such as `ComponentName-Element` and `ComponentName--modifier`.
- Keep service calls asynchronous, even for mock data, so replacing them with real HTTP APIs is less disruptive.

## Current Findings

- `src/stores/counter.ts`, starter welcome/icon components, and starter tests still look like Vue template scaffolding and should not guide new backend-backed work.
- `public/sw.js` is a self-destroying service worker and explicitly says it should not be version controlled.
- Some backend features are intentionally still generic or shallow: operational endpoints, FileMgr storage discovery, deep nested railway detail pages, and fully stateful reactions.
- Local verification may fail on older Node runtimes. Use Node 26 for meaningful results.

## Commands

```sh
yarn install
yarn dev
yarn build
yarn lint
yarn test
yarn test:e2e:dev
```

Use `yarn --frozen-lockfile` in CI or when checking that `yarn.lock` is already in sync.

## Agent Workflow

1. Read `README.md` and the relevant file under `docs/` before changing broad behavior.
2. Keep edits small and aligned with the current Vue/Vite patterns.
3. Run `yarn lint` after code or docs formatting changes when Node 26 is available.
4. Run `yarn test` for logic, component, or dependency changes.
5. Do not commit generated artifacts such as `dist`, `coverage`, Cypress screenshots/videos, or `node_modules`.

For backend integration work, read `docs/backend-integration.md` before changing
API services, auth state, route guards, or backend-backed views.
