import { randomUUID } from 'node:crypto';
import { MessageFlags, type Interaction } from 'discord.js';
import { translator } from './i18n.js';
import type { Logger } from './logger.js';
import type { Registry } from './registry.js';
import type { Settings } from './settings.js';

export interface RouterDeps {
  guildId: string;
  registry: Registry;
  settings: Settings;
  logger: Logger;
}

export function createRouter({ guildId, registry, settings, logger }: RouterDeps) {
  return async function route(interaction: Interaction): Promise<void> {
    const isCommand = interaction.isChatInputCommand();
    if (!isCommand && !interaction.isAutocomplete()) return;

    const command = registry.find(interaction.commandName);
    const allowed = interaction.guildId === guildId && interaction.inGuild();

    try {
      if (!isCommand) {
        if (allowed) await command?.autocomplete?.(interaction);
        return;
      }
      if (!allowed) {
        await interaction.reply({
          content: translator('en')('error.wrongServer'),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      if (!command) {
        logger.warn({ command: interaction.commandName }, 'unknown command, re-run register');
        const locale = settings.localeFor(guildId, interaction.user.id);
        await interaction.reply({
          content: translator(locale)('error.unknownCommand'),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const locale = settings.localeFor(guildId, interaction.user.id);
      await command.execute({ interaction, guildId, locale, t: translator(locale) });
    } catch (error) {
      const id = randomUUID().slice(0, 8);
      logger.error({ err: error, id, command: interaction.commandName }, 'interaction failed');
      if (!interaction.isChatInputCommand()) return;

      const t = translator(settings.localeFor(guildId, interaction.user.id));
      const reply = { content: t('error.generic', { id }), flags: MessageFlags.Ephemeral } as const;
      try {
        if (interaction.replied || interaction.deferred) await interaction.followUp(reply);
        else await interaction.reply(reply);
      } catch (replyError) {
        logger.error({ err: replyError, id }, 'could not report the failure');
      }
    }
  };
}
