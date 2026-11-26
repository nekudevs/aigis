import { describe, expect, it } from 'vitest';
import { GUILD_ID, MEMBER_ID, OWNER_ID, testApp } from './helpers.js';

const CHANNEL = '444444444444444444';

describe('language', () => {
  it('replies in English until the user or server chooses otherwise', async () => {
    const { run } = testApp();
    expect(await run({ command: 'ping' })).toContain('All systems operational');

    await run({ command: 'language', options: { language: 'pt' } });

    expect(await run({ command: 'ping' })).toContain('operacionais');
    expect(await run({ command: 'ping', userId: OWNER_ID })).toContain('operational');
  });

  it("keeps a user's choice when the server default changes", async () => {
    const { run, settings } = testApp();
    await run({ command: 'language', options: { language: 'en' } });

    await run({
      command: 'config',
      subcommand: 'language',
      options: { language: 'pt' },
      userId: OWNER_ID,
      admin: true,
    });

    expect(settings.localeFor(GUILD_ID, MEMBER_ID)).toBe('en');
    expect(settings.localeFor(GUILD_ID, OWNER_ID)).toBe('pt');
  });

  it('does not let an administrator who is not the owner change the default', async () => {
    const { run, settings } = testApp();

    const reply = await run({
      command: 'config',
      subcommand: 'language',
      options: { language: 'pt' },
      admin: true,
    });

    expect(reply).toContain('Only the server owner');
    expect(settings.defaultLocale(GUILD_ID)).toBe('en');
  });
});

describe('config channels', () => {
  const add = {
    command: 'config',
    group: 'channel',
    subcommand: 'add',
    options: { purpose: 'general', channel: CHANNEL },
  };

  it('rejects members who are not administrators', async () => {
    const { run, settings } = testApp();

    expect(await run(add)).toContain('Only administrators');
    expect(settings.channels(GUILD_ID, 'general')).toEqual([]);
  });

  it('adds a channel once and removes it', async () => {
    const { run, settings } = testApp();

    await run({ ...add, admin: true });
    await run({ ...add, admin: true });
    expect(settings.channels(GUILD_ID, 'general')).toEqual([CHANNEL]);
    expect(settings.channels(GUILD_ID, 'commands')).toEqual([]);

    await run({ ...add, subcommand: 'remove', admin: true });
    expect(settings.channels(GUILD_ID, 'general')).toEqual([]);
  });
});

describe('timezone', () => {
  it('stores the canonical name of a valid zone', async () => {
    const { run, settings } = testApp();

    await run({ command: 'timezone', options: { zone: ' europe/lisbon ' } });

    expect(settings.timeZoneFor(MEMBER_ID)).toBe('Europe/Lisbon');
  });

  it('keeps the default when the zone is unknown', async () => {
    const { run, settings } = testApp();

    const reply = await run({ command: 'timezone', options: { zone: 'Mars/Olympus' } });

    expect(reply).toContain('do not know');
    expect(settings.timeZoneFor(MEMBER_ID)).toBe('Europe/London');
  });

  it('does not lose the language when the zone is saved', async () => {
    const { run, settings } = testApp();
    await run({ command: 'language', options: { language: 'pt' } });

    await run({ command: 'timezone', options: { zone: 'Europe/Lisbon' } });

    expect(settings.localeFor(GUILD_ID, MEMBER_ID)).toBe('pt');
  });
});

describe('help', () => {
  it('lists every registered command', async () => {
    const { run, registry } = testApp();

    const reply = await run({ command: 'help' });

    for (const command of registry.commands) expect(reply).toContain(`\`/${command.name}\``);
  });
});

describe('server restriction', () => {
  it.each([
    ['another server', '999999999999999999'],
    ['a direct message', null],
  ])('refuses commands from %s', async (_label, guildId) => {
    const { run, settings } = testApp();

    const reply = await run({ command: 'language', options: { language: 'pt' }, guildId });

    expect(reply).toContain('home server');
    expect(settings.localeFor(GUILD_ID, MEMBER_ID)).toBe('en');
  });
});
