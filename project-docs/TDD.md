# Aigis: Technical Design

Status: **Approved**, with the [PRD](PRD.md) · Last updated: 2026-11-26

Versions, prices and quotas were checked on 2026-11-26. Re-check them when scaffolding.

## 1. Stack

| Concern | Choice | Reason |
|---|---|---|
| Runtime | Node.js 24 LTS | Meets the engine floors of the libraries below. |
| Language | TypeScript 6.0.x, strict | typescript-eslint does not support TypeScript 7 yet (`<6.1.0`). |
| Discord | discord.js 14 | Mature, typed. |
| Music | Lavalink 4.2.2+ with the youtube-source plugin | Handles voice and Discord's required voice encryption (DAVE) outside the bot. |
| AI | Cloudflare Workers AI | Free daily allowance, no training on content. |
| Storage | SQLite via better-sqlite3 | One file, no server, ample for 8 users. |
| Validation | zod | Environment and input validation. |
| Logging | pino | Structured logs with redaction. |
| Scheduling | croner | Time-zone aware, in process. |
| Tests | Vitest | Fast, native TypeScript. |
| Lint and format | ESLint (type-aware), Prettier | Catches floating promises. |
| Deployment | Docker Compose | Bot and Lavalink as two services. |

## 2. Architecture

A modular monolith with one database, plus Lavalink as a sidecar.

```
Discord gateway
      |
  core/  (router, registry, config, db, scheduler, logger, i18n, ai)
      |
  modules/<feature>/  commands -> service -> repository -> SQLite
                                      |
                        adapters (AI, Lavalink, clock)
```

```
src/
  index.ts              composition root
  core/
  modules/
    system/  music/  sharing/  krillion/  availability/
    chat/  daily/  translation/  games/
      index.ts          module definition
      commands/         Discord I/O only
      service.ts        domain logic, no discord.js imports
      repository.ts     SQL and migrations
  locales/              pt, en
content/                affirmations, character pool, persona prompt
tests/                  integration and contract tests
```

Unit tests sit beside their source files.

### Module contract

```ts
interface BotModule {
  name: string;
  commands: Command[];             // each may declare aliases
  components?: ComponentHandler[]; // buttons, selects, modals
  events?: EventHandler[];
  jobs?: ScheduledJob[];
  migrations?: Migration[];
}
```

`components`, `events` and `jobs` are added to the contract when the first feature needs them.

Rules:

- Modules are listed explicitly in the composition root (`src/app.ts`).
- Modules depend on `core`, never on each other. Cross-feature statistics go through a small interface the owning module exports.
- Dependencies (database, clock, logger, AI and music clients) are passed in, so tests can replace them.
- A module can be disabled by config (added with music, the first module worth disabling).
- Handler errors are caught by the router: log with a correlation ID, reply with a generic ephemeral message.
- Component custom IDs are `module:action:id`, with state in the database, so buttons survive restarts.

## 3. Discord integration

- **Interactions first:** slash commands, buttons, modals, one message context menu (F7.5). Call `deferReply` when work may exceed 3 seconds.
- **Aliases:** the registry expands each alias into its own command sharing one handler. Discord allows 100 slash commands per server, so alias only frequent commands.
- **Intents:** `Guilds`, `GuildMessages`, `GuildVoiceStates` and the privileged `MessageContent`. The last is needed for screenshot lookup, unprompted replies and translation, including when reading history. Enable it in the developer portal.
- **Permissions:** view, send, embed, attach, read history, connect, speak, and private thread creation and sending in threads. Never Administrator.
- **Command registration:** guild-scoped, through a separate script.
- **One application, one server:** development happens on the same server the group uses, so test in a private channel. Add a separate development application if that becomes disruptive.

## 4. Data

- Migrations are numbered SQL strings in TypeScript, so the build needs no file copying. They are applied in a transaction at startup and recorded in `schema_migrations`.
- Timestamps are UTC. Schedules are local weekday and time plus an IANA zone. "Today" for daily limits is the user's local date.
- WAL mode, foreign keys on.

| Module | Tables |
|---|---|
| core | `guild_config` (default language), `guild_channels`, `user_prefs` (language, zone, AI opt-out), `job_runs`, `ai_usage` (counts only) |
| sharing | `share_members`, `share_rounds`, `share_ratings` |
| krillion | `krillion_entries` (unique on user and day, integer score, message ID) |
| availability | `weekly_slots`, `overrides` (date range), `override_slots` |
| daily | `daily_affirmations`, `daily_characters`, `character_book`, `card_votes`, `category_weights` |
| translation | `translation_sessions` |
| games | `games`, `user_games` (status: green, yellow, red) |

- The three schedule presets in F4.1 are input shortcuts: all of them write `weekly_slots` per weekday.
- Language resolves as the user's choice, then the server default (initially English). This covers fixed strings and chat replies.
- Per-day uniqueness (F6.1, F6.2) is enforced by unique constraints on date and item, not only in code.
- Round deadlines, reminders and translation timeouts are stored as timestamps and checked by a periodic job, so they survive restarts.
- Discord attachment links expire, so Aigis keeps the message holding a screenshot and links to the message.

**Backups:** daily online backup, keep 14, copy one off the host. Test a restore before real data accumulates.

## 5. Music

- The bot talks to Lavalink through a Node client library. Pick one with DAVE support at implementation time (not yet verified).
- Lavalink is reachable only on the internal Compose network, with its own password.
- The youtube-source plugin must be updated often. Pin a version and bump it deliberately.
- Queue state is in memory. A restart clears it.
- Lavalink needs Java and several hundred MB of memory, which sizes the host.
- The earlier bot was Red-DiscordBot, which also played YouTube through Lavalink and youtube-source. No custom code was found to port. `C:\dev\redenv` contains no bot packages. Its settings used youtube-source 1.13.1, now outdated.

## 6. AI

- A `ChatProvider` interface in `core`, with a Workers AI implementation and a fake for tests. Used by chat and translation.
- **Free allowance:** 10,000 "neurons" a day, reset at 00:00 UTC. Requests fail beyond it. Capacity depends heavily on the model, so measure real usage.
- **Model:** chosen by a short trial in pt-PT and English before step 4. Candidates are the Llama, Mistral, Qwen and Gemma models on the free allowance. A dedicated translation model may be cheaper for F7.
- **Fallback:** Groq's free tier, if quality or quota is not enough. Its services agreement says they are "not for consumer use", so read it first.
- **Budget:** count usage per feature. Reserve a share for direct chat so translation cannot exhaust it. Batch translation messages.
- Persona prompt and lore live in `content/`, from [PERSONA.md](PERSONA.md).
- In-memory context per channel, short expiry.
- The model gets **no tools**, database access or secrets. Prompt injection can at worst produce a silly reply.
- Unprompted replies: send a limited window of recent messages, with opted-out users removed and names replaced by placeholders. The model returns the chosen message and reply, validated with zod.

## 7. Daily content

- Affirmations and characters come from curated files in `content/`. No AI and no live scraping.
- Each character entry has: name, category, gender, real or fictional, age status (`adult`, `minor`, `unknown`) with its basis, source link, short description, image link.
- The button set comes from age status: `adult` gets 🔥/❌, anything else gets W/L. A missing value fails validation. Real people must be `adult`. The vote handler checks this too.
- Curation is what makes F6.7 and "popular only" enforceable. A random wiki page cannot guarantee either.
- Images and descriptions come from Wikipedia or wiki APIs with attribution, gathered when the pool is built. Fandom refused an automated page request during research, so check access per source.
- Per-user weights live in the database, never in the repository.

## 8. Security

| Threat | Mitigation |
|---|---|
| Leaked token or key | `.env` outside git, validated at startup, redacted from logs, secret scanning and push protection. Rotate on exposure. |
| Bot added elsewhere | Turn off Public Bot; guild allow-list, leave on join. |
| Excess permissions | Section 3 list only. |
| Mass pings | `allowedMentions: { parse: [] }` by default, loosened per message for specific users. |
| Unauthorized actions | Default member permissions plus a check in the handler. |
| SQL injection | Prepared statements only. |
| Hostile input | zod and length limits. Music and sharing links are matched against an allow-list of YouTube hosts. |
| SSRF | The bot fetches no user-supplied URLs. The one download is a screenshot from Discord's CDN hosts, with size cap and timeout, checked by file signature. |
| Private messages leaking | Opted-in channels only, opt-out honoured, nothing stored or logged. Translation threads include only the requester by default. |
| Lavalink exposure | No published port, strong password, no personal accounts. |
| Supply chain | Lockfile, `npm ci`, pinned plugin versions and image tags, Dependabot, `npm audit`. |
| Host compromise | Non-root containers, no inbound ports, SSH keys only, automatic updates. |

## 9. Testing

| Layer | What | How |
|---|---|---|
| Unit | Time ranges, midnight wrap, daylight saving, override precedence, rating bounds and averages, daily uniqueness, weighting, button set by age status, session timeouts, quota limits | Pure functions, injected clock and random source |
| Integration | Repositories, migrations, constraints, due-job recovery after restart | Real temporary SQLite |
| Handler | Permissions, validation, error replies, opt-outs | Minimal fake interaction |
| Contract | Unique command names and aliases, custom ID prefixes, every string in both locales, every character entry valid | Tests over the registry and `content/` |
| Smoke | Discord behaviour and real playback | Manual checklist in a private channel |

- No network or real credentials in tests or CI.
- No coverage target. Every bug fix gets a test that fails before the fix.
- CI on pull requests: typecheck, lint, test, build, audit, secret scan.

## 10. Hosting

| Option | Cost | Trade-off |
|---|---|---|
| Machine at home (old PC, Raspberry Pi 4 or better) | Power, or hardware once | A home address is least likely to be blocked by YouTube. Depends on home power and network. |
| Small VPS (for example Hetzner) | About €6/month | Reliable. YouTube may block its address. |
| Oracle Cloud Always Free | £0 | Enough memory on paper. Allowance was halved in 2026, signup is reported unreliable, datacenter address. |
| Vercel | | Not suitable for a persistent bot with voice. |

**MVP: the operator's Windows PC** with Docker Desktop. A VPS at about £5 a month may follow; test playback there before relying on it.

- `restart: unless-stopped`, database on a volume, log rotation, graceful shutdown on `SIGTERM`.
- Docker Desktop must start at sign-in and the PC must not sleep. After a Windows restart the bot waits for sign-in.
- Due jobs run on startup, so deadlines missed while the PC was off are handled.
- Backups are copied outside the Docker volume.
- Moving to a server later means copying the database and `.env`.

## 11. Configuration

Environment variables: `DISCORD_TOKEN`, `DISCORD_APP_ID`, `DISCORD_GUILD_ID`, `DATABASE_PATH`, `LOG_LEVEL`, `LAVALINK_PASSWORD`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` (scoped to Workers AI only).

Channels, schedules and weights are settings in the database.

## 12. Milestones

One branch and pull request each. Order follows PRD section 7.

| Milestone | Deliverable | Needed from the operator |
|---|---|---|
| M0 | Scaffold, config, database, router, registry, aliases, i18n, server lock, `/ping`, `/help`, `/language`, `/timezone`, `/config`, tests, CI | Application, token, server |
| M1 | Docker Compose on the local PC, backups | Docker Desktop running |
| M2 | Music | A voice channel for testing |
| M3 | Sharing and Krillion | Channels |
| M4 | Model trial, chat, unprompted replies | Cloudflare account, group consent |
| M5 | Translation | None |
| M6 | Daily rituals | Review of the content pools |
| M7 | Availability and games | None |
