# Email configuration

Mailtrap is the default email service. Team Invite uses the HTTP Sending API. Credentials stay on the server; the repository contains no account credentials.

## Development and staging

Copy `.env.example` to `.env`. Keep `MAIL_MODE=sandbox`, set `MAIL_FROM`, `MAILTRAP_SANDBOX_TOKEN`, and numeric `MAILTRAP_INBOX_ID` from the Sandbox API integration page. The ordinary app workflow sends to `https://sandbox.api.mailtrap.io/api/send/{inbox_id}`; messages are captured in that Sandbox. Disable forwarding when external delivery is not intended.

## Production

Verify your sending domain, set `MAIL_MODE=production`, `MAIL_FROM` on that domain, and `MAILTRAP_PRODUCTION_TOKEN` with sending permission. Transactional mail uses `https://send.api.mailtrap.io/api/send`. Both environments use Bearer authentication over HTTPS. Restart after changing configuration. Replace operator/reviewer addresses if used by this app.

## Message details

Each content send includes a workflow `category`, plain text and escaped HTML. `custom_variables` carries the stored record ID and workflow for finding the message in provider logs; it does not render template text. `X-Workflow-Reference` supplies the same reference as a custom header. A contact or review message uses `reply_to` when the workflow has a reply address. No extra recipients are added to an email for demonstration purposes.

## Previews and failures

`MAIL_MODE=log` with `npm run dev` writes private JSON previews to `.data/emails.jsonl`; it makes no network call and is disabled in production. Keep these files private because they can contain addresses and action links.

A provider acceptance response must contain `success: true` and a message ID for each recipient. Accepted means submitted to the provider, not delivered to the inbox. Missing credentials and explicit rejection remain visible as failed; correct configuration and run `npm run retry-email`. Timeouts, server errors, malformed replies, and interrupted sends stay unknown or sending. Inspect provider logs before deciding how to reconcile them; they are not resent automatically. Retries are operator initiated, including rate-limit rejections; wait for the provider's cooldown before retrying.

Existing SMTP settings are no longer read. When upgrading an earlier copy, replace Sandbox username/password with the API token and Sandbox ID; production retains `MAILTRAP_PRODUCTION_TOKEN`. Old queued content messages can still be sent.

Reference: [Sending API](https://docs.mailtrap.io/developers), [official API schemas](https://github.com/mailtrap/mailtrap-openapi), [custom variables](https://docs.mailtrap.io/email-api-smtp/advanced/custom-variables).

## Optional hosted template

Create a template in the provider dashboard using `email-templates/template.json`. It contains the required subject, category, text and HTML. The file is also the request body for `POST https://mailtrap.io/api/email_templates` if you manage templates by API with appropriate permissions. Copy its **UUID**, not numeric ID, into `MAILTRAP_TEMPLATE_UUID` for production or `MAILTRAP_SANDBOX_TEMPLATE_UUID` for Sandbox. Variables supplied by this app: `name`, `role`, `invite_url`, `expires_in`. Keep standard escaped `{{variable}}` interpolation. With a UUID set, the request sends `template_uuid` and `template_variables`; subject/content/category come only from the template. Leave both UUIDs blank to use built-in content. Local previews show the request, not a rendered remote template.
