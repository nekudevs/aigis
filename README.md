# Aigis

A private Discord bot for a small group of friends. Named after the android in Persona 3 who learns to be human.

## Status

**Milestone M0 (foundation) is written and passes its tests, but has not run against Discord yet.** The MVP will run on the operator's PC.

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

TypeScript, Node.js (24 targeted, 22.12 minimum), discord.js, SQLite, Vitest. Planned: Lavalink, Cloudflare Workers AI, Docker.

## Setup

1. In the [Discord Developer Portal](https://discord.com/developers/applications), create a development application. Copy the Application ID and, on the Bot page, a token.
2. Turn off **Public Bot**. If the portal refuses, first set the install link to "None" on the Installation page.
3. Create a test server. Invite the bot with the `bot` and `applications.commands` scopes and the View Channels and Send Messages permissions.
4. In Discord, enable Developer Mode, then copy the server ID.
5. Create a `.env` file in the project root:

   | Variable | Value |
   |---|---|
   | `DISCORD_TOKEN` | Bot token (secret) |
   | `DISCORD_APP_ID` | Application ID |
   | `DISCORD_GUILD_ID` | Server ID |
   | `DATABASE_PATH` | Optional, default `./data/aigis.db` |
   | `LOG_LEVEL` | Optional, default `info` |

6. Run:

   ```sh
   npm ci
   npm run register
   npm run dev
   ```

The bot leaves any server other than `DISCORD_GUILD_ID`.

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

## Latest changes

- 2026-11-26: initial PRD, technical design, project rules and README.
- 2026-11-26: second draft after review: music required, free-tier AI, translation, daily character, persona notes.
- 2026-11-26: third draft: local hosting for the MVP, Krillion scoring, language defaults, W/L voting.
- 2026-11-26: requirements and design approved.
- 2026-11-26: M0 foundation and CI. Nothing is committed yet.
