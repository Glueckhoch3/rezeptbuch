# Step 3 — Frontend Plan: React remodel from scratch

Status: proposal — builds on [`step2-backend-plan.md`](step2-backend-plan.md), extends [`0003-stack-and-container-topology.md`](../../.github/decisions/0003-stack-and-container-topology.md).

## Context

The current frontend (`frontend/src/`) is a minimal, working single-entity Recipe CRUD app: React 18 + Vite + TypeScript + React Router, no state-management library, no UI framework, manual `useState`/`useEffect` fetch/loading/error handling in every page. It was built "just to work" for the course. This plan remodels it from scratch to support the new domains (ingredients, tags, allergens, search) introduced in steps 1–2, adopts a small set of modern, genuinely useful React libraries, and plans page structure and UI direction up front. Per the user's decision, **no authentication is added** — "security" here means input handling, XSS-safe rendering, CORS, and CSP/security headers only.

## Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Server state | **TanStack Query** (`@tanstack/react-query` v5) | Replaces the manual fetch/loading/error `useState`/`useEffect` juggling in today's `RecipeListPage`/`RecipeDetailPage`; gives caching and refetch for free across the now-multi-entity app (recipes, ingredients, tags, allergens) |
| Forms & validation | **react-hook-form + zod** (`@hookform/resolvers`) | The recipe form is the most complex UI piece, with nested ingredient and workstep arrays — RHF's `useFieldArray` fits directly; a zod schema gives instant client-side feedback mirroring backend validation |
| Styling | **Plain CSS with CSS custom properties / CSS Modules** — no Tailwind, no component library | The app's surface area (a handful of pages) doesn't justify a new styling system; extends the existing hand-written `global.css` instead of replacing the approach |
| Client-only UI state | **React Context + `useState`** — no Zustand/Redux | The only non-server state is transient UI (e.g. search filter panel open/closed); doesn't warrant a new dependency |
| Routing | **`react-router-dom` v6, `createBrowserRouter`** — unchanged | Already works, no reason to replace it |

New `package.json` dependencies: `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`. Pin them consistently with the existing versioning style (caret ranges matching current deps). Run `npm audit` after adding.

## Folder structure (feature-based)

```
frontend/src/
  api/
    client.ts                 # unchanged generic request() wrapper
    queryClient.ts             # NEW: TanStack QueryClient instance + defaults
  features/
    recipes/
      api.ts                   # fetchRecipes, fetchRecipe, createRecipe, updateRecipe, deleteRecipe
      hooks.ts                  # useRecipes(), useRecipe(id), useCreateRecipe(), useUpdateRecipe(), useDeleteRecipe()
      components/
        RecipeForm.tsx
        RecipeCard.tsx
        WorkstepFieldArray.tsx
        IngredientFieldArray.tsx
      types.ts
    ingredients/
      api.ts / hooks.ts          # includes a debounced fetchIngredients(query) hitting GET /api/ingredients?q=
      components/
        IngredientPicker.tsx    # server-side debounced autocomplete, reused inside RecipeForm
      types.ts
    tags/
      api.ts / hooks.ts          # includes a debounced fetchTags(query) hitting GET /api/tags?q=
      components/TagPicker.tsx   # server-side debounced autocomplete
      types.ts
    allergens/
      api.ts / hooks.ts
      components/AllergenBadge.tsx
      types.ts
    search/
      api.ts / hooks.ts
      components/SearchFilters.tsx
      types.ts
  pages/
    RecipeListPage.tsx
    RecipeDetailPage.tsx
    RecipeCreatePage.tsx
    RecipeEditPage.tsx
    IngredientListPage.tsx      # NEW
    IngredientDetailPage.tsx    # NEW
    TagListPage.tsx              # NEW
    AllergenListPage.tsx         # NEW
    SearchPage.tsx                 # NEW
  components/                      # cross-feature only
    ConfirmDialog.tsx
    ErrorBanner.tsx
    Layout.tsx                     # NEW: nav shell
  router.tsx
  types.ts                          # only truly shared cross-feature types remain here
  styles/
    global.css
    variables.css                   # NEW: extracted CSS custom properties (color/spacing/type scale)
```

`features/` colocates each domain's `api` + `hooks` + small `components`, chosen over a flat `pages`-only split because ingredients/tags/allergens each need their own data layer and small widgets — colocation keeps a feature addable/removable as one unit, matching the "easily expandable" goal from the database plan.

## Route map

| Path | Page | Notes |
|---|---|---|
| `/` (or `/recipes`) | `RecipeListPage` | list + entry point into search |
| `/recipes/new` | `RecipeCreatePage` | uses `RecipeForm` with `IngredientPicker`, `TagPicker`, `WorkstepFieldArray` |
| `/recipes/:id` | `RecipeDetailPage` | shows tags, allergen badges (derived from ingredients), worksteps |
| `/recipes/:id/edit` | `RecipeEditPage` | |
| `/ingredients` | `IngredientListPage` | master list, search-as-you-type |
| `/ingredients/:id` | `IngredientDetailPage` | shows allergens + recipes using this ingredient |
| `/tags` | `TagListPage` | browse tags, click through to filtered recipe list |
| `/allergens` | `AllergenListPage` | browse allergens, click through to filtered recipe list |
| `/search` | `SearchPage` | combined tag + ingredient + allergen + text filter, results reuse `RecipeCard` |

## UI design direction

- **Layout**: persistent top nav bar (`Layout.tsx`) — Recipes / Ingredients / Tags / Allergens / Search — with a max-width content container below, matching the existing `global.css` container pattern.
- **Navigation pattern**: no sidebar (too few top-level sections to justify one); no breadcrumbs — rely on the nav bar plus in-page back links, consistent with the app's current minimal style.
- **Responsive approach**: mobile-first CSS, flex/grid layouts with breakpoints defined once in `variables.css` (e.g. `--bp-md: 768px`); no separate mobile-only components.
- **Color & typography**: extract the current ad hoc colors in `global.css` into CSS custom properties (`--color-primary`, `--color-danger` for delete actions, `--color-muted` for meta text); keep the system font stack — no webfont dependency.
- **Component states**: explicitly design loading (TanStack Query `isPending`), empty ("no recipes yet", "no results for this filter"), and error states (reuse the existing `ErrorBanner.tsx`) for every list/detail view.
- **Pagination**: since step 2's list endpoints (`recipes`, `ingredients`, `tags`, `allergens`, `search`) are paginated from the start, `RecipeListPage`/`IngredientListPage`/`TagListPage`/`AllergenListPage`/`SearchPage` all need a pager control (page number + next/previous, driven by the `{items, page, page_size, total}` envelope); `useRecipes()`-style hooks take a `page` param and TanStack Query's `keepPreviousData` avoids a loading flash between pages.

## Security-without-auth checklist

- **Input handling**: backend validation remains the source of truth (per ADR 0002); zod schemas on the client are UX-only, never the sole guard.
- **XSS-safe rendering**: never use `dangerouslySetInnerHTML`; all recipe text (description, workstep text) renders as plain JSX text nodes, which React escapes by default. No markdown/HTML rendering feature should be added later without an explicit sanitizer (e.g. DOMPurify).
- **CORS-aware fetch**: keep the existing relative `/api` base + Vite dev proxy (dev) / nginx reverse proxy (prod) pattern from `api/client.ts` — no `credentials: 'include'` needed since there are no auth cookies.
- **CSP / security headers**: add to `frontend/nginx.conf` — `Content-Security-Policy: default-src 'self'; connect-src 'self'`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. This is an nginx config change, not application code.
- **Dependency hygiene**: pin new dependency versions consistent with the current `package.json` style; run `npm audit` when adding them; none of the chosen libraries use `eval` or dynamic script injection.

## Critical files

- `frontend/src/router.tsx` — route table to extend
- `frontend/src/api/client.ts` — existing fetch wrapper, reused as-is
- `frontend/src/types.ts` — current shared types, to be mostly redistributed into `features/*/types.ts`
- `frontend/package.json` — new dependencies
- `frontend/nginx.conf` — CSP/security header additions

## Resolved decisions (previously open)

- **Ingredient/tag autocomplete: server-side vs. client-side.** Server-side, debounced — not client-side filtering of a full list. Given an expected large ingredient/tag volume but low request frequency, shipping the whole list to the client doesn't scale, while the request cost of debounced server queries stays cheap at this traffic level. `IngredientPicker`/`TagPicker` debounce keystrokes (e.g. 250–300ms) and call the `?q=` prefix-search endpoints from step 2 rather than filtering a locally-cached full list. This also means `useIngredients()`/`useTags()` need a query-param-aware TanStack Query hook (`useIngredientSearch(query)`) distinct from the plain paginated list hook used by `IngredientListPage`/`TagListPage`.
- **Dark mode / theming.** Confirmed out of scope — light mode is the primary target since mobile usage (where light mode dominates) is expected to be common. No change to the plan; `variables.css` still isolates the color tokens so this remains easy to revisit later if requirements change.
- **E2E testing.** Confirmed manual — no Playwright/Cypress suite is added. Manual E2E means actually starting and using the application end-to-end (not just running `npm test`) before calling a change done, per this repo's UI-testing guidance; malformed-input handling stays covered by Vitest + Testing Library component tests and the backend's own validation tests, not by the manual pass.
