export type ProviderChallengeState = "healthy" | "challenge_required" | "paused";
export type ProviderChallengeKind = "captcha" | "login_challenge" | "rate_limit" | "account_warning" | "unexpected_state";

export type ProviderChallenge = {
  state: ProviderChallengeState;
  kind?: ProviderChallengeKind;
  message?: string;
  detectedAt?: string;
  resolvedAt?: string;
  resolution?: "operator_completed" | "provider_recovered" | "dismissed";
};

export type ChallengeAction =
  | { type: "provider_signal"; kind: ProviderChallengeKind; message: string; at: string }
  | { type: "operator_resolved"; at: string }
  | { type: "health_check_passed"; at: string }
  | { type: "pause"; at: string };

/**
 * Provider challenges are stop states. This state machine intentionally has no
 * solver, bypass, stealth, or retry path for the challenge itself.
 */
export function reduceProviderChallenge(current: ProviderChallenge, action: ChallengeAction): ProviderChallenge {
  if (action.type === "provider_signal") {
    return { state: "challenge_required", kind: action.kind, message: action.message, detectedAt: action.at };
  }
  if (action.type === "pause") {
    return { ...current, state: "paused" };
  }
  if (action.type === "operator_resolved") {
    if (current.state !== "challenge_required") return current;
    return { ...current, state: "paused", resolvedAt: action.at, resolution: "operator_completed" };
  }
  if (action.type === "health_check_passed") {
    if (current.state !== "paused" || !current.resolvedAt) return current;
    return { ...current, state: "healthy", resolvedAt: action.at, resolution: current.resolution ?? "provider_recovered" };
  }
  return current;
}

export function canResumeExternalWork(challenge: ProviderChallenge): boolean {
  return challenge.state === "healthy";
}
