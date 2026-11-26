# Aigis

A private, modular Discord bot for one small server, built with TypeScript, discord.js and SQLite.

Requirements are in `project-docs/PRD.md` and design in `project-docs/TDD.md`. Both are approved.

## Commands

- Dev: `npm run dev`
- All tests: `npm test`
- Single test: `npx vitest run path/to/file.test.ts`
- Typecheck and lint: `npm run typecheck`, `npm run lint`, `npm run format:check`
- Register slash commands: `npm run register`
- Docker: `docker compose build`, `docker compose up -d`

## Architecture & Conventions

- Each feature is a module in `src/modules/<name>/`, listed explicitly in the composition root.
- Modules depend on `src/core/`, never on each other.
- `service.ts` never imports discord.js. Inject the clock, database and external clients.
- No `!` prefix commands. Aliases are declared on the command and registered as extra slash commands.
- Message Content is used only for screenshot lookup, unprompted replies and translation.
- Imports use `.js` extensions (NodeNext ESM). Add a module in `src/app.ts`.
- Fixed user-facing text goes through the Portuguese and English string catalogs.
- Services must be free tier unless the operator approves a cost.
- Only confirmed adults get hot-or-not buttons; minors and unknown ages get W/L. Real people in the pool must be adults (PRD F6.7). No exceptions.
- Project docs live in `project-docs/`. Other docs, such as diagrams, live in `docs/`.
- Update the PRD or TDD in the same change that alters a requirement or design decision.
- At the end of each session, update `README.md` to reflect the latest commit or pull request.

## Testing & Security

- Tests use a real temporary SQLite database and no network or real credentials.
- A bug fix starts with a failing test.
- The repository is **public**: never commit secrets, Discord IDs, member names, private conversations or database files.
- Keep `allowedMentions` closed by default and SQL parameterised.
- Never pass user input to a shell, and never fetch user-supplied URLs. Screenshots are downloaded from Discord's CDN only.
- Never store or log message text.
- The AI model gets no tools and no secrets.

## Gotchas

- Target is Node 24 LTS; the development machine had Node 22.15 on 2026-11-26.
- Primary development is on Windows, deployment is Linux in Docker. `better-sqlite3` is native, so never copy `node_modules` into the image.
- Pin TypeScript to 6.0.x until typescript-eslint supports 7.
- Never read `.env`. Keep `.env.example` in step with `src/core/config.ts`, with no real values.
- Re-run `npm run register` after changing command definitions.
- The image installs with `--ignore-scripts` because better-sqlite3 ships prebuilt binaries. A new dependency that needs an install script will break there.
- `docker compose config` prints `.env` values; use `--quiet`.
- `throwaway-*` files are private notes and are git-ignored. Keep them that way.
