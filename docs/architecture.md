# Architecture

## Overview

InfoTrem Web is an API-backed Vue 3 + Vite + TypeScript SPA. `src/main.ts` initializes theme state, registers FontAwesome, installs Pinia and Vue Router, then mounts `src/App.vue`. The app shell provides the fixed header, responsive side menu, profile drawer, and a single routed `<main>` landmark.

## Source Layout

- `src/views`: route pages split by area (`public`, `auth`, `account`, `admin`).
- `src/components/common`: reusable UI and form primitives (`AppField`, `AppInput`, `AppTextarea`, `AppSelect`, `AppCheckbox`, `AppButton`, `EntityPicker`, `ConfirmDialog`, `StatusMessage`, `EmptyState`, `AppSkeleton`, `AppPagination`, `AppCard`, `AppSpinner`).
- `src/components/layout`: application shell components (`TheHeader`, `SideMenu`, profile widgets).
- `src/components/table`: table-specific presentation.
- `src/services/http`: shared HTTP client and API error handling.
- `src/services/api`: feature APIs, permissions gating, entity routing, and the metadata-driven resource registry.
- `src/stores`: Pinia stores (`auth.store.ts` for token/session state).
- `src/composables`: reusable composition helpers such as `useTheme`.
- `src/router`: route map and access guards.
- `src/styles`: global styles, design tokens, and SCSS variables.

## API And Auth Flow

`src/services/http/api-client.ts` prefixes calls with `/api`, serializes query params, parses JSON/204 responses, and injects `Authorization: Token <token>` when available. `src/stores/auth.store.ts` persists the token in local storage, hydrates `/me`, exposes `isLoggedIn`/`isStaff`/`isAdmin`, and owns login/register/profile/logout actions.

## Resource Framework And Bespoke Pages

The app uses a generic resource framework driven by `src/services/api/resources.ts`:

- Resource metadata (`ResourceConfig` + `RelationConfig`) defines endpoint paths, fields, access scope, and relations.
- Generic pages: `ResourceListView`, `ResourceDetailView`, and `AdminResourceView`.
- Generic editing and nested management: `ResourceForm` and `RelationManager`.
- Social and ownership relation modes are handled through relation kinds (`crud`, `owned-toggle`, `readonly`).

Bespoke detail pages exist for richer domain behavior and aggregate endpoints, including `CompanyDetailView`, `LocationDetailView`, `RollingStockDetailView`, `RouteDetailView` + `RouteTree`, `MediaDetailView`, and `AlbumDetailView`. Additional feature views include `ReviewModerationView`, `MapView` (Leaflet), and `SearchView`.

## Routing And Access Control

`src/router/index.ts` defines public, auth/account, resource, and staff/admin routes. Route guards enforce `requiresAuth`, `requiresStaff`, and `requiresAdmin`, and also honor resource-level access for dynamic admin routes. Legacy domain paths (for example `/companies`) redirect to generic resource routes.

## Styling, Theming, And Accessibility

Global tokens come from `src/styles/colors.scss` and `src/styles/variables.scss`, with responsive constants mirrored in `src/styles/tokens.ts`. Dark mode is controlled by `useTheme` and `data-theme` overrides, with `prefers-color-scheme` fallback.

Accessibility conventions in shipped components include labeled form primitives, skip link + single `<main>` landmark, keyboard/focus-safe confirm dialogs, combobox/listbox semantics in `EntityPicker`, and reduced-motion handling in global/app transitions.

## Testing Architecture

Unit tests use Vitest + jsdom and cover components, views, stores, router guards, and API services. Cypress e2e specs are maintained under `cypress/e2e` for browser journeys. See [`testing-and-ci.md`](./testing-and-ci.md) for current test/CI execution details.
