# Team Invite

Invite someone to one shared team. This small application demonstrates **Expiring tokens and form actions** with SvelteKit.

## What it does

Invite a colleague to the studio workspace. Each invitation can be accepted once and expires after 24 hours.

The email workflow: send a single-use invitation link.

## Technologies

- SvelteKit
- Svelte
- Node.js 24 and its built-in SQLite module for local persistence
- Zod for input validation
- Mailtrap for email delivery

## Run locally

Install Node.js 24 or newer in the 24.x release line and npm. The built-in SQLite API is experimental in some Node 24 releases; no database server or native build tools are required.

```sh
npm ci
cp .env.example .env
# Edit .env: set ADMIN_PASSWORD, APP_URL, owner/recipient settings,
# and email credentials using docs/email-setup.md.
npm run dev
```

The app is served at http://localhost:3000. For operator access, choose a unique password of at least 16 characters. You can generate one with:

```sh
node -e "console.log(require('node:crypto').randomBytes(24).toString('base64url'))"
```

Use that value in `.env`; the operator username is `admin`. See [email configuration](docs/email-setup.md) for the default provider, development setup, and production settings. To explore locally without credentials, set `MAIL_MODE=log` while running `npm run dev`; resulting messages are written to `.data/emails.jsonl` and are **not sent**. Log mode is disabled when `NODE_ENV=production`.

## Try the workflow

1. Open http://localhost:3000 after starting the application.
2. Sign in with username `admin` and the `ADMIN_PASSWORD` you configured.
3. Complete the form with realistic sample values and submit.
4. Open the link in the resulting email, then confirm the action. Merely opening a link does not consume it.
5. Check `/admin` for the saved record and email state.

Example form values:

```json
{
  "name": "Alex Doe",
  "email": "alex@example.com",
  "role": "member"
}
```

Private links use hashed random tokens. State-changing token pages require a button press so email link scanners do not accidentally consume them.

## Configuration

| Variable | Meaning |
| --- | --- |
| `APP_URL` | Exact public origin; used for email links and cross-origin checks |
| `ADMIN_PASSWORD` | Operator password, at least 16 characters |
| `OWNER_EMAIL` | Fixed recipient for owner notifications; replace the example address |
| `REVIEWER_EMAIL` | Fixed reviewer for review requests; otherwise unused |
| `DB_PATH` | SQLite file; defaults to `.data/app.sqlite` |
| `HOST`, `PORT` | Production listener settings where supported by the framework |
| `MAIL_MODE` | `sandbox`, `production`, or local-only `log` |
| `ORIGIN` | SvelteKit public origin; set it to the same value as `APP_URL` |
| `BODY_SIZE_LIMIT` | Maximum request body in bytes; the example uses 16384 |

Email credential variables are documented in [email setup](docs/email-setup.md). Frameworks must be restarted after environment changes. Customize the app's public copy, fields, seeded event details, or menu in `src/core/config.js`; Nuxt also uses `app-definition.json` for its client-visible definition. Keep those two definitions consistent when editing.

## Where the main idea lives

- `src/routes/+page.svelte` (enhanced form) and `src/routes/+page.server.ts` (form action and load function).
- `src/core/service.js`: the application's workflow, field validation, and atomic state changes.
- `src/core/store.js`: SQLite records, hashed tokens, rate counters, and a small email outbox.
- `src/core/mail.js`: server-side email transport and environment selection.
- `test/workflow.test.mjs`: workflow and permission edge cases.
- `test/email.test.mjs`: transport configuration tests using local doubles.

## Check and build

```sh
npm test
npm run build
npm start
```

Tests exercise the app's business rules and email configuration without sending external mail. They do not prove production delivery. To check actual sending, configure your own credentials and complete the normal workflow with an address you control.

## Email failures

Saving a valid record and recording its intended email happen in one SQLite transaction. Sending happens afterward. An email failure leaves the record intact and appears in the operator page.

```sh
npm run retry-email
```

This retries pending and known-failed messages. `accepted` means accepted by the provider, not confirmed delivery. `logged` means a local preview only. Timeouts or partial HTTP API results are `unknown`; messages interrupted by a process crash may remain `sending`. These states are not automatically retried because a first send may have succeeded. Check provider logs before reconciling them manually.

## Deployment and limits

Run one Node process behind HTTPS with a persistent writable volume for `DB_PATH`. Run the build first, then start with your configured environment. Set `APP_URL` to the real HTTPS origin; do not trust arbitrary forwarded headers. The operator uses HTTP Basic authentication and must be protected by HTTPS outside localhost. This app is not designed for ephemeral or multi-instance serverless storage.

Form submissions are limited to 12 per client per hour and 3 per recipient per hour. Behind a reverse proxy, clients may share the proxy address; configure infrastructure limits before larger deployment. There is no multi-user operator system, payment processing, distributed job queue, or production email webhook tracker.

## License

MIT. See [LICENSE](LICENSE).

### Email layout

Built-in message content works with the default configuration. To manage the invitation layout remotely, use the optional hosted template in `email-templates/template.json`; the [email guide](docs/email-setup.md#optional-hosted-template) lists its variables and setup.
