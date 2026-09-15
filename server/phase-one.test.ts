import { describe, expect, it } from "vitest";
import {
  accountSlotCount,
  ownerControlPolicy,
  phaseOneBoundary,
  phaseOneSchemaVersion,
  securityStatement,
} from "../drizzle/schema";

describe("phase-one contract", () => {
  it("keeps the pilot scoped to two account slots", () => {
    expect(accountSlotCount).toBe(2);
    expect(phaseOneSchemaVersion).toContain("phase-one");
  });

  it("makes owner controls explicit and auditable", () => {
    expect(Object.keys(ownerControlPolicy)).toEqual([
      "edit_prompt",
      "pause_campaign",
      "override_warm_cap",
      "export_data",
      "manage_accounts",
    ]);
    expect(Object.values(ownerControlPolicy).every((value) => value.includes("audit logged"))).toBe(true);
    expect(securityStatement).toContain("No hidden backdoors");
  });

  it("keeps live execution and covert access outside the phase-one build", () => {
    expect(phaseOneBoundary.deferred).toContain("reply webhooks");
    expect(phaseOneBoundary.excluded).toContain("hidden backdoors");
    expect(phaseOneBoundary.excluded).toContain("credential exfiltration");
    expect(phaseOneBoundary.included).toContain("manual booking");
  });
});
