import { Client, Events, GatewayIntentBits } from 'discord.js';
import { createApp } from './app.js';
import { loadConfig } from './core/config.js';
import { openDatabase } from './core/db.js';
import { enforceGuildLock } from './core/guild-lock.js';
import { createLogger } from './core/logger.js';
import { createRouter } from './core/router.js';

const config = loadConfig(process.env);
const logger = createLogger(config.LOG_LEVEL);
const db = openDatabase(config.DATABASE_PATH);
const { registry, settings } = createApp(db);
const route = createRouter({ guildId: config.DISCORD_GUILD_ID, registry, settings, logger });

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  allowedMentions: { parse: [], repliedUser: false },
});

client.once(Events.ClientReady, (ready) => {
  logger.info('ready');
  for (const guild of ready.guilds.cache.values()) {
    void enforceGuildLock(guild, config.DISCORD_GUILD_ID, logger);
  }
});
client.on(Events.GuildCreate, (guild) => {
  void enforceGuildLock(guild, config.DISCORD_GUILD_ID, logger);
});
client.on(Events.InteractionCreate, (interaction) => {
  void route(interaction);
});
client.on(Events.Error, (error) => logger.error({ err: error }, 'client error'));

async function shutdown(): Promise<void> {
  logger.info('shutting down');
  await client.destroy();
  db.close();
  process.exit(0);
}
process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());

await client.login(config.DISCORD_TOKEN);
