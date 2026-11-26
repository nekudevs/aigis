import { MessageFlags } from 'discord.js';
import { translator } from '../../../core/i18n.js';
import type { Command } from '../../../core/module.js';
import type { Settings } from '../../../core/settings.js';
import { findTimeZone, TIME_ZONES } from '../service.js';

export function timezoneCommand(settings: Settings): Command {
  return {
    name: 'timezone',
    descriptionKey: 'timezone.description',
    build: (builder) =>
      void builder.addStringOption((option) =>
        option
          .setName('zone')
          .setDescription(translator('en')('timezone.option'))
          .setRequired(true)
          .addChoices(...TIME_ZONES.map(({ zone, label }) => ({ name: label, value: zone }))),
      ),
    async execute({ interaction, t }) {
      // A client with stale command definitions can still send a value that is not listed.
      const match = findTimeZone(interaction.options.getString('zone', true));
      if (match) settings.setUserTimeZone(interaction.user.id, match.zone);
      await interaction.reply({
        content: match ? t('timezone.saved', { zone: match.label }) : t('timezone.invalid'),
        flags: MessageFlags.Ephemeral,
      });
    },
  };
}
