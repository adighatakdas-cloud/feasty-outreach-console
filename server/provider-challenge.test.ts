import { describe, expect, it } from "vitest";
import { canResumeExternalWork, reduceProviderChallenge, type ProviderChallenge } from "./provider-challenge";

describe("provider challenge handling", () => {
  it("stops external work when a CAPTCHA is reported", () => {
    const initial: ProviderChallenge = { state: "healthy" };
    const stopped = reduceProviderChallenge(initial, { type: "provider_signal", kind: "captcha", message: "Provider requires operator verification.", at: "2026-09-16T12:00:00.000Z" });
    expect(stopped).toMatchObject({ state: "challenge_required", kind: "captcha" });
    expect(canResumeExternalWork(stopped)).toBe(false);
  });

  it("requires operator resolution and a later health check before resume", () => {
    const challenge: ProviderChallenge = { state: "challenge_required", kind: "login_challenge", detectedAt: "2026-09-16T12:00:00.000Z" };
    const resolved = reduceProviderChallenge(challenge, { type: "operator_resolved", at: "2026-09-16T12:05:00.000Z" });
    expect(resolved.state).toBe("paused");
    expect(canResumeExternalWork(resolved)).toBe(false);
    const healthy = reduceProviderChallenge(resolved, { type: "health_check_passed", at: "2026-09-16T12:06:00.000Z" });
    expect(healthy.state).toBe("healthy");
    expect(canResumeExternalWork(healthy)).toBe(true);
  });

  it("does not allow a health check to bypass an unresolved challenge", () => {
    const challenge: ProviderChallenge = { state: "challenge_required", kind: "rate_limit" };
    const unchanged = reduceProviderChallenge(challenge, { type: "health_check_passed", at: "2026-09-16T12:06:00.000Z" });
    expect(unchanged.state).toBe("challenge_required");
  });
});
