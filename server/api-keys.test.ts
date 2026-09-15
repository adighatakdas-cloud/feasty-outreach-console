import { describe, expect, it } from "vitest";
import { API_SCOPES, createApiKey, hashApiKey, readBearerToken } from "./api-keys";

describe("external API keys", () => {
  it("creates prefixed, one-way-hashable tokens", () => {
    const first = createApiKey();
    const second = createApiKey();
    expect(first.token.startsWith("fsty_live_")).toBe(true);
    expect(first.keyPrefix).toBe(first.token.slice(0, 18));
    expect(first.keyHash).toBe(hashApiKey(first.token));
    expect(first.keyHash).not.toBe(first.token);
    expect(second.token).not.toBe(first.token);
  });

  it("only accepts bearer tokens with a meaningful length", () => {
    expect(readBearerToken("Basic abc")).toBeUndefined();
    expect(readBearerToken("Bearer short")).toBeUndefined();
    expect(readBearerToken("Bearer fsty_live_12345678901234567890")).toContain("fsty_live_");
    expect(API_SCOPES).toEqual(["read", "write"]);
  });
});
