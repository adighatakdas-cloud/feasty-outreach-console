import { describe, expect, it } from "vitest";
import { assignCampaignLeads, campaignIdempotencyKey } from "./campaign-enrollment";

describe("campaign enrollment", () => {
  const accounts = [
    { id: 1, handle: "@one", status: "healthy", enabled: true, coldCap: 3, coldSentToday: 0 },
    { id: 2, handle: "@two", status: "healthy", enabled: true, coldCap: 2, coldSentToday: 1 },
    { id: 3, handle: "@paused", status: "paused", enabled: true, coldCap: 20, coldSentToday: 0 },
  ];

  it("assigns to eligible accounts by remaining capacity", () => {
    const result = assignCampaignLeads(7, [
      { leadId: 11, username: "@a", action: "queue", reason: "eligible" },
      { leadId: 12, username: "@b", action: "queue", reason: "eligible" },
      { leadId: 13, username: "@c", action: "queue", reason: "eligible" },
    ], accounts);
    expect(result.filter((item) => "accountId" in item).map((item: any) => item.accountId)).toEqual([1, 1, 2]);
    expect(result.filter((item) => "accountId" in item).map((item: any) => item.idempotencyKey)).toEqual([
      "campaign:7:lead:11:cold-opener",
      "campaign:7:lead:12:cold-opener",
      "campaign:7:lead:13:cold-opener",
    ]);
  });

  it("uses the round-robin cursor for tied capacity and skips already-enrolled leads", () => {
    const equal = accounts.map((account) => ({ ...account, coldCap: 1, coldSentToday: 0 })).slice(0, 2);
    const result = assignCampaignLeads(7, [
      { leadId: 11, username: "@a", action: "queue", reason: "eligible" },
      { leadId: 12, username: "@b", action: "queue", reason: "eligible" },
      { leadId: 13, username: "@c", action: "queue", reason: "eligible" },
    ], equal, new Set([11]), 1);
    expect(result[0]).toMatchObject({ action: "skip", reason: "Lead is already enrolled in this campaign." });
    expect(result[1]).toMatchObject({ accountId: 2 });
    expect(result[2]).toMatchObject({ accountId: 1 });
    expect(campaignIdempotencyKey(7, 13)).toBe("campaign:7:lead:13:cold-opener");
  });
});
