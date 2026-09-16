export type AdmissionAccount = {
  id: number;
  enabled: boolean;
  status: string;
  coldCap: number;
  coldSentToday: number;
  workingHours?: string | null;
  lastActivityAt?: Date | null;
};

export type AdmissionHealth = {
  status: string;
  lastErrorCode?: string | null;
  cooldownUntil?: Date | null;
};

export type AdmissionInput = {
  account: AdmissionAccount;
  health?: AdmissionHealth;
  now?: Date;
  minIntervalMinutes?: number;
  idempotencyKey: string;
  existingIdempotencyKeys?: Set<string>;
};

export type AdmissionResult = {
  action: "admit" | "hold" | "reject";
  reason: string;
  runAfter?: Date;
  idempotencyKey: string;
};

const challengeCodes = new Set(["captcha", "login_challenge", "rate_limit", "account_warning", "unexpected_state"]);

function parseTime(value: string): number | undefined {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;
  const hour = Number(match[1]); const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? hour * 60 + minute : undefined;
}

export function isWithinWorkingHours(workingHours: string | null | undefined, now: Date): boolean {
  if (!workingHours) return false;
  const match = workingHours.replace(/[–—]/g, "-").match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return false;
  const start = parseTime(match[1]); const end = parseTime(match[2]);
  if (start == null || end == null || start === end) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  return start < end ? current >= start && current < end : current >= start || current < end;
}

export function admitAutomatedColdSend(input: AdmissionInput): AdmissionResult {
  const { account, health, now = new Date(), idempotencyKey } = input;
  const result = (action: AdmissionResult["action"], reason: string, runAfter?: Date): AdmissionResult => ({ action, reason, runAfter, idempotencyKey });
  if (input.existingIdempotencyKeys?.has(idempotencyKey)) return result("reject", "An action with this idempotency key already exists.");
  if (!account.enabled) return result("reject", "Account is disabled.");
  if (["paused", "attention"].includes(account.status)) return result("hold", "Account is paused or requires operator attention.");
  if (!["healthy", "warming"].includes(account.status)) return result("hold", "Account is not in an automated sending state.");
  if (health && ["blocked", "cooldown"].includes(health.status)) return result("hold", "Account health is blocked or cooling down.", health.cooldownUntil ?? undefined);
  if (health?.lastErrorCode && challengeCodes.has(health.lastErrorCode.toLowerCase())) return result("hold", "Provider challenge or warning requires operator resolution.");
  if (account.coldSentToday >= account.coldCap) return result("hold", "Cold DM daily cap has been reached.");
  if (!isWithinWorkingHours(account.workingHours, now)) return result("hold", "Outside the account's automated working hours.");
  const minIntervalMs = (input.minIntervalMinutes ?? 8) * 60 * 1000;
  if (account.lastActivityAt) {
    const nextAllowed = new Date(account.lastActivityAt.getTime() + minIntervalMs);
    if (now.getTime() < nextAllowed.getTime()) return result("hold", "Minimum gap since the previous automated action has not elapsed.", nextAllowed);
  }
  return result("admit", "All automated cold-send admission checks passed.");
}
