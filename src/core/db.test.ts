import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate, openDatabase, type Migration } from './db.js';

const first: Migration = { id: 'a/001', sql: 'CREATE TABLE notes (body TEXT)' };
const second: Migration = { id: 'a/002', sql: 'ALTER TABLE notes ADD COLUMN author TEXT' };

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'aigis-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('migrate', () => {
  it('upgrades an existing database and keeps its data', () => {
    const path = join(dir, 'nested', 'test.db');
    const old = openDatabase(path);
    migrate(old, [first]);
    old.prepare('INSERT INTO notes (body) VALUES (?)').run('kept');
    old.close();

    const db = openDatabase(path);
    migrate(db, [first, second]);

    expect(db.prepare('SELECT body, author FROM notes').all()).toEqual([
      { body: 'kept', author: null },
    ]);
    db.close();
  });

  it('applies nothing when one migration fails', () => {
    const db = openDatabase(':memory:');

    expect(() => migrate(db, [first, { id: 'a/002', sql: 'NOT SQL' }])).toThrow();

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE name = 'notes'").all();
    expect(tables).toEqual([]);
    expect(db.prepare('SELECT id FROM schema_migrations').all()).toEqual([]);
  });
});
