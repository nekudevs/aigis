import { REST, Routes } from 'discord.js';
import { createApp } from './app.js';
import { loadConfig } from './core/config.js';
import { openDatabase } from './core/db.js';
import { createLogger } from './core/logger.js';

const config = loadConfig(process.env);
const logger = createLogger(config.LOG_LEVEL);
// Command definitions do not depend on stored data, so leave the real database alone.
const { registry } = createApp(openDatabase(':memory:'));
const body = registry.toJSON();

await new REST()
  .setToken(config.DISCORD_TOKEN)
  .put(Routes.applicationGuildCommands(config.DISCORD_APP_ID, config.DISCORD_GUILD_ID), { body });

logger.info({ count: body.length }, 'commands registered');
