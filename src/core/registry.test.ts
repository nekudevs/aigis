import { describe, expect, it } from 'vitest';
import type { Command } from './module.js';
import { createRegistry } from './registry.js';

const command = (name: string, aliases?: string[]): Command => ({
  name,
  aliases,
  descriptionKey: 'ping.description',
  execute: () => Promise.resolve(),
});

const registryOf = (...commands: Command[]) => createRegistry([{ name: 'test', commands }]);

describe('createRegistry', () => {
  it('registers each alias as its own command with the same handler', () => {
    const daily = command('daily-affirmation', ['da']);
    const registry = registryOf(daily);

    expect(registry.find('da')).toBe(daily);
    expect(registry.toJSON().map((c) => c.name)).toEqual(['daily-affirmation', 'da']);
    expect(registry.commands).toEqual([daily]);
  });

  it('rejects an alias that collides with another command', () => {
    expect(() => registryOf(command('et'), command('end-translation', ['et']))).toThrow(
      'Duplicate command name: et',
    );
  });

  it("rejects more commands than Discord's limit", () => {
    const many = Array.from({ length: 101 }, (_, i) => command(`c${i}`));

    expect(() => registryOf(...many)).toThrow('101');
  });
});
