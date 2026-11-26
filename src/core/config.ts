import { z } from 'zod';

const snowflake = z.string().regex(/^\d{17,20}$/, 'must be a Discord ID');

const schema = z.object({
  DISCORD_TOKEN: z.string().min(1, 'is required'),
  DISCORD_APP_ID: snowflake,
  DISCORD_GUILD_ID: snowflake,
  DATABASE_PATH: z.string().min(1).default('./data/aigis.db'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent']).default('info'),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: Record<string, string | undefined>): Config {
  const result = schema.safeParse(env);
  if (!result.success) {
    // Names and reasons only: the values may be secrets.
    const problems = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new Error(`Invalid configuration. ${problems.join('; ')}`);
  }
  return result.data;
}
