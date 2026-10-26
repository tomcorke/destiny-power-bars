# Destiny Power Bars

A client-only React + Vite app that signs in to Bungie, reads a Destiny 2 profile and the manifest, and shows each character's power level. Deployed to GitHub Pages. `ARCHITECTURE.md` diagrams the data flow from API responses to components.

## Setup

- Node version is in `.nvmrc`.
- `src/data/d2ai-module` is a Git submodule (DIM's generated data). Run `git submodule update --init` in a fresh clone or worktree.
- `npm start` serves HTTPS on port 3000; Bungie OAuth requires the HTTPS origin. Bungie keys come from `.env.development`.

## Verification

`npm run typecheck` and `npm run eslint` are the gates. Both pass on `master`; keep them passing. There is no test suite.

- Prettier reports existing files as unformatted because older code predates Prettier 3 defaults (no trailing commas in params). Format only the lines you change, so diffs stay focused. Run `npx prettier --write <file>` on new files only.
- ESLint caps size and complexity (cognitive complexity, function and file length, parameters, nesting). When code hits a limit, extract a function, a helper in the relevant `services/` module, or a sub-component in its own file. Files over the limits are listed in `eslint.config.mjs` at warning severity; shrink that list over time and keep new files off it. Shared complex inputs go in one object parameter rather than many positional ones.
- Import order is enforced by `import/order` in `eslint.config.mjs`; `npm run eslint:fix` sorts it.

## Code conventions

- **Components** live in `src/components/<Name>/` as `<Name>.tsx`, `<Name>.module.scss`, an optional `<Name>.stories.tsx`, and an `index.ts` that re-exports the named component as default. Import styles as `STYLES` and use `classnames` for conditional classes. The character display sub-parts are flat files in `src/components/characterDisplayComponents/`.
- Components are arrow functions with named exports, written with `React` imported explicitly (`"jsx": "react"`).
- **Global state** uses React contexts in `src/contexts/`, composed in `AppContextWrapper.tsx`. Each context exports `XContext` and `XContextProvider`. Follow that pattern for new shared state.
- **Persisted data**: settings go in `localStorage` and are validated with a `zod` schema in `SettingsContext.tsx`; add a setting by adding a field with `.default(...)` to that schema. The manifest and large caches go in IndexedDB through `idb-keyval` in `src/services/bungie-api.ts`. Storage keys belong in `src/constants.ts`.
- **Character data** is computed by processors in `src/services/character-data/processors/`. Add a processor by wrapping a pure function in `createCharacterDataProcessor` or `createGlobalDataProcessor` and registering it in `processors/index.ts`. Item scoring, filtering, and joining live in `src/services/items/`.
- Bungie API types come from `bungie-api-ts`. `strict` and `noUncheckedIndexedAccess` are on: handle missing manifest entries and item instances explicitly with optional chaining or guards.
- Log development diagnostics with `debug()` from `src/services/debug.ts`; it is silent in production.

## Commits

Commit messages are short, lowercase, imperative summaries (`split manifest storage`, `fix non-cross-save membership select`). Keep each commit to one change.

## Deploy

`npm run deploy` builds and pushes `dist` to the `gh-pages` branch, publishing to production. Run it only when the user asks.
