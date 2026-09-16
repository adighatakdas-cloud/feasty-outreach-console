import { evaluateQualification, type QualificationInput, type QualificationResult } from "./qualification";

export type RawLeadImport = {
  username?: unknown;
  displayName?: unknown;
  bio?: unknown;
  source?: unknown;
  sourceRef?: unknown;
  consentBasis?: unknown;
  followers?: unknown;
  verified?: unknown;
  lastPostAt?: unknown;
  accountJoinedAt?: unknown;
};

export type NormalizedLead = {
  username: string;
  displayName?: string;
  bio?: string;
  source: string;
  sourceRef?: string;
  consentBasis: string;
  followers?: number;
  verified?: boolean;
  lastPostAt?: Date;
  accountJoinedAt?: Date;
  scrapedAt: Date;
  qualificationStatus: { consentBasis: string; sourceRef?: string; checks: QualificationResult["checks"]; extractedAt: string };
  qualificationVerdict: QualificationResult["verdict"];
};

export type ImportResult =
  | { outcome: "created"; lead: NormalizedLead }
  | { outcome: "updated"; lead: NormalizedLead }
  | { outcome: "duplicate"; username: string; reason: string }
  | { outcome: "blocked"; username: string; reason: string }
  | { outcome: "invalid"; username?: string; reason: string };

function text(value: unknown, max: number): string | undefined {
  if (value == null || String(value).trim() === "") return undefined;
  return String(value).trim().slice(0, max);
}

function date(value: unknown): Date | undefined {
  if (value == null || value === "") return undefined;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function number(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function bool(value: unknown): boolean | undefined {
  if (value == null || value === "") return undefined;
  if (value === true || value === "true" || value === 1 || value === "1") return true;
  if (value === false || value === "false" || value === 0 || value === "0") return false;
  return undefined;
}

export function normalizeUsername(value: unknown): string | undefined {
  const raw = text(value, 120)?.replace(/^@+/, "").toLowerCase();
  return raw && /^[a-z0-9._-]{2,120}$/.test(raw) ? `@${raw}` : undefined;
}

export function normalizeLead(raw: RawLeadImport, now = new Date(), rules: QualificationInput = {}): NormalizedLead | ImportResult {
  const username = normalizeUsername(raw.username);
  if (!username) return { outcome: "invalid", reason: "Username is required and must contain only letters, numbers, dots, underscores, or hyphens." };
  const source = text(raw.source, 80);
  const consentBasis = text(raw.consentBasis, 160);
  if (!source) return { outcome: "invalid", username, reason: "Source is required." };
  if (!consentBasis) return { outcome: "invalid", username, reason: "Consent basis is required." };
  const lead: QualificationInput = { followers: number(raw.followers), verified: bool(raw.verified), bio: text(raw.bio, 5000), lastPostAt: date(raw.lastPostAt), accountJoinedAt: date(raw.accountJoinedAt), ...rules, now };
  const qualification = evaluateQualification(lead);
  return {
    username,
    displayName: text(raw.displayName, 160),
    bio: text(raw.bio, 5000),
    source,
    sourceRef: text(raw.sourceRef, 240),
    consentBasis,
    followers: number(raw.followers),
    verified: bool(raw.verified),
    lastPostAt: date(raw.lastPostAt),
    accountJoinedAt: date(raw.accountJoinedAt),
    scrapedAt: now,
    qualificationStatus: { consentBasis, sourceRef: text(raw.sourceRef, 240), checks: qualification.checks, extractedAt: now.toISOString() },
    qualificationVerdict: qualification.verdict,
  };
}

export function classifyImportRows(rows: RawLeadImport[], existingUsernames: Set<string>, doNotContactUsernames: Set<string>, now = new Date()): ImportResult[] {
  const seen = new Set<string>();
  return rows.map((raw) => {
    const normalized = normalizeLead(raw, now);
    if ("outcome" in normalized) return normalized;
    if (doNotContactUsernames.has(normalized.username)) return { outcome: "blocked", username: normalized.username, reason: "Username is on the do-not-contact list." };
    if (seen.has(normalized.username)) return { outcome: "duplicate", username: normalized.username, reason: "Duplicate username in this import." };
    seen.add(normalized.username);
    if (existingUsernames.has(normalized.username)) return { outcome: "duplicate", username: normalized.username, reason: "Lead already exists in the registry." };
    return { outcome: "created", lead: normalized };
  });
}
