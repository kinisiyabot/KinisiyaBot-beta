# KinisiyaBot-beta — repo notes

WhatsApp/Telegram bot (Arabic UI) built on Baileys. Entry point: `index.js`.

## Run
```
npm install
node index.js          # pairing code (method)
node index.js qr       # QR in terminal
```
Config lives in `config.js` (`global.owner`, `global.sessions`, etc.).

## Architecture
- `index.js` — boots Baileys, loads every `plugins/*.js` via `filesInit()`, sets up hot reload.
- `handler.js` — per-message pipeline: DB init, permission flags
  (`isROwner`/`isOwner`/`isPrems`/`isAdmin`), then plugin dispatch.
- `lib/simple.js` — Baileys wrapper: `makeWASocket`, `smsg`, `serialize`
  (adds `sender`, `senderPn`, `senderLid`, `fromMe` getters to `proto.WebMessageInfo`).
- `lib/identity.js` — **identity resolution**. WhatsApp addresses an account
  either by phone-number JID (`…@s.whatsapp.net`) or privacy LID (`…@lid`).
  `learnIdentity()`/`sameIdentity()`/`matchesAny()` keep an alias map so
  owner/elite/admin checks match across both forms. All checks fail closed
  when an identifier has no digits.
- `lib/n5bah/elite.js` — `eliteNumbers`, `isElite`, `generateNumbers`.
- `system.js` — AI (Groq) session engine; `isProtectedUser` uses `matchesAny`.

## Conventions / gotchas
- **Never compare raw JID strings** for privilege. Use `matchesAny` / `sameIdentity`
  from `lib/identity.js`; device suffixes (`212…:4@s.whatsapp.net`) and LIDs break `===`.
- `proto.WebMessageInfo.fromObject()` drops unknown key fields, so `participantPn`
  / `senderPn` / `…Lid` are copied back manually in `smsg`.
- Only files ending in `.js` in `plugins/` are loaded; a non-JS file with a `.js`
  name aborts that plugin (renamed such junk to `.js.txt`).
- Baileys is `@whiskeysockets/baileys` (not `baileys-pro`); `printQRInTerminal`
  is removed — render `update.qr` yourself.
- The `connection.update` listener must be registered before the slow
  `filesInit()` plugin scan, otherwise the first QR event is missed.
- Runtime data (`session/`, `jadi/`, `memory.json`) is gitignored.
- Buttons: `plugins/_templateResponse.js` converts a button/list tap back into a
  text command and re-emits `messages.upsert`. Menu buttons only work if their
  target command id is registered by some plugin, so keep ids in sync with
  `handler.command` values (e.g. `.قسم_<id>`, `.menu_<lang>`).
- External HTTP APIs: the base URL is centralized in `lib/config.js`
  (`global.API_BASE`) and can be overridden with the `API_BASE` env var. Do not
  hardcode host URLs in plugins — reference `global.API_BASE`.
- `lib/i18n.js` holds menu strings for Arabic/English/Spanish; `plugins/menu.js`
  shows a language picker on first use and builds sections dynamically from the
  plugins that actually register a `.قسم_<id>` command.

- **Changing the API base**: it lives in exactly one place — `lib/config.js`
  (`DEFAULT_API_BASE`), exposed as `global.API_BASE` and overridable with the
  `API_BASE` env var. 37 plugins read it; do not hardcode hosts in plugins.
  The default host (apex) is dead (HTTP 402), so it must be repointed.
- **Command names must be unique across plugins.** The dispatcher runs *every*
  matching plugin (no `break`), so a name registered twice replies twice. Run
  `npm run audit:plugins` after adding/renaming commands — it fails on load
  errors and lists duplicate command names.
- A plugin may `export default` a single handler, an array of handlers, or a
  named `handler`; `lib/plugin-loader.js` normalizes all three.

- **API contract**: every plugin that calls the external service and the exact
  response shape it expects is documented in `docs/API.md`. Update it when you
  add or change an API-backed plugin.

- **Self-heal**: `lib/self-heal.js` watches console.error + process errors,
  notifies owners with a 5-minute yes/no confirmation, and on "yes" reloads the
  offending plugin and restarts the process. Owner confirmation is handled by
  `plugins/التصحيح-الذاتي.js`. Disable with `--no-selfheal`.
  Notifications are **deferred until login**: Baileys exposes `conn.user` as a
  getter over `authState.creds.me`, which is `undefined` until pairing/login
  completes, so any `sendMessage` before then throws
  `Cannot read properties of undefined (reading 'id')` (inside `relayMessage`).
  `sendToOwners()` checks `connectionReady(conn)` (`conn.user?.id`) and queues
  pre-login reports; `index.js` calls `flushSelfHeal()` on `connection === 'open'`
  to deliver them. The interactive-send override in `lib/simple.js` likewise
  skips the interactiveMessage path (falls back to plain text) until
  `conn.user.id` exists, so it never spams `console.error` during boot.

- **Bad MAC / failed decryption is non-fatal**: `lib/decrypt-guard.js` owns the
  policy. A message that libsignal cannot decrypt arrives as a `CIPHERTEXT`
  stub (`messageStubType == 2`) with no `message`; `handler.js` skips it early
  (logs `🛡️ فشل فك التشفير، تخطي الرسالة`) so no plugin runs and the bot never
  exits. `index.js`'s `uncaughtException` / `unhandledRejection` handlers route
  decrypt errors to the same guard instead of self-heal. When the *same phone
  number* fails MAC more than `DEFAULT_THRESHOLD` (5) times, the guard deletes
  only that number's `session-<number>*.json` files from `global.sessions`
  (`session/`) — never `creds.json`, never the whole session. Counters are
  per-number and reset after a cleanup. Pure + injectable, tested in
  `tests/decrypt-guard.test.js`.

- **Plugin loading is guarded and named**: `lib/plugin-load.js` loads one
  plugin with a timeout and never throws — it returns `{ ok, module }` or
  `{ ok: false, error }`, and on failure logs the plugin's *file name* via
  `console.error` (which `lib/self-heal.js` picks up). `filesInit()` in
  `index.js` runs all plugins in parallel through it, so one hanging/failing
  plugin is skipped and never blocks boot or the other plugins. Tests:
  `tests/plugin-load.test.js`.

- **`pluginFolder` must NOT be wrapped in `global.__dirname()`**:
  `global.__dirname()` calls `path.dirname()`, which strips the last path
  segment. `global.__dirname(join(__dirname, './plugins'))` therefore resolves
  to the **project root**, not `plugins/`. The root contains `index.js`, so the
  loader imported the bot's own entry point as a plugin → circular self-import →
  hang → `plugin load timed out in index.js`. Use `join(__dirname, './plugins')`
  directly. (The original source used `./plugins/index`, which is why the old
  wrapper happened to work.)

- **No network calls at the top of `index.js`**: static `import` of a plugin
  file executes its whole module body *before* the plugin guard. `plugins/_allfake.js`
  and `plugins/sockets-serbot.js` (the latter runs `exec` + `fetchLatestBaileysVersion`
  + `useMultiFileAuthState` at import time) are now loaded through
  `loadPlugin()` instead of a top-level `import`, so they can't stall boot.

- **One `sharp` for the whole tree (npm `overrides`)**: `wa-sticker-formatter`
  depends on `sharp@^0.30`, whose prebuilt `sharp-linux-x64` binary is missing on
  a fresh install, so `plugins/ستيك.js` failed to load with
  `Cannot find module '../build/Release/sharp-linux-x64.node'`. The root
  `dependencies` already pin `sharp@^0.34.5`, which ships working binaries and
  is API-compatible with `wa-sticker-formatter`'s usage (`toFormat('webp')`,
  `resize`, `fit.cover/contain`, `composite`, `.webp()`). `package.json`'s
  `overrides: { "sharp": "^0.34.5" }` collapses the nested copy into the root
  one, so there is a single working `sharp`. Run `npm install` after editing it.

- **Plugin module bodies must not `throw` at import time for missing optional
  data**: `loadPlugin()` treats a top-level throw as a load failure and skips
  the whole file forever. Read optional JSON/media lazily inside the handler (or
  guard with `existsSync`) instead of `throw`ing in the module scope. Required
  data files (`zraf.json` is committed) are the exception.


- **Never force-exit or self-wipe**: `lib/API.js` (dead code today — nothing
  imports it) used to run `fs.rmSync(process.cwd(), { recursive: true })` then
  `process.exit(1)` from a panel-triggered "death" path, which would erase the
  source and every session with no way back. The death path now only notifies
  the owner and logs; no file deletion, no `process.exit`. `tests/no-exit.test.js`
  fails if `process.exit(` or `rmSync(process.cwd())` reappears in `lib/*.js`
  or the entry files.
