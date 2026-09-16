export type EnrollmentCandidate = {
  leadId: number;
  username: string;
  action: "queue" | "skip";
  reason: string;
};

export type AssignmentAccount = {
  id: number;
  handle: string;
  status: string;
  enabled: boolean;
  coldCap: number;
  coldSentToday: number;
};

export type EnrollmentAssignment = {
  leadId: number;
  username: string;
  accountId: number;
  idempotencyKey: string;
  reason: "capacity_assignment";
};

export type EnrollmentDecision = EnrollmentAssignment | (EnrollmentCandidate & { action: "skip"; reason: string });

export function campaignIdempotencyKey(campaignId: number, leadId: number): string {
  return `campaign:${campaignId}:lead:${leadId}:cold-opener`;
}

export function assignCampaignLeads(campaignId: number, candidates: EnrollmentCandidate[], accounts: AssignmentAccount[], alreadyEnrolledLeadIds = new Set<number>(), roundRobinStart = 0): EnrollmentDecision[] {
  const eligible = accounts.filter((account) => account.enabled && ["healthy", "warming"].includes(account.status) && account.coldSentToday < account.coldCap);
  const remaining = new Map(eligible.map((account) => [account.id, Math.max(0, account.coldCap - account.coldSentToday)]));
  const ordered = [...eligible].sort((left, right) => (remaining.get(right.id)! - remaining.get(left.id)!));
  const output: EnrollmentDecision[] = [];
  let tieCursor = Math.max(0, roundRobinStart) % Math.max(1, ordered.length);
  for (const candidate of candidates) {
    if (candidate.action !== "queue") { output.push({ ...candidate, action: "skip" }); continue; }
    if (alreadyEnrolledLeadIds.has(candidate.leadId)) {
      output.push({ ...candidate, action: "skip", reason: "Lead is already enrolled in this campaign." });
      continue;
    }
    const available = ordered.filter((account) => (remaining.get(account.id) ?? 0) > 0);
    if (!available.length) {
      output.push({ ...candidate, action: "skip", reason: "No eligible account capacity remains." });
      continue;
    }
    const maxRemaining = Math.max(...available.map((account) => remaining.get(account.id)!));
    const tied = available.filter((account) => remaining.get(account.id) === maxRemaining);
    const account = tied.find((candidate) => ordered.indexOf(candidate) >= tieCursor) ?? tied[0];
    tieCursor = (ordered.indexOf(account) + 1) % ordered.length;
    remaining.set(account.id, remaining.get(account.id)! - 1);
    output.push({ leadId: candidate.leadId, username: candidate.username, accountId: account.id, idempotencyKey: campaignIdempotencyKey(campaignId, candidate.leadId), reason: "capacity_assignment" });
  }
  return output;
}
