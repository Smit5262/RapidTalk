import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AccessTokenPayload } from "../types/auth.types";

export function signAccessToken(payload: AccessTokenPayload): string {
  const ttl = env.JWT_ACCESS_TTL;
  const seconds = ttl.endsWith("m")
    ? parseInt(ttl) * 60
    : ttl.endsWith("h")
      ? parseInt(ttl) * 3600
      : parseInt(ttl);

  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: seconds });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

// Refresh tokens are random opaque strings stored (hashed) in the Session table,
// NOT JWTs — this lets us revoke them individually. See auth.service.ts.
export function getRefreshTokenExpiry(): Date {
  const days = env.JWT_REFRESH_TTL_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}