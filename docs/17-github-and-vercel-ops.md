# ARCHITAK Platform — Ops notes

## Secret scanning

Enable GitHub **secret scanning** and **push protection** on the repository. Never commit `.env.local`.

## Environments

Map GitHub Environments `preview` / `production` to Vercel Preview / Production env vars. See `docs/16-environment-and-configuration.md`.
