import { describe, expect, it } from "vitest";
import { admitAutomatedColdSend, isWithinWorkingHours } from "./queue-admission";

const base = { id: 1, enabled: true, status: "healthy", coldCap: 35, coldSentToday: 4, workingHours: "09:00–17:00", lastActivityAt: null };

describe("automated queue admission", () => {
  it("enforces working hours", () => {
    expect(isWithinWorkingHours("09:00–17:00", new Date("2026-09-16T08:59:00"))).toBe(false);
    expect(isWithinWorkingHours("09:00–17:00", new Date("2026-09-16T09:00:00"))).toBe(true);
    const result = admitAutomatedColdSend({ account: base, now: new Date("2026-09-16T18:00:00"), idempotencyKey: "a" });
    expect(result.action).toBe("hold"); expect(result.reason).toContain("Outside");
  });

  it("holds at the cold cap", () => {
    const result = admitAutomatedColdSend({ account: { ...base, coldSentToday: 35 }, now: new Date("2026-09-16T10:00:00"), idempotencyKey: "a" });
    expect(result.action).toBe("hold"); expect(result.reason).toContain("daily cap");
  });

  it("holds until the minimum automated interval elapses", () => {
    const last = new Date("2026-09-16T09:00:00");
    const result = admitAutomatedColdSend({ account: { ...base, lastActivityAt: last }, now: new Date("2026-09-16T09:05:00"), minIntervalMinutes: 8, idempotencyKey: "a" });
    expect(result.action).toBe("hold");
    expect(result.runAfter?.toISOString()).toBe("2026-09-16T09:08:00.000Z");
  });

  it("holds provider challenges and blocked health", () => {
    const challenge = admitAutomatedColdSend({ account: base, health: { status: "healthy", lastErrorCode: "captcha" }, now: new Date("2026-09-16T10:00:00"), idempotencyKey: "a" });
    expect(challenge.action).toBe("hold"); expect(challenge.reason).toContain("Provider challenge");
    const blocked = admitAutomatedColdSend({ account: base, health: { status: "blocked" }, now: new Date("2026-09-16T10:00:00"), idempotencyKey: "b" });
    expect(blocked.action).toBe("hold"); expect(blocked.reason).toContain("blocked");
  });

  it("rejects duplicate idempotency keys", () => {
    const result = admitAutomatedColdSend({ account: base, now: new Date("2026-09-16T10:00:00"), idempotencyKey: "existing", existingIdempotencyKeys: new Set(["existing"]) });
    expect(result.action).toBe("reject"); expect(result.reason).toContain("idempotency");
  });

  it("admits only when all automated gates pass", () => {
    expect(admitAutomatedColdSend({ account: base, health: { status: "healthy" }, now: new Date("2026-09-16T10:00:00"), idempotencyKey: "new" })).toMatchObject({ action: "admit" });
  });
});
