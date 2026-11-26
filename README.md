# Aigis

A private Discord bot for a small group of friends. Named after the android in Persona 3 who learns to be human.

This is a private bot, built for one server. If you would like to set it up yourself, contact [nekudevs](https://github.com/nekudevs) for more details.

## Status

**Milestone M0 (foundation) is working on Discord.** The MVP will run on the operator's PC.

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
- 2026-11-26: review fix: a command that no longer exists now gets a reply. M0 merged ([PR #1](https://github.com/nekudevs/aigis/pull/1)). Documents committed locally; privacy policy and terms published as gists.
