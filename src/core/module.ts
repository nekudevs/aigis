import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import type { Migration } from './db.js';
import type { Locale, MessageKey, Translate } from './i18n.js';

export interface CommandContext {
  interaction: ChatInputCommandInteraction<'cached' | 'raw'>;
  guildId: string;
  locale: Locale;
  t: Translate;
}

export interface Command {
  name: string;
  aliases?: string[];
  descriptionKey: MessageKey;
  /** Adds options and permissions. Name and description are set by the registry. */
  build?: (builder: SlashCommandBuilder) => void;
  execute: (context: CommandContext) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

export interface BotModule {
  name: string;
  commands: Command[];
  migrations?: Migration[];
}
