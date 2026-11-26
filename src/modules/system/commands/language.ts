import { MessageFlags, type SlashCommandStringOption } from 'discord.js';
import { isLocale, translator } from '../../../core/i18n.js';
import type { Command } from '../../../core/module.js';
import type { Settings } from '../../../core/settings.js';

export function languageOption(option: SlashCommandStringOption): SlashCommandStringOption {
  return option
    .setName('language')
    .setDescription(translator('en')('language.option'))
    .setRequired(true)
    .addChoices({ name: 'English', value: 'en' }, { name: 'Português', value: 'pt' });
}

export function languageCommand(settings: Settings): Command {
  return {
    name: 'language',
    descriptionKey: 'language.description',
    build: (builder) => void builder.addStringOption(languageOption),
    async execute({ interaction }) {
      const locale = interaction.options.getString('language', true);
      if (!isLocale(locale)) throw new Error('Unsupported language');
      settings.setUserLocale(interaction.user.id, locale);
      await interaction.reply({
        content: translator(locale)('language.saved'),
        flags: MessageFlags.Ephemeral,
      });
    },
  };
}
