import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { Db } from './db.js';
import type { Logger } from './logger.js';

const BACKUP_NAME = /^aigis-\d{4}-\d{2}-\d{2}\.db$/;
const KEEP = 14;
const CHECK_EVERY_MS = 60 * 60 * 1000;

/** Writes at most one backup per UTC day. Returns its path, or undefined if today's exists. */
export async function backupDatabase(db: Db, dir: string, now: Date): Promise<string | undefined> {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `aigis-${now.toISOString().slice(0, 10)}.db`);
  if (existsSync(target)) return undefined;

  // Write elsewhere first, so an interrupted backup is never mistaken for a good one.
  const partial = `${target}.partial`;
  try {
    await db.backup(partial);
    renameSync(partial, target);
  } finally {
    rmSync(partial, { force: true });
  }

  const backups = readdirSync(dir)
    .filter((name) => BACKUP_NAME.test(name))
    .sort();
  for (const name of backups.slice(0, -KEEP)) rmSync(join(dir, name));

  return target;
}

/**
 * Checks hourly instead of at a fixed time, because the host PC may be off or asleep then.
 * Returns a function that stops the checks.
 */
export function scheduleBackups(db: Db, dir: string, logger: Logger): () => void {
  const run = async () => {
    try {
      if (await backupDatabase(db, dir, new Date())) logger.info('database backed up');
    } catch (error) {
      logger.error({ err: error }, 'database backup failed');
    }
  };
  void run();
  const timer = setInterval(() => void run(), CHECK_EVERY_MS);
  return () => clearInterval(timer);
}
