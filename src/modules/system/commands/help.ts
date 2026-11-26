import { MessageFlags } from 'discord.js';
import type { Command } from '../../../core/module.js';

export function helpCommand(listCommands: () => Command[]): Command {
  return {
    name: 'help',
    descriptionKey: 'help.description',
    async execute({ interaction, t }) {
      const lines = listCommands().map((command) => {
        const names = [command.name, ...(command.aliases ?? [])].map((n) => `\`/${n}\``);
        return `${names.join(' ')}: ${t(command.descriptionKey)}`;
      });
      await interaction.reply({
        content: [t('help.title'), ...lines].join('\n'),
        flags: MessageFlags.Ephemeral,
      });
    },
  };
}
