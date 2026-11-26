import { migrate, type Db } from './core/db.js';
import type { BotModule } from './core/module.js';
import { createRegistry, type Registry } from './core/registry.js';
import { coreMigrations, createSettings } from './core/settings.js';
import { createSystemModule } from './modules/system/index.js';

/** The one place modules are listed. */
export function createApp(db: Db) {
  const settings = createSettings(db);
  const modules: BotModule[] = [
    createSystemModule({ settings, listCommands: () => registry.commands }),
  ];
  const registry: Registry = createRegistry(modules);
  migrate(db, [...coreMigrations, ...registry.migrations]);
  return { registry, settings };
}
