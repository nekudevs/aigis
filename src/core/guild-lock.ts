import type { Logger } from './logger.js';

interface LeavableGuild {
  id: string;
  leave: () => Promise<unknown>;
}

export async function enforceGuildLock(
  guild: LeavableGuild,
  allowedGuildId: string,
  logger: Logger,
): Promise<void> {
  if (guild.id === allowedGuildId) return;
  try {
    await guild.leave();
    logger.warn('left a server that is not allow-listed');
  } catch (error) {
    logger.error({ err: error }, 'failed to leave a server that is not allow-listed');
  }
}
