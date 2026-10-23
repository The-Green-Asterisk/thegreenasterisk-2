## The Green Asterisk

The site for [The Green Asterisk](https://thegreenasterisk.com), a tabletop RPG community in the Tampa Bay area: our current games and their episodes, the Many Worlds wiki for our settings, and Lord Steve's links.

It's built on [Elemental](https://elemental.thegreenasterisk.com), a framework for building sites with nothing but TypeScript, HTML, and CSS. Elemental's docs explain how the views, routes, services, and server fit together, and everything there applies here.

### Running it

You'll need Node.js 22 and a MySQL database. Make a `.env` file with the variables below, then:

```
npm install
npm run migration:run
npm run dev
```

With `ENV=development`, the server starts browser-sync on `RELOAD_PORT`, which reloads the page whenever you change something. The plain server is on `PORT`.

### Environment variables

| Variable | What it's for |
| --- | --- |
| `ENV`, `PORT`, `HOST`, `RELOAD_PORT` | how and where the server runs; `ENV=development` turns on live reload |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | the MySQL database (required; the server won't start without it) |
| `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `LOGIN_REDIRECT_URL` | logging in with Discord; the redirect points at `/data/auth-redirect` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | image uploads |
| `EMAIL_USER`, `EMAIL_PASS` | the Gmail account that sends welcome emails |
| `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | push notifications (`npx web-push generate-vapid-keys`) |
| `PR_DIGEST_TOKEN` | the shared secret for pushing to the admin-only PR digest |

### What's here

Beyond what Elemental comes with:

- **Current Games**: each campaign's cast, and its episodes split into seasons. Admins add videos and set the current season.
- **Many Worlds**: a wiki of worlds, categories, and entities with images, stats, and comments
- **Links**: Lord Steve's link page, editable and reorderable by admins
- **Profiles**, comments, and image uploads
- **Dark mode**, following the device's setting, with a toggle in the nav
- **PR Digest**: an admin-only page with push notifications, installable as an app

### Deploying

The site runs on Heroku and deploys when `master` changes. Heroku runs `npm run build`, then `npm start`.

Run `npm run migration:run` against the production database **before** merging anything that adds a migration. The new code expects the new tables and columns as soon as it's live.
