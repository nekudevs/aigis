import type { BotModule, Command } from '../../core/module.js';
import type { Settings } from '../../core/settings.js';
import { configCommand } from './commands/config.js';
import { helpCommand } from './commands/help.js';
import { languageCommand } from './commands/language.js';
import { pingCommand } from './commands/ping.js';
import { timezoneCommand } from './commands/timezone.js';

export interface SystemDeps {
  settings: Settings;
  /** Every enabled command, read lazily because the registry is built after the modules. */
  listCommands: () => Command[];
}

export function createSystemModule({ settings, listCommands }: SystemDeps): BotModule {
  return {
    name: 'system',
    commands: [
      pingCommand(),
      helpCommand(listCommands),
      languageCommand(settings),
      timezoneCommand(settings),
      configCommand(settings),
    ],
  };
}
