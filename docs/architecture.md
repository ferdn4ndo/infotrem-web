# Architecture

## Overview

InfoTrem Web is a client-side Vue application. The browser entry point is `index.html`, which loads `src/main.ts`. The app renders into `#app`, installs Pinia and Vue Router, registers FontAwesome, and imports global SCSS.

The app currently has no backend integration. Feed and menu data come from async mock services in `src/services`, which makes the UI behave like it is waiting on external data without adding network dependencies yet.

## Runtime Flow

1. `src/main.ts` imports global styles and creates the Vue app.
2. `prepareIconsLibrary()` registers all FontAwesome icons used by templates.
3. Pinia and the router are installed.
4. `src/App.vue` renders the fixed header, optional side menu, optional profile collapse card, and `RouterView`.
5. Route components load page-specific components and data.

## Routes

`src/router/index.ts` currently defines:

- `/` rendering `HomeView.vue`
- `/feed` rendering `FeedView.vue`
- `/about` lazy-loading `AboutView.vue`

`MediaView.vue` exists and currently mirrors `FeedView.vue`, but it is not wired into the router.

## Source Areas

- `src/components/layout`: header, side menu, profile toolbar/collapse, and reusable card layout.
- `src/components/input`: simple flat button and text input components.
- `src/components/feed`: feed list and feed card presentation.
- `src/components/table`: media metadata display.
- `src/services`: async mock repositories for feed and menu data.
- `src/types`: shared TypeScript shapes for feed media, menu items, menu lists, and users.
- `src/styles`: global theme variables and shared SCSS tokens.
- `src/plugins`: app-level plugin setup, currently FontAwesome.

## Styling

Global styles are loaded from `src/styles/main.scss`. Color tokens are exposed as CSS custom properties from `src/styles/colors.scss` and switch for dark mode via `prefers-color-scheme`. Vite injects `src/styles/variables.scss` into SCSS blocks, so component styles can use variables such as `$breakpoint-large` without importing them.

Components mostly use scoped SCSS and a BEM-like class convention. Keep new component styles scoped unless the intent is clearly global.

## Data Boundaries

The app does not have a real API client yet. `feed.service.ts` and `menu.service.ts` should be treated as repository boundaries: keep component code calling services instead of importing mock data directly. This will make a later HTTP migration easier.

## Known Gaps

- `menu.service.ts` links one child menu item to `/inspire`, but that route does not exist.
- Feed date display is still a placeholder in `FeedItem.vue`.
- Starter Vue template components and tests remain in the repo.
- `public/sw.js` is a self-destroying service worker and may be leftover generated output.
