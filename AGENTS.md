# The Green Asterisk: instructions for AI agents

The site for The Green Asterisk, a tabletop RPG community: current games and episodes, the Many Worlds wiki, links, profiles, a PR digest, and a D&D 2024 character creator and sheet. It's built on [Elemental](https://elemental.thegreenasterisk.com), a framework for sites made of nothing but TypeScript, HTML, and CSS. The [framework rules](#the-elemental-framework) below come from Elemental's docs; the rest is specific to this site. When this file and the code disagree, the code wins. Fix this file.

## Ground rules

- **Master deploys to production.** Heroku builds and deploys every push to `master`. Work on a branch; don't push or merge to `master` unless asked.
- **Migrations run on deploy.** `npm run build` starts with `migration:run`, so a merged migration runs against the production database before the new code starts. Make it safe to run as-is (see [Database](#database)).
- **Character creator and sheet:** read [docs/character-rules-data.md](docs/character-rules-data.md) before touching classes, subclasses, species, backgrounds, feats, items, weapons, spells, or any stat on the sheet. Nothing about a specific rules element is hard-coded by name. Effects come from data, and that file says where.
- **No front-end frameworks or DOM libraries.** No React, jQuery, Lit, htmx, or the like. Use the Elemental patterns below.
- **Never edit generated output.** `www/` and `server/comp/` are build output (gitignored). Edit `src/` and `server/`.

## Commands

| Command | Use |
| --- | --- |
| `npm install` | install (Node 22) |
| `npm run dev` | build, watch, and serve; `ENV=development` turns on live reload on `RELOAD_PORT` |
| `npm run build` | **runs migrations**, compiles the server to `server/comp`, type checks, and bundles the front end to `www` |
| `npm start` | run the compiled server |
| `npm run typecheck` | type check the front end (esbuild doesn't) |
| `npx tsc -p server/tsconfig.json --noEmit` | type check the server |
| `npx tsc -p server/tsconfig.json` | compile the server (the tests need this; see below) |
| `DB_HOST=localhost npx vitest run` | run the tests |
| `npm run migration:generate server/services/database/migration/{name}` | write a migration from entity changes (the path is required) |
| `npm run migration:run` / `npm run migration:revert` | apply / undo migrations |

Settings live in `.env`; the README lists every variable. Never commit `.env`.

### Tests

Tests are Vitest, in `tests/server` (node) and `tests/src` (happy-dom). Two setup quirks:

- **`DB_HOST` must be set.** `server/services/database/data-source.ts` throws without it, even though tests never connect.
- **The server must be compiled first.** Tests resolve `services/database/entity/*` imports to the compiled JS in `server/comp` (see `vitest.config.mts`). A stale or missing `server/comp` makes whole files fail to load; `characterController.test.ts` and `routes.test.ts` fail first. Run `npx tsc -p server/tsconfig.json`, then the tests.

Before calling a change done: both type checks, `DB_HOST=localhost npx vitest run`, and `npx esbuild src/main.ts --bundle --outfile=<scratch file>` (or `npm run build` with a database). Add tests for new behavior next to the existing ones. Mock repositories with `vi.spyOn(AppDataSource, 'getRepository')`, and the logged-in user with `vi.spyOn(SessionController, 'getUser')`.

## How this site differs from stock Elemental

- **The database is required.** The server exits if it can't connect. It still makes sense to check `AppDataSource.isInitialized` in controllers, which the existing ones do (tests and early startup).
- **Login and sessions.** Users log in with Discord, and the session key is stored in `localStorage`.
  - **Client:** `el.establishAuth()` (in `main.ts`), `el.currentUser`, `el.isAuth`, `el.checkAuth(fnOrValue)`, and `el.checkAdmin(fnOrValue)`, all on `BaseEl`. `initLoader()` sends the session key as an `Authorization` header on every request.
  - **Server:** `SessionController.getUser(req)` returns the user or `undefined`. Return 401 when a route needs a login, and 403 when the user isn't allowed. Admins have `user.isAdmin`. For "creators edit their own, admins edit anything", use `BaseController.canEditOwned(user, row.createdById)`.
  - **Client checks** only decide what to show (`canEditDbEntry` in the character sheet mirrors the server rule). The server always re-checks.
- **Front-end entity mirrors.** `src/entities/` has a plain class for each TypeORM entity in `server/services/database/entity/`, without decorators, used for typing API responses (`import { World } from '@entities'`). When you add, rename, or remove an entity column or relation, update its mirror too.
- **Extra pieces:**
  - push notifications and the admin-only PR digest (`server/services/push.ts`, `src/sw.js`, `/manifest.webmanifest`)
  - image uploads to Cloudinary (`StorageController`, `FileService.uploadFile`)
  - comments, profiles, and a footer
  - `EmailService` has no `isConfigured`; check that `sendEmail` resolved true.

## Database

TypeORM on MySQL. Entities are in `server/services/database/entity/` and loaded automatically; migrations are in `server/services/database/migration/`.

- **Every schema change gets a migration**, with a timestamp later than the newest one there. Hand-written migrations are fine and are the norm here. Guard them so they're safe to run as-is (`hasTable` / `hasColumn` / `findColumnByName` checks before `ALTER TABLE`), and write a `down` that undoes them. For a new column that needs data, add the column, then `UPDATE … WHERE … IS NULL` (see `1792791500000-add_item_modifiers.ts`).
- **Foreign keys** get explicit names (`foreignKeyConstraintName` in the entity, the same name in the migration). Don't add a separate index for a foreign key; MySQL makes one under the key's name and TypeORM expects exactly that.
- **Relations to `User` (or other entities with many relations) in an entity file** use a string target and a type-only import, `@ManyToOne("User", …)` with `import type { User } from "./User"`. Tests run entities through esbuild without decorator metadata, and importing `User` at runtime pulls in `Comment`, whose untyped columns break them.
- **Clearing a column.** TypeORM's `save` skips `undefined`, so set the field to `null`.
- **Column lengths are enforced** (MySQL strict mode). When copying values into a narrower column (character copies are narrower than spells and items), truncate first.
- **Saving changes:** `BaseController.checkAndMakeChanges(row, changes)` tells you whether anything changed before you save.

## Character creator and sheet

[docs/character-rules-data.md](docs/character-rules-data.md) is the guide, and it's required reading for rules work. Some structure worth knowing before you open it:

- **A saved character** is a JSON payload (`saved_character.payload`) plus relational rows. The rows are rewritten wholesale from the browser's copy on every save, and loading merges rows over the payload. A field with no column survives only in the payload, so keep both in mind.
- **Spells and items.** A character keeps its own copy of each spell and item. Copies link to their database row (`character_spell.spellId`, `character_inventory_item.itemId`), and edits to a spell or item reach every unlocked copy (`server/services/characterCopies.ts`, mirrored for the open sheet in `src/views/characterSheet/services/characterCopies.ts`). `locked` on a copy keeps it exactly as it is.
- **Item effects and charges.** `item.modifiersJson` holds item effects: null means use the seed list in `itemMechanics.ts`, and `"[]"` means none. `item.chargesJson` holds charges. Spells and items have `lockedFields` that survive D&D Beyond reloads and the auto-fixes (`server/services/definitionLocks.ts`); every path that rewrites a spell or item row must call `keepLockedFields` before saving.
- **Characters imported from D&D Beyond** (`source: "dndbeyond"`) take their numbers from D&D Beyond. Don't apply item stats to them again.
- **Dialogs** on the sheet are rendered once by `renderModals()` and found by `initDialogFocus` at startup. A new dialog must be in that markup, with `role="dialog"`, `aria-modal`, `aria-labelledby`, and `aria-hidden` toggled with the `hidden` class. Focus and Tab trapping come from `dialogFocus.ts`.

## The Elemental framework

This mirrors Elemental's own AGENTS.md; keep the two in step when the framework changes. Fixes that belong to the framework (`BaseEl`, `RoutesBase`, the request service, `server/main.ts`, `BaseController`) usually belong in Elemental too.

### Views

A view is a folder in `src/views/` named after the view: `{name}.template.ts`, `{name}.ctrl.ts`, and optionally `{name}.css`. All four steps are needed:

1. **Template.** A function returning `Helpers.html` (from `@services/helpers`) whose outermost tag is `el-` plus the view name in kebab case (`helloWorld` → `<el-hello-world>`). A normal page puts `<div class="content-slate"><section>…</section></div>` inside it.
2. **Getter.** Add one to `el` in `src/services/elements.ts`: `public static get helloWorld() { return this.getElement<HTMLElement>('el-hello-world'); }`.
3. **Index.** In `src/views/index.ts`, import the controller and template, re-export both, and add both to the default `views` object.
4. **Styles.** `@import url('./helloWorld/helloWorld.css');` in `src/views/index.css`, with rules scoped under the view's tag.

**Templates**
- `Helpers.html` returns only the **first** element, so one root per template.
- It does **not** escape values. Never interpolate user input, query values, or user-written server data. Build the element, then set `textContent`, or escape it (`Helpers.escapeHtml`, or the view's own `escapeHtml`).
- Keep logic in controllers; a template takes data as parameters.
- **Sub-views** live in the parent's folder and attach to the parent template function (`homeTemplate.helloWorld = helloWorldTemplate`).
- **Components** embedded in other templates take a `string` flag: build the markup once as an untagged template literal, and return it as-is or through `Helpers.html`.

**Controllers**
- The controller runs **after** the route appends the template.
- Get elements through `el`: a getter in `src/services/elements.ts`, or `el.list(selector)` / `el.getElement(selector)` for a one-off. Never `document.querySelector` / `getElementById` in app code. Searching inside an element you already hold (`sheet.querySelector(...)`) is fine.
- `el.<list>.id('x')` and the single-element getters can be `undefined` or `null`; check before use.
- Pass `{ signal: el.signal }` to every `addEventListener`.

### The Elements service (`el`, imported from `@elements`)

- **Two layers.** `BaseEl` (`src/services/baseElements.ts`) is the framework plus this site's auth helpers. `el` (`src/services/elements.ts`) holds the site's getters. Add getters with `this.getElement<T>(selector)` (element or `null`) or `this.getElements<T>(selector)` (a `NodeListOf<T>` with `id()`).
- **Fixed elements.** `el.root`, `el.body`, and `el.title` always exist.
- **Loader.** `el.loader` shows a spinner (driven by requests); `el.loader.remove()` hides it.
- **Attributes:** `bg`, `light-box` (+ `light-box-type`), and `title` (shown on touch).
- **Form helpers** (from `new el()`):
  - required inputs gate the submit button
  - submitting shows a spinner and blocks double submits
  - unsent input is saved and restored, except inputs named with a leading `_` and file inputs
  - multi-selects toggle on click
- **String helpers.** `stripScripts()` and `doubleBreakDivs()` are on every string.

### Routes

- **`src/main.ts` order:** `initLoader()` first, then `el.establishAuth()`, the session check, the footer, nav, and cookie banner, `new Routes(path).view()`, and finally `new el()`.
- **`src/routes.ts`:** `Routes extends RoutesBase`. Each page is a method named by the first path segment that appends the template and calls the controller. Home `['']()` is in `RoutesBase`. Unmatched paths try `getHtml(location.pathname)`, then show the error page.
- **Sub-routes:** check `this.path[1]`, `this.path.shift()`, then `new views.XRoutes(this.path).view()`. `XRoutes extends Routes` lives in the view's folder as `{name}.routes.ts` and is exported through the views index (see `src/views/currentGames/currentGames.routes.ts`).
- **Query values:** `this.query` holds the query string with numbers and booleans converted. Treat it as untrusted.

### Styles

Use the variables in `src/main.css` (`var(--surface)`, `var(--text)`, `var(--ui-color)`, `var(--radius)`, the z-index variables) instead of literal colors, and check that new UI works in both light and dark mode (`:root[data-theme="dark"]`). Layouts must work at phone width without horizontal scrolling.

### Requests (`@services/request`)

- **`initLoader()`** wraps `fetch`: the loader, `X-Requested-With: Elemental`, the session `Authorization` header, and a CSRF token (from the `csrf-token` cookie) on anything but GET. Failed responses reject with the server's body, usually `{ error: "…" }`, so show `err.error || err.message`. Don't use another HTTP client.
- **Helpers.** `getData` / `postData` / `putData` / `delData` prefix `/data`; `get` / `post` / `put` / `del` take a full path. All parse JSON except `del` and `delData`. GET data becomes the query string, and `FormData` is sent as-is for uploads.
- **HTML:** `getHtml<T>('/views/…')`.

### Server

- **`server/main.ts`:**
  - CSRF cookie plus an `X-CSRF-TOKEN` header check on non-GET requests (403)
  - `/views/*` requires `X-Requested-With: Elemental`
  - `/storage/*` from `www/storage`
  - `/data/*` goes to `server/routes.ts`
  - everything else gets `index.html`, `main.css`, or `main.js`

  Don't weaken those checks.
- **Server routes** (`server/routes.ts`): a method named by the path after `/data`, decorated with `@Method('GET' | 'POST' | 'PUT' | 'DELETE')` (405 otherwise; a missing route gets 404), delegating to a controller:
  ```ts
  @Method('PUT')
  private ['/edit-custom-spell'](req: http.IncomingMessage, res: http.ServerResponse): ResponsePromise {
      return SpellController.editCustomSpell(req, res);
  }
  ```
  It resolves to `{ response, status, header?, headerName? }`. `response` is usually `JSON.stringify(...)`, and errors are `{ error: "…" }` with a 4xx/5xx status.
- **Controllers** (`server/controllers/`) extend `BaseController`:
  - `readBody<T>(req)`, `parseUrlQuery(req.url)`, `checkAndMakeChanges`, and `canEditOwned`
  - **validate every body**: anyone can call `/data/*`
  - server-side `.html` files under `server/` are copied next to the compiled code
- **Cache.** `server/cache.ts` is one shared NodeCache, memory only. Clear the keys you affect when data changes; for example, `/get-rules` is cached under `dnd_rules_all`, and spells and items under `spell_detail_*` and `item_detail_*`.

## Git

- Branch from `master` for each change.
- Commit subjects are conventional: `feat(sheet): …`, `fix(pdf): …`, `refactor(…)`, `test(…)`. Put the details in the body in short past-tense lines.
- Merge with `git merge --no-ff` ("Merge branch '{branch}'"), and only when asked.
- Note new migrations in the commit body, since they run on deploy.
