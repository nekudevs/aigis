# Aigis: Product Requirements

Status: **Approved** · Last updated: 2026-11-26

## 1. Overview

Aigis is a private Discord bot for one server of about 8 friends. The goal is 24/7; the MVP runs on the operator's own PC. It replaces an earlier bot, LABóBOT, whose one feature to carry over is YouTube playback. The name comes from Persona 3, where an android gradually learns to be human. Her character is described in [PERSONA.md](PERSONA.md).

## 2. Goals and non-goals

**Goals**

- Give the group small daily and weekly reasons to interact.
- Spend nothing where possible, and no more than about £10 a month.
- Make a new feature a self-contained addition.

**Non-goals**

- Public bot, multi-server support, sharding.
- Web dashboard.
- Moderation tooling.
- Playing Krillion inside Discord (the group prefers the website).

## 3. Users

- About 8 members, mostly Portuguese speakers, some not, in the UK and Portugal.
- Time zone is per user, typically `Europe/London` or `Europe/Lisbon`. Default London.
- The server owner sets the default language, initially English. Each user can choose Portuguese or English for the bot's replies to them. Posts addressed to everyone use the server default.

## 4. Principles

- **Opt-in.** Nobody has to use any feature. The bot only pings people who joined that feature.
- **Low effort.** Interacting takes one command or one click.
- **Contained.** The bot works only in configured channels: general channels and a commands channel.
- **Free first.** A paid service needs the operator's explicit approval.

## 5. Features

Commands are slash commands, with no `!` prefix. Discord has no built-in aliases, so a short alias is a second command with the same behaviour (for example `/da`). Command names must be lowercase.

Feature numbers are identifiers. Build order is in section 7.

### F0: Foundation

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F0.1 | Bot stays online | Restarts automatically after a crash. While run locally, it is online only when the PC is on and awake, and catches up on missed deadlines at startup. |
| F0.2 | `/ping`, `/help` | `/help` lists every enabled command and alias. |
| F0.3 | Server lock | The bot leaves any server that is not allow-listed. |
| F0.4 | Admin config | Only admins can set which channels each feature uses. |
| F0.5 | `/language` | Each user picks Portuguese or English for replies to them. Without a choice, the server default applies. |
| F0.6 | Server default language | Only the server owner can change it. |
| F0.7 | `/timezone` | Each user picks their time zone. |

### F1: Music (required)

Modelled on the core of Jockie Music.

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F1.1 | `/play <YouTube link or search>` | Aigis joins the caller's voice channel and plays it. |
| F1.2 | `/pause`, `/resume`, `/skip`, `/queue`, `/clear`, `/stop` | Only members in the same voice channel can use them. |
| F1.3 | `/nowplaying`, `/loop`, `/shuffle`, `/remove` | Behave as named on the current queue. |
| F1.4 | Leave when idle | Leaves after a few minutes with an empty queue or channel. |
| F1.5 | Playback failure | A clear message, and the rest of the bot keeps working. |

Later, if wanted: SoundCloud, and Spotify links (looked up by title and played from YouTube). Not planned: several simultaneous players, audio filters.

### F2: Sharing (YouTube videos only for now)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F2.1 | `/share join`, `/share leave` | Only joined members are pinged about rounds. |
| F2.2 | `/share start <link>` opens a one-week round | A joined member can start it. Only YouTube links are accepted. One open round at a time (assumption). |
| F2.3 | `/share rate <score>` | 0.0 to 10.0, one decimal. Rating again replaces the score. The sharer may rate. Ratings are private until the round closes. |
| F2.4 | 24-hour reminder | Posted once, pinging joined members who have not rated. |
| F2.5 | Close and announce | Posts the average and number of ratings. With no ratings, says so. Works if the bot was offline at closing time. |
| F2.6 | Statistics | Per user, per shared item and overall. Detail to be refined later. |

Films and songs may become separate categories later, each with its own ratings and statistics.

### F3: Krillion

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F3.1 | `/krillion submit <score>` with a screenshot | The score is a whole number, zero or more. One entry per user per day. Resubmitting replaces it. No screenshot, no entry. |
| F3.2 | Use an already posted screenshot | If none is attached, Aigis looks for the user's image posted today in that channel and asks them to confirm it. Otherwise it asks for one. |
| F3.3 | Image check | The file must really be a PNG, JPEG or WebP, judged by its contents. Nothing else is checked: members review screenshots themselves. |
| F3.4 | `/krillion leaderboard` | Daily, weekly and all-time, adding up scores. Higher is better. The top three get 🥇🥈🥉, and ties share a medal. Entries link to their screenshots. |

### F4: Availability

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F4.1 | Set a default "usually free" schedule | Choose: same every day, weekdays and weekends, or custom per day. Ranges that cross midnight work. |
| F4.2 | Override the default for today, this week or this month | "Week" and "month" mean the rest of the current one. The narrowest override wins: day, then week, then month, then default. Overrides expire on their own. |
| F4.3 | `/kdvcs` shows who is free now or at a given time | Correct across time zones and daylight saving changes. Users with no schedule are not listed. |

### F5: Aigis chat

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F5.1 | `/aigis <message>` or @mention gets an in-character reply | Replies in the user's chosen language, or the server default. |
| F5.2 | Short conversation context | Follow-ups work within a channel. Context expires and is not stored on disk. |
| F5.3 | Limits | Per-user rate limit and a daily cap inside the free quota. At the cap, Aigis says so. |
| F5.4 | Safe output | A reply can never ping `@everyone`, roles or users. |
| F5.5 | Unprompted reply | Once a day at a random daytime moment, Aigis reads recent messages in opted-in channels and replies to the one with the most promising comeback. Skips quiet days. |
| F5.6 | Consent | Members are told that messages go to an AI provider. Anyone can exclude their own messages from F5.5 and F7. |
| F5.7 | Lore | Occasional references to Persona 3, without late-story spoilers unless asked. |

### F6: Daily rituals (on demand, not scheduled)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F6.1 | `/daily-affirmation` (`/da`) | One per user per day, and no two users get the same one that day. Asking again repeats it. |
| F6.2 | `/daily-character` (`/dc`) | One character per user per day with image, short description and source link. No two users get the same one that day. |
| F6.3 | Preference | The user chooses male or female characters. Everything else is random. |
| F6.4 | Categories | Games, films, K-pop, music artists, actors, superheroes, popular anime. Weights are configurable per category and per user. Music and acting favour current and Gen Z stars. K-pop and anime are low by default. |
| F6.5 | Character book | The user can keep the character and view their book. |
| F6.6 | Card voting | Adults get 🔥 and ❌ buttons. Fictional characters who are minors, or of unknown age, get **W** and **L** buttons instead. One vote per person per card, changeable, shown in the owner's book. |
| F6.7 | Age safety | A card gets 🔥 and ❌ only if the character is confirmed adult. Real people in the pool must be 18 or over. |

This replaces the earlier weekly ranking poll.

### F7: Translation

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F7.1 | `/translate` opens a private thread with today's conversation in English | Covers the channel it was run in, from midnight, up to a message limit. |
| F7.2 | Live translation | New messages in the source channel appear translated, possibly batched with a short delay. English messages pass through. |
| F7.3 | `/end-translation` (`/et`) | Closes the session. |
| F7.4 | Time limit | After 28 minutes, pings the requester to continue or stop. Continue adds 30 minutes and repeats. Stop, or no answer in 2 minutes, closes it. |
| F7.5 | Message translate | Right-click a message, Apps, Translate: a private translation of that one message. |

F7.5 is an addition: it is cheap and covers the common case of one unclear message.

### F8: Games

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F8.1 | Register games you own | Users edit only their own entries. |
| F8.2 | Traffic light per game | 🟢 super down, 🟡 maybe, 🔴 owns it but probably not. Changeable any time. |
| F8.3 | `/who-plays <game>` | Lists owners grouped by colour. Autocompletes known games. |

## 6. Quality requirements

- **Availability:** best effort, no SLA. Recovers without manual action.
- **Responsiveness:** every command acknowledges within Discord's 3 second limit.
- **Cost:** £0 for AI. Hosting £0 if practical, otherwise up to about £10 a month.
- **Privacy:** store only what a feature needs. `/privacy delete` removes a user's data. Message text is neither stored nor logged.
- **Language:** all fixed bot text comes from a Portuguese and an English string catalog.
- **Data safety:** daily backup, with a tested restore.

## 7. Build order

| Step | Delivers |
|---|---|
| 1 | F0 foundation and deployment |
| 2 | F1 music, so LABóBOT can be retired |
| 3 | F2 sharing and F3 Krillion |
| 4 | F5 chat |
| 5 | F7 translation |
| 6 | F6 daily rituals |
| 7 | F4 availability and F8 games |

## 8. Risks and constraints

- **Music** is the most fragile feature. YouTube playback is against YouTube's terms (accepted by the operator for a private bot). The practical risks are bot checks, blocked datacenter addresses and frequent breakage. Do not attach a personal Google account.
- **Gemini free tier is not used.** Google requires paid services for apps offered to users in the UK as well as the EEA.
- **A Claude subscription cannot power the bot.** Anthropic does not allow routing other people's requests through a Pro or Max plan.
- **Vercel does not fit.** The bot needs a process that stays connected, and voice for music.
- **Free AI quota** is limited and can change. Chat, unprompted replies and translation share it, and a busy translation session could use much of a day's allowance.
- **Portuguese quality** from free models is unknown. Test before building F5 and F7.
- **Reading messages:** F3.2, F5.5 and F7 need Discord's Message Content permission.
- **Public repository:** no secrets, member names or handles, IDs, per-member settings or private conversations.
- Aigis is an Atlus character. Keep this private and non-commercial, and use no official art in the repository.

## 9. Decisions and open questions

Decided on 2026-11-26: build order accepted; run locally for the MVP, with a small server (about £5 a month) considered later; translation uses a private thread; hot or not uses buttons; sharing ratings stay hidden until close and the sharer may rate.

Confirmed on approval: Krillion weekly and all-time rankings add up scores; scores are whole numbers, zero or more; users without a chosen time zone get London; chat follows the chosen language.

Later, if wanted: chat replies that follow the language of each message.
