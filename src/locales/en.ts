export const en = {
  'error.generic': 'Something went wrong. Reference: {id}',
  'error.wrongServer': 'I only work in my home server.',

  'ping.description': 'Check that Aigis is awake',
  'ping.reply': 'Pong. All systems operational ({ms} ms).',

  'help.description': 'List what Aigis can do',
  'help.title': 'Available commands:',

  'language.description': 'Choose the language Aigis uses with you',
  'language.option': 'Language',
  'language.saved': 'I will reply to you in English.',

  'timezone.description': 'Set your time zone',
  'timezone.option': 'Your time zone',
  'timezone.saved': 'Your time zone is now {zone}.',
  'timezone.invalid': 'I do not know that time zone.',

  'config.description': 'Configure Aigis for this server',
  'config.language.description': 'Set the server default language (owner only)',
  'config.language.saved': 'The server default language is now English.',
  'config.language.ownerOnly': 'Only the server owner can change the default language.',
  'config.channel.description': 'Choose which channels Aigis uses',
  'config.channel.add': 'Add a channel',
  'config.channel.remove': 'Remove a channel',
  'config.channel.purpose': 'What the channel is for',
  'config.channel.channel': 'Channel',
  'config.channel.added': '{channel} added to the {purpose} channels.',
  'config.channel.removed': '{channel} removed from the {purpose} channels.',
  'config.show.description': 'Show the current configuration',
  'config.show.reply': 'Default language: {language}\nGeneral: {general}\nCommands: {commands}',
  'config.none': 'none',
  'config.adminOnly': 'Only administrators can do that.',
};

export type MessageKey = keyof typeof en;
