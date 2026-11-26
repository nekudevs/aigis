import { MessageFlags } from 'discord.js';
import type { Command } from '../../../core/module.js';

export function pingCommand(): Command {
  return {
    name: 'ping',
    descriptionKey: 'ping.description',
    async execute({ interaction, t }) {
      const ms = Math.max(0, Date.now() - interaction.createdTimestamp);
      await interaction.reply({ content: t('ping.reply', { ms }), flags: MessageFlags.Ephemeral });
    },
  };
}
