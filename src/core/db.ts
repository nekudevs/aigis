import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';

export type Db = Database.Database;

export interface Migration {
  id: string;
  sql: string;
}

export function openDatabase(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function migrate(db: Db, migrations: Migration[]): void {
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY) STRICT');
  const applied = db.prepare('SELECT 1 FROM schema_migrations WHERE id = ?');
  const record = db.prepare('INSERT INTO schema_migrations (id) VALUES (?)');

  db.transaction(() => {
    for (const migration of migrations) {
      if (applied.get(migration.id)) continue;
      db.exec(migration.sql);
      record.run(migration.id);
    }
  })();
}
