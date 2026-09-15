import { createHash, randomBytes } from "node:crypto";

export const API_SCOPES = ["read", "write"] as const;
export type ApiScope = (typeof API_SCOPES)[number];

export function createApiKey() {
  const token = `fsty_live_${randomBytes(32).toString("base64url")}`;
  return {
    token,
    keyPrefix: token.slice(0, 18),
    keyHash: hashApiKey(token),
  };
}

export function hashApiKey(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readBearerToken(header: string | undefined) {
  if (!header?.startsWith("Bearer ")) return undefined;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 20 ? token : undefined;
}
