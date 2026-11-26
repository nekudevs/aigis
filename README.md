# Aigis

A private Discord bot for a small group of friends. Named after the android in Persona 3 who learns to be human.

This is a private bot, built for one server. If you would like to set it up yourself, contact [nekudevs](https://github.com/nekudevs) for more details.

## Status

**M0 (foundation) and M1 (Docker and backups) are verified on Discord.** The MVP runs on the operator's PC.

Working commands: `/ping`, `/help`, `/language`, `/timezone`, `/config`.

## Planned features

In proposed build order:

1. Foundation: 24/7 hosting, help, Portuguese or English per user
2. YouTube music playback
3. Weekly video rating rounds, Krillion leaderboard with screenshots
4. Chat with Aigis, in character
5. Live translation into English
6. Daily affirmation and daily character
7. Availability ("who's free?") and games list

## Stack

TypeScript, Node.js (24 targeted, 22.12 minimum), discord.js, SQLite, Vitest, Docker. Planned: Lavalink, Cloudflare Workers AI.

## Setup

For the operator.

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create an application. Copy the Application ID and, on the Bot page, a token.
2. On the Installation page, keep **Guild Install** only and set the install link to **None**. Then turn off **Public Bot** on the Bot page.
3. On OAuth2, use the URL Generator with the `bot` and `applications.commands` scopes and the View Channels and Send Messages permissions. Open the URL and add the bot to the server.
4. In Discord, enable Developer Mode, then copy the server ID.
5. Copy `.env.example` to `.env` and fill it in.
6. Run:

   ```sh
   npm ci
   npm run register
   npm run dev
   ```

The bot leaves any server other than `DISCORD_GUILD_ID`.

## Run with Docker

This is how the bot stays online. Stop `npm run dev` first: two copies with one token both answer.

```sh
docker compose build
docker compose run --rm bot node dist/register.js   # after command changes
docker compose up -d
docker compose logs -f bot
```

After pulling new code, run `build` and `up -d` again. Stop with `docker compose down`, and never add `-v`, which deletes the database.

To bring across data from running without Docker, once, before the first `up` (PowerShell):

```powershell
docker compose run --rm -v "${PWD}\data:/import:ro" bot sh -c "cp /import/aigis.db* /data/"
```

To stay online, enable "Start Docker Desktop when you sign in" in Docker Desktop and stop the PC from sleeping.

### Backups

Aigis writes one backup a day and keeps the newest 14, in `./backups` or in `BACKUP_HOST_DIR` if set in `.env`. A folder that syncs off the PC protects against disk failure; backups contain members' data, so keep it private.

On a Linux host, create that folder before the first start and give it to the container's user, or backups fail with "permission denied" (not needed with Docker Desktop on Windows):

```sh
mkdir -p backups && sudo chown 1000:1000 backups
```

To restore, replace the date:

```sh
docker compose stop bot
docker compose run --rm bot sh -c "cp /backups/aigis-YYYY-MM-DD.db /data/aigis.db && rm -f /data/aigis.db-wal /data/aigis.db-shm"
docker compose start bot
```

## Checks

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Documentation

- [Product requirements](project-docs/PRD.md)
- [Technical design](project-docs/TDD.md)
- [Aigis persona](project-docs/PERSONA.md)
- [Project rules for Claude Code](project-docs/CLAUDE.md)
- [Privacy Policy](https://gist.github.com/nekudevs/7c43b0ea88ef2fcf83fa1d4afb0faaf2) and [Terms of Service](https://gist.github.com/nekudevs/81cf662fd8af487f2a0de7b82cf354b6) (sources in `docs/legal/`)

## Latest changes

- 2026-11-26: initial PRD, technical design, project rules and README.
- 2026-11-26: second draft after review: music required, free-tier AI, translation, daily character, persona notes.
- 2026-11-26: third draft: local hosting for the MVP, Krillion scoring, language defaults, W/L voting.
- 2026-11-26: requirements and design approved.
- 2026-11-26: M0 foundation, CI and `.env.example`.
- 2026-11-26: `/timezone` now offers a fixed list of 24 offsets.
- 2026-11-26: review fix: a command that no longer exists now gets a reply. M0 merged ([PR #1](https://github.com/nekudevs/aigis/pull/1)). Privacy policy and terms published as gists.
- 2026-11-26: M1: Docker Compose and daily backups, verified on the operator's PC.
- 2026-11-26: review fixes: backup folder permissions on Linux documented, `BACKUP_DIR` added to `.env.example`.
