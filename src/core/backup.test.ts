import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { backupDatabase } from './backup.js';
import { openDatabase, type Db } from './db.js';

let dir: string;
let db: Db;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'aigis-backup-'));
  db = openDatabase(join(dir, 'live.db'));
  db.exec("CREATE TABLE notes (body TEXT); INSERT INTO notes VALUES ('first')");
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

const backups = () => join(dir, 'backups');
const day = (n: number) => new Date(Date.UTC(2026, 0, n, 12));
const bodies = (path: string) => {
  const copy = openDatabase(path);
  const rows = copy.prepare('SELECT body FROM notes').pluck().all();
  copy.close();
  return rows;
};

describe('backupDatabase', () => {
  it('produces a database that opens with the data in it', async () => {
    const path = await backupDatabase(db, backups(), day(1));

    expect(bodies(path!)).toEqual(['first']);
  });

  it("does not overwrite the day's first backup", async () => {
    const path = await backupDatabase(db, backups(), day(1));
    db.exec('DELETE FROM notes');

    expect(await backupDatabase(db, backups(), day(1))).toBeUndefined();
    expect(bodies(path!)).toEqual(['first']);
  });

  it('keeps the 14 newest backups and leaves other files alone', async () => {
    await backupDatabase(db, backups(), day(1));
    writeFileSync(join(backups(), 'keep-me.db'), '');

    for (let n = 2; n <= 16; n++) await backupDatabase(db, backups(), day(n));

    const names = readdirSync(backups()).sort();
    expect(names).toHaveLength(15);
    expect(names[0]).toBe('aigis-2026-01-03.db');
    expect(names).toContain('keep-me.db');
  });

  it('leaves nothing behind when the backup fails', async () => {
    const closed = openDatabase(':memory:');
    closed.close();

    await expect(backupDatabase(closed, backups(), day(1))).rejects.toThrow();

    expect(readdirSync(backups())).toEqual([]);
  });
});
