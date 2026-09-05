# Telegram enquiry notifications

Server-side Telegram Bot API integration for new website enquiries.

## Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram and create a bot. Copy the **bot token**.
2. Start a chat with the bot (or add it to a group).
3. Get the **chat ID** (e.g. via `@userinfobot` or the Telegram `getUpdates` API after messaging the bot).
4. Set environment variables (never commit secrets):

```env
TELEGRAM_NOTIFICATIONS_ENABLED=true
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_NOTIFICATION_TIMEOUT_MS=5000
```

5. Deploy / restart the app.
6. Open **Admin → Settings → Telegram notifications**.
7. Click **Send test notification**.
8. Submit a test enquiry on `/contact` and confirm the chat receives a message.

## Behaviour

- The enquiry is saved to Supabase first. Telegram runs afterward via Next.js `after()`.
- Telegram failure never fails the public form.
- Duplicate sends are prevented via `enquiry_events` (`notification_sent` + provider metadata).
- Retries: up to 3 attempts with backoff inside the background task.

## Security

- Bot token is server-only (no `NEXT_PUBLIC_`).
- Admin test/status endpoints require an admin session and are rate-limited.
- Customer content is sent as plain text (no Markdown injection).
