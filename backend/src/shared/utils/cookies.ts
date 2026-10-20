import crypto from "crypto";
import { Request, Response } from "express";

export const GUEST_PREVIEW_COOKIE = "kl_guest_preview";

export function parseCookieHeader(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) {
    return out;
  }
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }
    const key = part.slice(0, index).trim();
    const value = decodeURIComponent(part.slice(index + 1).trim());
    if (key) {
      out[key] = value;
    }
  }
  return out;
}

function signingSecret(): string {
  return process.env.JWT_SECRET?.trim() || "kindloop-guest";
}

export function signGuestPreview(donationId: string): string {
  const sig = crypto
    .createHmac("sha256", signingSecret())
    .update(donationId)
    .digest("hex")
    .slice(0, 24);
  return `${donationId}.${sig}`;
}

export function readGuestPreviewId(req: Request): string | null {
  const raw = parseCookieHeader(req.headers.cookie)[GUEST_PREVIEW_COOKIE];
  if (!raw) {
    return null;
  }
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) {
    return null;
  }
  const donationId = raw.slice(0, dot);
  const expected = signGuestPreview(donationId);
  if (expected !== raw) {
    return null;
  }
  return donationId;
}

export function setGuestPreviewCookie(res: Response, donationId: string): void {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(GUEST_PREVIEW_COOKIE, signGuestPreview(donationId), {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
}
