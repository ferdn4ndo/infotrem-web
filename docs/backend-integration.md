# Backend Integration

This note describes the current AS-BUILT integration between `infotrem-web` and `infotrem-api`.
It complements the root engineering knowledge base under [`../../_docs/engineering/`](../../_docs/engineering/).

## Runtime Contract

The frontend uses same-origin `/api/*` requests. `src/services/http/api-client.ts` handles path prefixing, query-string serialization, token header injection, JSON parsing, and typed `ApiError` surfacing.

## Implemented API Modules (`src/services/api`)

- Core transport helpers: `resources.api.ts`, `permissions.ts`, `entity-routing.ts`, `map-normalization.ts`, `review-decisions.ts`
- Auth/account: `auth.api.ts`
- Public features: `media.api.ts`, `albums.api.ts`, `search.api.ts`, `map.api.ts`, `summary.api.ts`, `information.api.ts`, `contact.api.ts`
- Social and nested relations: `social.api.ts`
- Staff/admin: `operations.api.ts`
- Resource metadata registry: `resources.ts`

## Resource Registry And Generic CRUD

`resources.ts` defines `ResourceConfig`/`RelationConfig` for public, domain, and admin resources (including nested entity mappings). Generic list/create/update/delete flows run through `resources.api.ts` and are used by the generic resource views/forms.

Current generic list requests use `limit` and `offset` only. There is no server-side filter/sort contract in these generic list views; list filtering is currently client-side over the already loaded page.

## Aggregate And Detail Endpoints In Use

The frontend actively consumes aggregate/detail endpoints where available:

- `/media/:id/detail` (`media.api.ts`, `MediaDetailView`)
- `/albums/:id/detail` (`albums.api.ts`, `AlbumDetailView`)
- `/companies/:id/summary` (`summary.api.ts`, `CompanyDetailView`)
- `/locations/:id/summary` (`summary.api.ts`, `LocationDetailView`)
- `/rolling-stock/:id/summary` (`summary.api.ts`, `RollingStockDetailView`)
- `/information/:id/summary` (`summary.api.ts` / `information.api.ts`, `ResourceDetailView`)
- `/routes/:id/tree` (`summary.api.ts`, `RouteDetailView` and `RouteSectionDetailView`)
- `/media-reviews` (`ReviewModerationView` via `listResource`)

When an aggregate endpoint fails, key views include fallback calls to base resources and nested relation endpoints.

## Auth And Access Integration

`auth.store.ts` owns token persistence (`localStorage`), `/me` hydration, and role-derived state. Router guards enforce `requiresAuth`/`requiresStaff`/`requiresAdmin`, and `permissions.ts` applies the same access model to generic create/edit/delete UI actions.
