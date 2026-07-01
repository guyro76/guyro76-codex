import { createNeonAuth } from "@neondatabase/auth/next/server";

const configured = Boolean(
  process.env.NEON_AUTH_BASE_URL &&
  process.env.NEON_AUTH_COOKIE_SECRET &&
  process.env.NEON_AUTH_COOKIE_SECRET.length >= 32
);

export const neonAuthConfigured = configured;

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL || "https://invalid.local/auth",
  cookies: {
    secret: process.env.NEON_AUTH_COOKIE_SECRET || "0".repeat(32),
  },
});
