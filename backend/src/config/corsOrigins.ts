/** localhost and 127.0.0.1 are different browser origins — allow both in dev. */
export function getCorsOriginOption(): string | string[] {
  const primary = process.env.FRONTEND_URL || "http://localhost:5173";
  return [primary, "http://localhost:5173", "http://127.0.0.1:5173"];
}
