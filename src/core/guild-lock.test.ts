import { describe, expect, it, vi } from 'vitest';
import { enforceGuildLock } from './guild-lock.js';
import { createLogger } from './logger.js';

const logger = createLogger('silent');

describe('enforceGuildLock', () => {
  it('leaves only servers that are not allowed', async () => {
    const home = { id: '1', leave: vi.fn(() => Promise.resolve()) };
    const other = { id: '2', leave: vi.fn(() => Promise.resolve()) };

    await enforceGuildLock(home, '1', logger);
    await enforceGuildLock(other, '1', logger);

    expect(home.leave).not.toHaveBeenCalled();
    expect(other.leave).toHaveBeenCalledOnce();
  });
});
