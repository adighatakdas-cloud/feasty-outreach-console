import { describe, expect, it } from "vitest";
import { classifyImportRows, normalizeLead, normalizeUsername } from "./lead-import";

describe("lead import", () => {
  it("normalizes handles and preserves qualification evidence", () => {
    expect(normalizeUsername("@@Food_Truck")).toBe("@food_truck");
    const result = normalizeLead({ username: "@Food_Truck", source: "authorized_import", consentBasis: "Operator export", bio: "street food" }, new Date("2026-09-16T00:00:00.000Z"));
    expect(result).toMatchObject({ username: "@food_truck", qualificationVerdict: "partial" });
    if ("outcome" in result) throw new Error("Expected normalized lead");
    expect(result.qualificationStatus.checks).toHaveLength(6);
    expect(result.qualificationStatus.consentBasis).toBe("Operator export");
  });

  it("classifies duplicate, blocked, invalid, and created rows without insertion", () => {
    const results = classifyImportRows([
      { username: "@existing", source: "export", consentBasis: "operator" },
      { username: "@blocked", source: "export", consentBasis: "operator" },
      { username: "@new_lead", source: "export", consentBasis: "operator" },
      { username: "@new_lead", source: "export", consentBasis: "operator" },
      { username: "not valid", source: "export", consentBasis: "operator" },
    ], new Set(["@existing"]), new Set(["@blocked"]), new Date("2026-09-16T00:00:00.000Z"));
    expect(results.map((item) => item.outcome)).toEqual(["duplicate", "blocked", "created", "duplicate", "invalid"]);
  });
});
