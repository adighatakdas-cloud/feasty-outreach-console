import { describe, expect, it } from "vitest";
import { planCampaignDryRun } from "./dry-run";
import { evaluateQualification } from "./qualification";

const now = new Date("2026-09-16T12:00:00.000Z");

describe("functional lead qualification", () => {
  it("passes configured case-insensitive substring filters", () => {
    const result = evaluateQualification({
      now,
      accountJoinedAt: new Date("2026-04-01T00:00:00.000Z"),
      followers: 1200,
      bio: "Young FOODTRUCK serving lunch",
      verified: false,
      lastPostAt: new Date("2026-09-10T00:00:00.000Z"),
      followerMin: 100,
      followerMax: 5000,
      includeKeywords: ["truck"],
      excludeKeywords: ["franchise"],
      requireVerified: false,
    });
    expect(result.verdict).toBe("qualified");
    expect(result.checks.every(check => check.result === "passed")).toBe(true);
  });

  it("keeps unavailable data as unknown instead of silently failing", () => {
    const result = evaluateQualification({ now, bio: "food truck" });
    expect(result.verdict).toBe("partial");
    expect(result.checks.filter(check => check.result === "unknown").length).toBeGreaterThan(0);
  });

  it("fails an explicit exclude match", () => {
    const result = evaluateQualification({ now, bio: "food truck franchise", excludeKeywords: ["FRANCHISE"] });
    expect(result.verdict).toBe("unqualified");
    expect(result.checks.find(check => check.key === "bio_exclude")?.result).toBe("failed");
  });
});

describe("campaign dry-run planner", () => {
  const baseLead = {
    id: 1,
    username: "@sampletruck",
    qualificationVerdict: "qualified" as const,
    source: "authorized_import",
    consentBasis: "Public business profile",
    contactStatus: "never" as const,
    accountJoinedAt: new Date("2026-04-01T00:00:00.000Z"),
    followers: 800,
    bio: "food truck",
    lastPostAt: new Date("2026-09-10T00:00:00.000Z"),
  };

  it("queues eligible leads and blocks prior contact", () => {
    const decisions = planCampaignDryRun({ id: 1, name: "Pilot", maxLeads: 2 }, [baseLead, { ...baseLead, id: 2, username: "@contacted", alreadyContacted: true }], now);
    expect(decisions[0]).toMatchObject({ action: "queue", compliance: "eligible" });
    expect(decisions[1]).toMatchObject({ action: "skip", reason: "Lead has prior contact history." });
  });

  it("does not queue a do-not-contact lead", () => {
    const decisions = planCampaignDryRun({ id: 1, name: "Pilot" }, [{ ...baseLead, optedOut: true }], now);
    expect(decisions[0]).toMatchObject({ action: "skip", compliance: "blocked" });
  });
});
