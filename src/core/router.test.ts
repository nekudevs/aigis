import type { Interaction } from 'discord.js';
import { describe, expect, it } from 'vitest';
import { fakeCommand, GUILD_ID } from '../../tests/helpers.js';
import { migrate, openDatabase } from './db.js';
import { createLogger } from './logger.js';
import type { Command } from './module.js';
import { createRegistry } from './registry.js';
import { createRouter } from './router.js';
import { coreMigrations, createSettings } from './settings.js';

function routerFor(execute: Command['execute']) {
  const db = openDatabase(':memory:');
  migrate(db, coreMigrations);
  const registry = createRegistry([
    { name: 'test', commands: [{ name: 'boom', descriptionKey: 'ping.description', execute }] },
  ]);
  return createRouter({
    guildId: GUILD_ID,
    registry,
    settings: createSettings(db),
    logger: createLogger('silent'),
  });
}

describe('router failures', () => {
  it('answers a command that is registered with Discord but no longer exists', async () => {
    const route = routerFor(() => Promise.resolve());
    const interaction = fakeCommand({ command: 'removed' });

    await route(interaction as unknown as Interaction);

    expect(interaction.reply.mock.calls[0]?.[0].content).toContain('no longer available');
  });

  it('replies with a reference and no error detail', async () => {
    const route = routerFor(() => Promise.reject(new Error('secret detail')));
    const interaction = fakeCommand({ command: 'boom' });

    await route(interaction as unknown as Interaction);

    const content = interaction.reply.mock.calls[0]?.[0].content;
    expect(content).toMatch(/Reference: [0-9a-f]{8}$/);
    expect(content).not.toContain('secret detail');
  });

  it('follows up when the command had already replied', async () => {
    const route = routerFor(async ({ interaction }) => {
      await interaction.reply({ content: 'working' });
      throw new Error('later failure');
    });
    const interaction = fakeCommand({ command: 'boom' });

    await route(interaction as unknown as Interaction);

    expect(interaction.reply).toHaveBeenCalledTimes(1);
    expect(interaction.followUp).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the error reply also fails', async () => {
    const route = routerFor(() => Promise.reject(new Error('first')));
    const interaction = fakeCommand({ command: 'boom' });
    interaction.reply.mockRejectedValue(new Error('interaction expired'));

    await expect(route(interaction as unknown as Interaction)).resolves.toBeUndefined();
  });
});
