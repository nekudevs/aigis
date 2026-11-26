import {
  ChannelType,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  type SlashCommandSubcommandBuilder,
} from 'discord.js';
import { isLocale, translator } from '../../../core/i18n.js';
import type { Command, CommandContext } from '../../../core/module.js';
import { CHANNEL_PURPOSES, type ChannelPurpose, type Settings } from '../../../core/settings.js';
import { languageOption } from './language.js';

const en = translator('en');

function channelOptions(subcommand: SlashCommandSubcommandBuilder) {
  return subcommand
    .addStringOption((option) =>
      option
        .setName('purpose')
        .setDescription(en('config.channel.purpose'))
        .setRequired(true)
        .addChoices(...CHANNEL_PURPOSES.map((p) => ({ name: p, value: p }))),
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription(en('config.channel.channel'))
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText),
    );
}

function isPurpose(value: string): value is ChannelPurpose {
  return (CHANNEL_PURPOSES as readonly string[]).includes(value);
}

export function configCommand(settings: Settings): Command {
  function run({ interaction, guildId, t }: CommandContext): string {
    // Server owners can override default command permissions, so check again here.
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return t('config.adminOnly');
    }

    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    if (group === 'channel') {
      const purpose = interaction.options.getString('purpose', true);
      if (!isPurpose(purpose)) throw new Error('Unknown channel purpose');
      const { id } = interaction.options.getChannel('channel', true);
      const params = { channel: `<#${id}>`, purpose };
      if (subcommand === 'add') {
        settings.addChannel(guildId, purpose, id);
        return t('config.channel.added', params);
      }
      settings.removeChannel(guildId, purpose, id);
      return t('config.channel.removed', params);
    }

    if (subcommand === 'language') {
      const ownerId = interaction.guild?.ownerId;
      if (interaction.user.id !== ownerId) return t('config.language.ownerOnly');
      const locale = interaction.options.getString('language', true);
      if (!isLocale(locale)) throw new Error('Unsupported language');
      settings.setDefaultLocale(guildId, locale);
      return translator(locale)('config.language.saved');
    }

    const list = (purpose: ChannelPurpose) =>
      settings
        .channels(guildId, purpose)
        .map((id) => `<#${id}>`)
        .join(' ') || t('config.none');
    return t('config.show.reply', {
      language: settings.defaultLocale(guildId),
      general: list('general'),
      commands: list('commands'),
    });
  }

  return {
    name: 'config',
    descriptionKey: 'config.description',
    build: (builder) =>
      void builder
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((sub) =>
          sub
            .setName('language')
            .setDescription(en('config.language.description'))
            .addStringOption(languageOption),
        )
        .addSubcommand((sub) => sub.setName('show').setDescription(en('config.show.description')))
        .addSubcommandGroup((group) =>
          group
            .setName('channel')
            .setDescription(en('config.channel.description'))
            .addSubcommand((sub) =>
              channelOptions(sub.setName('add').setDescription(en('config.channel.add'))),
            )
            .addSubcommand((sub) =>
              channelOptions(sub.setName('remove').setDescription(en('config.channel.remove'))),
            ),
        ),
    async execute(context) {
      const content = run(context);
      await context.interaction.reply({ content, flags: MessageFlags.Ephemeral });
    },
  };
}
