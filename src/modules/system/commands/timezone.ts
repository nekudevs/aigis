import { MessageFlags } from 'discord.js';
import { translator } from '../../../core/i18n.js';
import type { Command } from '../../../core/module.js';
import type { Settings } from '../../../core/settings.js';
import { findTimeZone, suggestTimeZones } from '../service.js';

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
          .setAutocomplete(true),
      ),
    async autocomplete(interaction) {
      const zones = suggestTimeZones(interaction.options.getFocused());
      await interaction.respond(zones.map((zone) => ({ name: zone, value: zone })));
    },
    async execute({ interaction, t }) {
      // Autocomplete is only a suggestion: Discord still accepts free text.
      const zone = findTimeZone(interaction.options.getString('zone', true));
      if (zone) settings.setUserTimeZone(interaction.user.id, zone);
      await interaction.reply({
        content: zone ? t('timezone.saved', { zone }) : t('timezone.invalid'),
        flags: MessageFlags.Ephemeral,
      });
    },
  };
}
