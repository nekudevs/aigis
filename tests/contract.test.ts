import { describe, expect, it } from 'vitest';
import { catalogs, type MessageKey } from '../src/core/i18n.js';
import { testApp } from './helpers.js';

const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();

describe('every module', () => {
  it('produces command definitions that Discord accepts', () => {
    // The builders throw on invalid names, lengths and option order.
    const commands = testApp().registry.toJSON();

    expect(commands.length).toBeGreaterThan(0);
    for (const command of commands) expect(command.name).toMatch(/^[a-z0-9-]{1,32}$/);
  });

  it('has matching placeholders in every language', () => {
    for (const [key, english] of Object.entries(catalogs.en)) {
      const portuguese = catalogs.pt[key as MessageKey];
      expect(portuguese, key).toBeTruthy();
      expect(placeholders(portuguese), key).toEqual(placeholders(english));
    }
  });
});
