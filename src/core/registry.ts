import { SlashCommandBuilder } from 'discord.js';
import { translator } from './i18n.js';
import type { BotModule, Command } from './module.js';

const MAX_GUILD_COMMANDS = 100;

export function createRegistry(modules: BotModule[]) {
  const byName = new Map<string, Command>();
  const commands = modules.flatMap((m) => m.commands);

  for (const command of commands) {
    for (const name of [command.name, ...(command.aliases ?? [])]) {
      if (byName.has(name)) throw new Error(`Duplicate command name: ${name}`);
      byName.set(name, command);
    }
  }
  if (byName.size > MAX_GUILD_COMMANDS) {
    throw new Error(`Discord allows ${MAX_GUILD_COMMANDS} commands, got ${byName.size}`);
  }

  return {
    commands,
    migrations: modules.flatMap((m) => m.migrations ?? []),

    find(name: string): Command | undefined {
      return byName.get(name);
    },

    toJSON() {
      const t = translator('en');
      return [...byName].map(([name, command]) => {
        const builder = new SlashCommandBuilder()
          .setName(name)
          .setDescription(t(command.descriptionKey));
        command.build?.(builder);
        return builder.toJSON();
      });
    },
  };
}

export type Registry = ReturnType<typeof createRegistry>;
