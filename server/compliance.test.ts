import { describe, expect, it } from "vitest";
import { containsOptOutLanguage, evaluateContactEligibility, normalizeConsentBasis } from "./compliance";

describe("contact compliance gate", () => {
  const eligible = { qualificationVerdict: "qualified" as const, source: "authorized_import", consentBasis: "Public business profile" };
  it("allows a qualified lead with source and consent basis", () => expect(evaluateContactEligibility(eligible)).toEqual({ allowed: true, reason: "eligible" }));
  it("blocks opted-out leads", () => expect(evaluateContactEligibility({ ...eligible, optedOut: true })).toMatchObject({ allowed: false, reason: "opted_out" }));
  it("blocks missing source basis", () => expect(evaluateContactEligibility({ ...eligible, consentBasis: "" })).toMatchObject({ allowed: false, reason: "missing_source_basis" }));
  it("blocks unqualified leads", () => expect(evaluateContactEligibility({ ...eligible, qualificationVerdict: "unqualified" })).toMatchObject({ allowed: false, reason: "unqualified" }));
  it("detects opt-out language and normalizes source basis", () => { expect(containsOptOutLanguage("Please remove me from your list")).toBe(true); expect(normalizeConsentBasis("  Public   profile  ")).toBe("Public profile"); });
});
