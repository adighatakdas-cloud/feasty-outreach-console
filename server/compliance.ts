import type { Lead } from "../drizzle/schema";

export type ComplianceDecision =
  | { allowed: true; reason: "eligible" }
  | { allowed: false; reason: "opted_out" | "missing_source_basis" | "unqualified"; message: string };

export type ComplianceLead = Pick<Lead, "qualificationVerdict" | "source" | "contactStatus"> & {
  optedOut?: boolean | null;
  consentBasis?: string | null;
};

/** Central send-layer gate. Call this before intake, campaign enrollment, and every send attempt. */
export function evaluateContactEligibility(lead: ComplianceLead): ComplianceDecision {
  if (lead.optedOut) return { allowed: false, reason: "opted_out", message: "Lead is on the do-not-contact list." };
  if (!lead.source?.trim() || !lead.consentBasis?.trim()) return { allowed: false, reason: "missing_source_basis", message: "Lead source and consent basis must be recorded before contact." };
  if (lead.qualificationVerdict === "unqualified") return { allowed: false, reason: "unqualified", message: "Lead is marked unqualified." };
  return { allowed: true, reason: "eligible" };
}

export function normalizeConsentBasis(value: string): string {
  return value.trim().replace(/\s+/g, " ").slice(0, 160);
}

export function containsOptOutLanguage(message: string): boolean {
  return /\b(stop|unsubscribe|remove me|do not contact|don't contact|not interested)\b/i.test(message);
}
