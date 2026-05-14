/**
 * Loads and validates process.env via Zod. Thrown errors exit startup so the API never runs half-configured.
 */
const { z } = require('zod');

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL: z.string().min(1).default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  CLIENT_ORIGIN: z.string().min(1).default('http://localhost:3000'),
  /** Set to true when the SPA and API use different site names (e.g. Vercel + Render). Requires HTTPS on the API. */
  REFRESH_COOKIE_CROSS_SITE: z.preprocess((v) => {
    if (v === undefined || v === '') return false;
    if (typeof v === 'boolean') return v;
    return ['1', 'true', 'yes'].includes(String(v).toLowerCase());
  }, z.boolean()),
  NODE_ENV: z.string().optional(),
});

function loadEnv() {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // Keep this readable; zod output is already structured.
    // eslint-disable-next-line no-console
    console.error('Invalid server environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid server environment');
  }
  return parsed.data;
}

module.exports = { loadEnv };

