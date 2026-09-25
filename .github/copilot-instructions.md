<!-- Copilot instructions for The-Green-Asterisk/thegreenasterisk-2 -->
# Repository-specific guidance for AI coding agents

This file tells coding assistants how this repository is structured, how to build and run it, and the project conventions to follow.

- **Big picture**: This is a fullstack TypeScript project with two main runtime surfaces:
  - `server/`: Node + TypeScript backend. Entry: [server/main.ts](../server/main.ts). Compiled output lives in `server/comp/` (e.g. `server/comp/main.js`).
  - `src/`: client-side TypeScript bundled into `www/` via `esbuild`. Entry: [src/main.ts](../src/main.ts). Views/templates live under `src/views/`.

- **Build / dev workflows (use these commands exactly)**:
  - Install: `npm install`
  - Dev (watch server + client + assets, run compiled server): `npm run dev`
  - Full build: `npm run build`
  - Start production server after build: `npm run start`
  - Typecheck client code only: `npm run typecheck` (uses `tsc --noEmit` against `src/tsconfig.json`)
  - Run watchers separately:
    - Server watch: `npm run build:watch:server`
    - Client watch: `npm run build:watch:client`
  - Asset/html copying watchers: `npm run watch:html` and `npm run watch:server-html`

- **Database & migrations**:
  - TypeORM data source: [server/services/database/data-source.ts](../server/services/database/data-source.ts)
  - Generate migration: `npm run migration:generate` (generates under `server/services/database/migration/`)
  - Run migrations: `npm run migration:run`

- **Entities & data models (frontend & backend)**:
  - Backend entities: Stored in [server/services/database/entity/](../server/services/database/entity/) as TypeORM `@Entity()` classes (e.g. [server/services/database/entity/User.ts](../server/services/database/entity/User.ts)).
  - Frontend entities: Stored in [src/entities/](../src/entities/) as TypeScript classes/models without ORM decorators (e.g. [src/entities/User.ts](../src/entities/User.ts)), re-exported collectively via [src/entities/index.ts](../src/entities/index.ts).
  - Keep both entity models synchronized when altering schema columns, relations, or API response shapes.

- **Frontend views & DOM conventions**:
  - Direct DOM manipulation: The front end manipulates DOM directly in TypeScript (no React/Angular). Reusable DOM/API helpers live in `src/services/*` (e.g. `request.ts`, `storageBox.ts`, `helpers.ts`).
  - Registering new views (e.g. `src/views/myView/`):
    1. Template: wrap view markup in a custom container element (e.g. `<el-my-view>`) rendered with `Helpers.html` (e.g. [src/views/home/home.template.ts](../src/views/home/home.template.ts)).
    2. Elements service: add static getter/setter accessors to `el` in [src/services/elements.ts](../src/services/elements.ts) (`public static get myView() { return this.getElement<HTMLElement>('el-my-view'); }`).
    3. Views index: export the controller and template in [src/views/index.ts](../src/views/index.ts) and register them in the default `views` object.
    4. Stylesheet: import the view's CSS in [src/views/index.css](../src/views/index.css).

- **Routing architecture (frontend & backend)**:
  - **Frontend routing** ([src/routes.ts](../src/routes.ts), [src/routes.base.ts](../src/routes.base.ts)):
    - `Routes` extends `RoutesBase`. Path segments (from `location.pathname`) map to method names matching the first segment (such as `'about'` or `''` for home).
    - Handlers append the view template to `el.body` (`el.body.appendChild(views.aboutTemplate())`) and invoke the controller (`views.about()`).
    - Query params are parsed into `this.query` with automatic type conversion.
    - Nested routes shift `this.path` and delegate to sub-routers (e.g., [src/views/currentGames/currentGames.routes.ts](../src/views/currentGames/currentGames.routes.ts)).
    - Fallback: unmatched paths dynamically fetch matching HTML via `getHtml(pathname)` or render `views.errorPage(404)`.
  - **Backend API routing** ([server/routes.ts](../server/routes.ts), [server/main.ts](../server/main.ts)):
    - Backend API calls hit `/data/*`. `server/main.ts` strips `/data/` and delegates to `new Routes(req, res).response`.
    - Handlers are named by path string literals (such as `'/get-youtube-videos'`) and decorated with `@Method('GET'|'POST'|'PUT'|'DELETE')`, returning `{ response, status, header?, headerName? }`.
    - Non-GET requests enforce CSRF tokens via `x-csrf-token` header validated against cache before route execution.

- **Backend & build conventions**:
  - Server controllers are TypeScript in `server/controllers/` and compiled to `server/comp/controllers/`. Always edit the TS files and build/watch.
  - Client bundling: `esbuild` bundles [src/main.ts](../src/main.ts) -> `www/main.js` and `src/main.css` -> `www/main.css`. `tsc` enforces types (`--noEmit`); `esbuild` does not typecheck. Run `npm run typecheck` or `npm run build` to validate types.
  - Assets: `src/storage/` and HTML templates are synced by copy scripts (`html` and `server-html`); do not manually edit `www/`.
  - Module aliases: Configured in `package.json` under `_moduleAliases` (`@server`, `@src`, `controllers`, `services`, `views`).

- **Key files for reference**:
  - Routing: [server/routes.ts](../server/routes.ts) (backend) and [src/routes.ts](../src/routes.ts) (frontend)
  - Entities: [server/services/database/entity/](../server/services/database/entity/) (backend) and [src/entities/](../src/entities/) (frontend)
  - Example views: [src/views/home/home.ctrl.ts](../src/views/home/home.ctrl.ts) and [src/views/home/home.template.ts](../src/views/home/home.template.ts)
  - Example controller: [server/controllers/userController.ts](../server/controllers/userController.ts)
  - Database config: [server/services/database/index.ts](../server/services/database/index.ts)

- **Testing & debugging tips**:
  - For quick iteration, run `npm run build:watch` (runs both server and client watchers) plus `npm run watch:html` to sync assets.
  - The server runs the compiled JS at `server/comp/main.js` — use `node --inspect` or attach your debugger to that process when running `npm run dev`.
