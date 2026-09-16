export const responseAlertKinds = [
  "any_reply",
  "first_reply",
  "interested",
  "human_requested",
  "opt_out",
  "booking_intent",
  "booked",
] as const;

export type ResponseAlertKind = (typeof responseAlertKinds)[number];

export const developerAlertServices = [
  "web",
  "worker",
  "queue",
  "adapter",
  "ai",
  "reports",
  "notifications",
] as const;

export type DeveloperAlertService = (typeof developerAlertServices)[number];
export type AlertSeverity = "normal" | "high" | "critical";
export type NotificationChannel = "in_app" | "discord" | "email" | "signed_webhook";
export type DigestMode = "immediate" | "grouped" | "period_end";

export type ResponseEventContract = {
  id: string;
  conversationId: string;
  leadId: string;
  accountId: string;
  campaignId?: string;
  receivedAt: string;
  providerMessageId?: string;
  firstResponse: boolean;
  classification: "unknown" | "interested" | "not_interested" | "follow_up" | "booked";
  requiresHuman: boolean;
  isOptOut: boolean;
  correlationId: string;
};

export type DeveloperAlertContract = {
  fingerprint: string;
  service: DeveloperAlertService;
  environment: "development" | "staging" | "production";
  severity: AlertSeverity;
  errorCode: string;
  occurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  correlationId?: string;
  targetRef?: string;
};

export type LearningEventType =
  | "research_observation"
  | "qualification_label"
  | "operator_correction"
  | "message_outcome"
  | "reply_classification"
  | "ai_draft_feedback"
  | "booking_outcome"
  | "opt_out_outcome";

export type LearningEventContract = {
  id: string;
  type: LearningEventType;
  subjectId: string;
  occurredAt: string;
  modelVersion?: string;
  promptVersion?: string;
  label?: string;
  source: "system" | "operator" | "provider";
  payloadSchemaVersion: 1;
};

export type BrandAssetRole =
  | "primary_logo"
  | "monochrome_logo"
  | "emblem"
  | "favicon"
  | "social_preview"
  | "mockup"
  | "background"
  | "illustration";

export type BrandAssetContract = {
  key: string;
  role: BrandAssetRole;
  storagePath: string;
  mimeType: "image/svg+xml" | "image/png" | "image/jpeg" | "application/pdf";
  theme: "light" | "dark" | "both";
  approved: boolean;
  checksum: string;
  sourceDriveFileId?: string;
};

export const implementationBoundary = {
  externalSendingDefault: "disabled",
  providerWarnings: "pause_and_surface",
  captcha: "stop_no_solver",
  credentials: "outside_dashboard",
  modelPromotion: "manual_approval_required",
  driveAssetsAtRuntime: false,
} as const;
