# Backend Integration

This note describes how `infotrem-web` should integrate with `infotrem-api`.
It complements the root parity roadmap in
`../../docs/frontend-backend-parity.md`.

## Integration Principles

- Keep components calling services instead of importing mock data directly.
- Centralize HTTP concerns in one client: base URL, headers, query strings,
  JSON parsing, errors, and token injection.
- Keep backend DTOs separate from component view models when the UI needs a
  friendlier shape.
- Prefer feature services over direct `fetch` calls in views.
- Preserve the existing Vue, Pinia, Vue Router, SCSS, and BEM-like component
  conventions.

## Runtime Configuration

Development uses the Vite proxy for `/api/*`. Production should call the
configured backend origin directly or use a deployment-time same-origin routing
strategy.

```sh
VITE_INFOTREM_API_BASE_URL=http://localhost:8080
```

Frontend code should call app-local paths such as `/api/media` where possible.
The Vite proxy strips `/api` before forwarding to the backend.

## Proposed Source Layout

```text
src/
  services/
    http/
      api-client.ts
      api-error.ts
      pagination.ts
    api/
      auth.api.ts
      media.api.ts
      albums.api.ts
      comments.api.ts
      search.api.ts
      map.api.ts
      resources.api.ts
  stores/
    auth.store.ts
  types/
    api/
      errors.type.ts
      pagination.type.ts
    domain/
      user.type.ts
      media.type.ts
      album.type.ts
      comment.type.ts
      search.type.ts
      map.type.ts
```

## HTTP Client Contract

The base client should provide:

- `get<T>(path, options)`
- `post<T>(path, body, options)`
- `patch<T>(path, body, options)`
- `put<T>(path, body, options)`
- `delete(path, options)`

It should:

- Prefix relative paths with `/api`.
- Attach `Authorization: Token <key>` when the auth store has a token.
- Parse JSON response bodies.
- Surface `{ detail }` and `{ message }` errors as typed `ApiError`.
- Handle `204 No Content`.
- Support query objects for `limit`, `offset`, `q`, map viewport values, and
  resource-specific filters.

## Shared Types

Start with these primitives:

```ts
export type PaginatedResponse<T> = {
  items: T[]
  count: number
  _links?: Record<string, string>
}

export type ApiErrorBody = {
  detail?: string
  message?: string
}

export type ListParams = {
  limit?: number
  offset?: number
}
```

Backend rows currently use `snake_case`. Services may expose either raw DTOs or
mapped view models, but the choice should be explicit per feature.

## Auth Store

The auth store should own:

- Current token.
- Current user profile from `/me`.
- `isLoggedIn`, `isStaff`, and `isAdmin` derived state.
- Login and logout.
- Register.
- Profile refresh and profile update.
- Password change.
- Email validation resend.

Token persistence can start with `localStorage`. Keep the storage wrapper small
so it can later move to a more secure or server-backed session model.

## Route Groups

Recommended route groups:

- Public:
  `/`, `/feed`, `/media`, `/media/:id`, `/albums`, `/albums/:id`,
  `/search`, `/map`.
- Auth:
  `/login`, `/register`, `/me`, `/me/password`,
  `/email-validation/check/:userId/:validationHash`.
- Domain browsing:
  `/companies`, `/manufacturers`, `/locations`, `/routes`, `/paths`,
  `/rolling-stock`, `/locomotives`, `/freight-cars`, `/passenger-cars`,
  `/non-revenue-cars`.
- Staff/admin:
  `/admin/resources/:resource`, `/admin/users`, `/admin/mail`.

Use route metadata for auth requirements:

```ts
meta: {
  requiresAuth: true,
  requiresStaff: true,
  requiresAdmin: true
}
```

## Feature Service Priorities

Implement services in this order:

1. `auth.api.ts`: login, register, me, password, email validation.
2. `media.api.ts`: media list/detail and media relationships.
3. `albums.api.ts` and `comments.api.ts`: album and comment read flows.
4. `search.api.ts`: global search.
5. `map.api.ts`: geospatial map data.
6. Domain browse services: companies, manufacturers, locations, routes, paths,
   rolling stock, locomotives, car types.
7. Mutation services: comments, reviews, likes, favorites, votes, upload.
8. `resources.api.ts`: generic staff/admin CRUD registry.

## Testing Strategy

Unit tests should mock the HTTP client at the service boundary and cover:

- API client success, JSON parsing, `204`, auth header injection, and errors.
- Auth store login/logout/hydration.
- Service mappers from raw backend rows to UI view models.
- Route guards for anonymous, logged-in, staff, and admin users.

Cypress should cover:

- Anonymous media feed and media detail.
- Login and `/me` hydration.
- Search.
- Map.
- Comment/reaction flow for an authenticated user.
- One staff CRUD smoke path once admin screens exist.

The default Cypress suite uses `cy.intercept` fixtures rather than requiring a
live seeded API. This keeps CI deterministic while still exercising routing,
guards, request URLs, and form behavior against backend-shaped responses. Live
userver/API specs can be added later as an optional integration layer.

## Backend Contract Watchlist

Before or during feature implementation, confirm:

- Login response token field.
- `/me` role/profile fields.
- Stable media thumbnail/raw URL strategy.
- Default FileMgr storage for contributor uploads; the frontend should call the
  default upload routes and must not ask normal users for storage IDs.
- Search result `entity_type` to frontend route mapping.
- Map item field guarantees.
- Social summary keys: count, current-user boolean state, and relation ID.
- Media review decisions currently use `approve`, `reject`, and
  `needs_changes`.
- `/cronjob/run` is not part of the public backend contract and should not be
  called by the frontend.
