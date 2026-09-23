import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { db, schema } from "@nuxthub/db";

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// `BETTER_AUTH_URL` may be unset or hold a placeholder string in some
// environments. Better Auth throws at init if `baseURL` is not a parseable
// URL, so resolve a valid value here and overwrite the env var to keep any
// internal env reads consistent.
function resolveBaseUrl(): string {
  const configured = process.env.BETTER_AUTH_URL?.trim();
  if (isValidHttpUrl(configured)) return configured;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  const resolved = vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
  process.env.BETTER_AUTH_URL = resolved;
  return resolved;
}

const productionUrl = resolveBaseUrl();

export const auth = betterAuth({
  baseURL: productionUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [productionUrl],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
});
