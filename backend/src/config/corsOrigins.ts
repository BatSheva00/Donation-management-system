/** localhost and 127.0.0.1 are different browser origins — allow both in dev. */
export function getCorsOriginOption(): string | string[] {
  const primary = process.env.FRONTEND_URL || "http://localhost:5173";
  const extra = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins = new Set([
    primary,
    ...extra,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ]);

  return [...origins];
}
