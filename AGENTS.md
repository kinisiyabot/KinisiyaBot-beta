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
