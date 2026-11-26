import { describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';

const valid = {
  DISCORD_TOKEN: 'test-token',
  DISCORD_APP_ID: '111111111111111111',
  DISCORD_GUILD_ID: '222222222222222222',
};

describe('loadConfig', () => {
  it('names the missing setting', () => {
    expect(() => loadConfig({ ...valid, DISCORD_TOKEN: undefined })).toThrow('DISCORD_TOKEN');
  });

  it('never puts a rejected value in the error', () => {
    // A token pasted into the wrong variable must not reach the logs.
    const load = () => loadConfig({ ...valid, DISCORD_GUILD_ID: 'pasted-secret' });

    expect(load).toThrow('DISCORD_GUILD_ID');
    expect(load).not.toThrow('pasted-secret');
  });
});
