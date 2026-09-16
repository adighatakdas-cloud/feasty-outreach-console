export type QualificationOutcome = "passed" | "failed" | "unknown";

export type QualificationInput = {
  accountJoinedAt?: Date | null;
  followers?: number | null;
  bio?: string | null;
  verified?: boolean | null;
  lastPostAt?: Date | null;
  now?: Date;
  maxAgeMonths?: number;
  followerMin?: number | null;
  followerMax?: number | null;
  includeKeywords?: string[];
  excludeKeywords?: string[];
  requireVerified?: boolean | null;
  activeWithinDays?: number;
};

export type QualificationCheck = {
  key: "age" | "followers" | "bio_include" | "bio_exclude" | "verified" | "recent_activity";
  result: QualificationOutcome;
  note: string;
};

export type QualificationResult = {
  verdict: "qualified" | "unqualified" | "partial";
  checks: QualificationCheck[];
};

const cleanTerms = (terms: string[] | undefined) => (terms ?? []).map(term => term.trim().toLowerCase()).filter(Boolean);

function ageCheck(input: QualificationInput, now: Date, maxAgeMonths: number): QualificationCheck {
  if (!input.accountJoinedAt) return { key: "age", result: "unknown", note: "Account joined date is unavailable." };
  const ageMs = now.getTime() - input.accountJoinedAt.getTime();
  const thresholdMs = maxAgeMonths * 30.4375 * 24 * 60 * 60 * 1000;
  return ageMs < thresholdMs
    ? { key: "age", result: "passed", note: `Account is under ${maxAgeMonths} months old.` }
    : { key: "age", result: "failed", note: `Account is at least ${maxAgeMonths} months old.` };
}

function followerCheck(input: QualificationInput): QualificationCheck {
  if (input.followers == null) return { key: "followers", result: "unknown", note: "Follower count is unavailable." };
  if (input.followerMin != null && input.followers < input.followerMin) return { key: "followers", result: "failed", note: "Follower count is below the campaign minimum." };
  if (input.followerMax != null && input.followers > input.followerMax) return { key: "followers", result: "failed", note: "Follower count is above the campaign maximum." };
  return { key: "followers", result: "passed", note: "Follower count is inside the configured range." };
}

function bioChecks(input: QualificationInput): QualificationCheck[] {
  const bio = input.bio?.toLowerCase();
  const include = cleanTerms(input.includeKeywords);
  const exclude = cleanTerms(input.excludeKeywords);
  const includeResult = include.length === 0
    ? "passed"
    : bio == null ? "unknown" : include.some(term => bio.includes(term)) ? "passed" : "failed";
  const excludeResult = exclude.length === 0
    ? "passed"
    : bio == null ? "unknown" : exclude.some(term => bio.includes(term)) ? "failed" : "passed";
  return [
    { key: "bio_include", result: includeResult, note: include.length === 0 ? "No include terms configured." : bio == null ? "Bio is unavailable." : includeResult === "passed" ? "At least one include term matched." : "No include term matched." },
    { key: "bio_exclude", result: excludeResult, note: exclude.length === 0 ? "No exclude terms configured." : bio == null ? "Bio is unavailable." : excludeResult === "failed" ? "An exclude term matched." : "No exclude term matched." },
  ];
}

function verifiedCheck(input: QualificationInput): QualificationCheck {
  if (input.requireVerified == null) return { key: "verified", result: "passed", note: "Verified status is not required." };
  if (input.verified == null) return { key: "verified", result: "unknown", note: "Verified status is unavailable." };
  return input.verified === input.requireVerified
    ? { key: "verified", result: "passed", note: "Verified status matches the campaign rule." }
    : { key: "verified", result: "failed", note: "Verified status does not match the campaign rule." };
}

function recentActivityCheck(input: QualificationInput, now: Date, activeWithinDays: number): QualificationCheck {
  if (!input.lastPostAt) return { key: "recent_activity", result: "unknown", note: "Last post date is unavailable." };
  const ageMs = now.getTime() - input.lastPostAt.getTime();
  return ageMs <= activeWithinDays * 24 * 60 * 60 * 1000
    ? { key: "recent_activity", result: "passed", note: `Last post is within ${activeWithinDays} days.` }
    : { key: "recent_activity", result: "failed", note: `Last post is older than ${activeWithinDays} days.` };
}

export function evaluateQualification(input: QualificationInput): QualificationResult {
  const now = input.now ?? new Date();
  const checks: QualificationCheck[] = [
    ageCheck(input, now, input.maxAgeMonths ?? 12),
    followerCheck(input),
    ...bioChecks(input),
    verifiedCheck(input),
    recentActivityCheck(input, now, input.activeWithinDays ?? 30),
  ];
  const hasFailed = checks.some(check => check.result === "failed");
  const hasUnknown = checks.some(check => check.result === "unknown");
  return { verdict: hasFailed ? "unqualified" : hasUnknown ? "partial" : "qualified", checks };
}
