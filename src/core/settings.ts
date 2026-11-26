import type { Db, Migration } from './db.js';
import { isLocale, type Locale } from './i18n.js';

export const DEFAULT_LOCALE: Locale = 'en';
export const DEFAULT_TIME_ZONE = 'Europe/London';

export const CHANNEL_PURPOSES = ['general', 'commands'] as const;
export type ChannelPurpose = (typeof CHANNEL_PURPOSES)[number];

export const coreMigrations: Migration[] = [
  {
    id: 'core/001-settings',
    sql: `
      CREATE TABLE guild_config (
        guild_id TEXT PRIMARY KEY,
        default_locale TEXT NOT NULL
      ) STRICT;
      CREATE TABLE guild_channels (
        guild_id TEXT NOT NULL,
        purpose TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        PRIMARY KEY (guild_id, purpose, channel_id)
      ) STRICT;
      CREATE TABLE user_prefs (
        user_id TEXT PRIMARY KEY,
        locale TEXT,
        time_zone TEXT
      ) STRICT;
    `,
  },
];

export function createSettings(db: Db) {
  function defaultLocale(guildId: string): Locale {
    const row = db
      .prepare('SELECT default_locale AS locale FROM guild_config WHERE guild_id = ?')
      .get(guildId) as { locale: string } | undefined;
    return row && isLocale(row.locale) ? row.locale : DEFAULT_LOCALE;
  }

  function userPrefs(userId: string) {
    return db
      .prepare('SELECT locale, time_zone AS timeZone FROM user_prefs WHERE user_id = ?')
      .get(userId) as { locale: string | null; timeZone: string | null } | undefined;
  }

  return {
    defaultLocale,

    setDefaultLocale(guildId: string, locale: Locale): void {
      db.prepare(
        `INSERT INTO guild_config (guild_id, default_locale) VALUES (?, ?)
         ON CONFLICT (guild_id) DO UPDATE SET default_locale = excluded.default_locale`,
      ).run(guildId, locale);
    },

    localeFor(guildId: string, userId: string): Locale {
      const chosen = userPrefs(userId)?.locale;
      return chosen && isLocale(chosen) ? chosen : defaultLocale(guildId);
    },

    setUserLocale(userId: string, locale: Locale): void {
      db.prepare(
        `INSERT INTO user_prefs (user_id, locale) VALUES (?, ?)
         ON CONFLICT (user_id) DO UPDATE SET locale = excluded.locale`,
      ).run(userId, locale);
    },

    timeZoneFor(userId: string): string {
      return userPrefs(userId)?.timeZone ?? DEFAULT_TIME_ZONE;
    },

    setUserTimeZone(userId: string, timeZone: string): void {
      db.prepare(
        `INSERT INTO user_prefs (user_id, time_zone) VALUES (?, ?)
         ON CONFLICT (user_id) DO UPDATE SET time_zone = excluded.time_zone`,
      ).run(userId, timeZone);
    },

    channels(guildId: string, purpose: ChannelPurpose): string[] {
      return db
        .prepare(
          'SELECT channel_id FROM guild_channels WHERE guild_id = ? AND purpose = ? ORDER BY channel_id',
        )
        .pluck()
        .all(guildId, purpose) as string[];
    },

    addChannel(guildId: string, purpose: ChannelPurpose, channelId: string): void {
      db.prepare(
        'INSERT OR IGNORE INTO guild_channels (guild_id, purpose, channel_id) VALUES (?, ?, ?)',
      ).run(guildId, purpose, channelId);
    },

    removeChannel(guildId: string, purpose: ChannelPurpose, channelId: string): void {
      db.prepare(
        'DELETE FROM guild_channels WHERE guild_id = ? AND purpose = ? AND channel_id = ?',
      ).run(guildId, purpose, channelId);
    },
  };
}

export type Settings = ReturnType<typeof createSettings>;
