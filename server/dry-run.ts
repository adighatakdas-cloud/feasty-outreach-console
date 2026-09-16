import { evaluateContactEligibility, type ComplianceLead } from "./compliance";
import { evaluateQualification, type QualificationInput } from "./qualification";

export type DryRunLead = QualificationInput & ComplianceLead & {
  id: number;
  username: string;
  alreadyContacted?: boolean;
};

export type DryRunCampaign = {
  id: number;
  name: string;
  maxLeads?: number;
  requireCompleteQualification?: boolean;
  includeKeywords?: string[];
  excludeKeywords?: string[];
  followerMin?: number | null;
  followerMax?: number | null;
};

export type DryRunDecision = {
  leadId: number;
  username: string;
  action: "queue" | "skip";
  reason: string;
  qualificationVerdict: "qualified" | "unqualified" | "partial";
  compliance: "eligible" | "blocked";
};

export function planCampaignDryRun(campaign: DryRunCampaign, leads: DryRunLead[], now = new Date()): DryRunDecision[] {
  const decisions: DryRunDecision[] = [];
  const limit = campaign.maxLeads ?? Number.POSITIVE_INFINITY;
  for (const lead of leads) {
    const qualification = evaluateQualification({ ...lead, ...campaign, now });
    const compliance = evaluateContactEligibility(lead);
    const blockedReason = compliance.allowed ? undefined : compliance.message;
    const qualificationBlocked = qualification.verdict === "unqualified" || (campaign.requireCompleteQualification && qualification.verdict !== "qualified");
    const duplicateBlocked = lead.alreadyContacted === true;
    const action = !blockedReason && !qualificationBlocked && !duplicateBlocked && decisions.filter(item => item.action === "queue").length < limit ? "queue" : "skip";
    const reason = action === "queue" ? "Eligible for dry-run queue." : blockedReason ?? (duplicateBlocked ? "Lead has prior contact history." : qualification.verdict === "unqualified" ? "Lead failed qualification." : qualification.verdict === "partial" ? "Lead requires review before campaign enrollment." : "Campaign quantity limit reached.");
    decisions.push({ leadId: lead.id, username: lead.username, action, reason, qualificationVerdict: qualification.verdict, compliance: compliance.allowed ? "eligible" : "blocked" });
  }
  return decisions;
}
