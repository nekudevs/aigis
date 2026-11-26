import type { Interaction } from 'discord.js';
import { vi } from 'vitest';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/core/db.js';
import { createLogger } from '../src/core/logger.js';
import { createRouter } from '../src/core/router.js';

export const GUILD_ID = '111111111111111111';
export const OWNER_ID = '222222222222222222';
export const MEMBER_ID = '333333333333333333';

interface FakeInput {
  command: string;
  options?: Record<string, string>;
  subcommand?: string;
  group?: string;
  userId?: string;
  guildId?: string | null;
  admin?: boolean;
}

/** Only the parts of an interaction that the router and commands read. */
export function fakeCommand(input: FakeInput) {
  const options = input.options ?? {};
  const guildId = input.guildId === undefined ? GUILD_ID : input.guildId;
  const fake = {
    commandName: input.command,
    guildId,
    guild: { ownerId: OWNER_ID },
    user: { id: input.userId ?? MEMBER_ID },
    memberPermissions: { has: () => input.admin ?? false },
    createdTimestamp: Date.now(),
    replied: false,
    deferred: false,
    isChatInputCommand: () => true,
    isAutocomplete: () => false,
    inGuild: () => guildId !== null,
    options: {
      getString: (name: string) => options[name],
      getChannel: (name: string) => ({ id: options[name] }),
      getSubcommand: () => input.subcommand,
      getSubcommandGroup: () => input.group ?? null,
    },
    reply: vi.fn<(message: { content: string }) => Promise<void>>(() => {
      fake.replied = true;
      return Promise.resolve();
    }),
    followUp: vi.fn<(message: { content: string }) => Promise<void>>(() => Promise.resolve()),
  };
  return fake;
}

export function testApp() {
  const app = createApp(openDatabase(':memory:'));
  const route = createRouter({ ...app, guildId: GUILD_ID, logger: createLogger('silent') });

  async function run(input: FakeInput): Promise<string | undefined> {
    const interaction = fakeCommand(input);
    await route(interaction as unknown as Interaction);
    return interaction.reply.mock.calls[0]?.[0].content;
  }

  return { ...app, run };
}
