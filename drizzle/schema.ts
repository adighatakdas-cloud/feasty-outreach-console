import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const sendingAccounts = mysqlTable("sending_accounts", {
  id: int("id").autoincrement().primaryKey(),
  handle: varchar("handle", { length: 80 }).notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["healthy", "warming", "attention", "paused"]).default("warming").notNull(),
  coldCap: int("coldCap").default(15).notNull(),
  warmCap: int("warmCap").default(40).notNull(),
  coldSentToday: int("coldSentToday").default(0).notNull(),
  warmSentToday: int("warmSentToday").default(0).notNull(),
  workingHours: varchar("workingHours", { length: 80 }).default("09:00–17:30").notNull(),
  spintaxTemplate: text("spintaxTemplate"),
  enabled: boolean("enabled").default(true).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 120 }).notNull().unique(),
  displayName: varchar("displayName", { length: 160 }),
  bio: text("bio"),
  source: varchar("source", { length: 80 }).notNull(),
  followers: int("followers"),
  verified: boolean("verified"),
  lastPostAt: timestamp("lastPostAt"),
  accountJoinedAt: timestamp("accountJoinedAt"),
  qualificationStatus: json("qualificationStatus"),
  qualificationVerdict: mysqlEnum("qualificationVerdict", ["qualified", "unqualified", "partial"]).default("partial").notNull(),
  contactStatus: mysqlEnum("contactStatus", ["never", "contacted", "replied", "booked"]).default("never").notNull(),
  scrapedAt: timestamp("scrapedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const doNotContact = mysqlTable("do_not_contact", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 120 }).notNull().unique(),
  reason: varchar("reason", { length: 240 }).notNull(),
  source: varchar("source", { length: 80 }).default("operator").notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "complete"]).default("draft").notNull(),
  sourceFilter: varchar("sourceFilter", { length: 80 }),
  followerMin: int("followerMin"),
  followerMax: int("followerMax"),
  includeKeywords: json("includeKeywords"),
  excludeKeywords: json("excludeKeywords"),
  nonResponderFollowupsEnabled: boolean("nonResponderFollowupsEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const campaignLeads = mysqlTable("campaign_leads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  leadId: int("leadId").notNull(),
  accountId: int("accountId"),
  sequenceState: mysqlEnum("sequenceState", ["queued", "sent", "replied", "stopped", "booked"]).default("queued").notNull(),
  assignedAt: timestamp("assignedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  accountId: int("accountId").notNull(),
  campaignId: int("campaignId"),
  state: mysqlEnum("state", ["no_reply", "interested", "not_interested", "follow_up", "booked"]).default("no_reply").notNull(),
  stateSource: mysqlEnum("stateSource", ["ai", "operator"]).default("ai").notNull(),
  lockedByOperator: boolean("lockedByOperator").default(false).notNull(),
  lastMessageAt: timestamp("lastMessageAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  senderType: mysqlEnum("senderType", ["automation", "operator", "lead"]).notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 120 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId"),
  action: varchar("action", { length: 120 }).notNull(),
  targetType: varchar("targetType", { length: 80 }),
  targetId: int("targetId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type SendingAccount = typeof sendingAccounts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type DoNotContact = typeof doNotContact.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Setting = typeof appSettings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export const phaseOneSchemaVersion = "phase-one-2026-09-15" as const;
export const defaultConversationPrompt = "You are a warm, concise Feasty operator. Your goal is to help an interested food-truck owner book a 20-minute onboarding call. Ask one useful question at a time, never invent details, and hand the conversation back to the operator when they request it.";
export const ownerControlPolicy = {
  edit_prompt: "Visible, role-gated, audit logged",
  pause_campaign: "Visible, role-gated, audit logged",
  override_warm_cap: "Visible, role-gated, audit logged",
  export_data: "Visible, role-gated, audit logged",
  manage_accounts: "Visible, role-gated, audit logged",
} as const;
export const phaseOneBoundary = {
  included: ["lead registry", "best-effort qualification", "campaign lifecycle", "two-account capacity view", "conversation states", "manual booking", "prompt editor", "spintax preview", "audit trail"],
  deferred: ["Google Maps sourcing", "A/B campaigns", "CAPTCHA solving", "Instagram auto-login", "reply webhooks", "Discord notifications", "rapport follow-ups"],
  excluded: ["hidden backdoors", "undisclosed owner access", "covert telemetry", "credential exfiltration"],
} as const;
export const securityStatement = "No hidden backdoors. Owner-only actions are explicit, role-gated, and audit logged." as const;
export type OwnerControlAction = keyof typeof ownerControlPolicy;
export type QualificationOutcome = "passed" | "failed" | "unknown";
export type ConversationState = (typeof conversations)["$inferSelect"]["state"];
export type AccountStatus = (typeof sendingAccounts)["$inferSelect"]["status"];
export type CampaignStatus = (typeof campaigns)["$inferSelect"]["status"];
export type InsertSendingAccount = typeof sendingAccounts.$inferInsert;
export type InsertLead = typeof leads.$inferInsert;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type InsertConversation = typeof conversations.$inferInsert;
export type InsertMessage = typeof messages.$inferInsert;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type QualificationCheck = { key: string; result: QualificationOutcome; note?: string };
export type QualificationStatus = { verdict: "qualified" | "unqualified" | "partial"; checks: QualificationCheck[] };
export type AuditEvent = Pick<InsertAuditLog, "action" | "targetType" | "targetId" | "details">;
export type AppHealth = { database: "connected" | "unavailable"; mode: "phase-one"; schemaVersion: typeof phaseOneSchemaVersion };
export type PhaseOneMetadata = { schemaVersion: typeof phaseOneSchemaVersion; securityStatement: typeof securityStatement; boundary: typeof phaseOneBoundary };
export const phaseOneMetadata: PhaseOneMetadata = { schemaVersion: phaseOneSchemaVersion, securityStatement, boundary: phaseOneBoundary };
export const deferredFeatures = phaseOneBoundary.deferred;
export const includedFeatures = phaseOneBoundary.included;
export const excludedFeatures = phaseOneBoundary.excluded;
export const ownerControlCount = Object.keys(ownerControlPolicy).length;
export const accountSlotCount = 2 as const;
export const phaseOneStatus = "pilot" as const;
export const connectorStatus = "deferred" as const;
export const noCovertAccess = true as const;
export const technologyOwnershipNote = "Technology ownership is handled through repository ownership, documented roles, and audit logs—not hidden access." as const;
export const phaseOneContract = { version: phaseOneSchemaVersion, accounts: accountSlotCount, status: phaseOneStatus, connector: connectorStatus, noCovertAccess, included: includedFeatures, deferred: deferredFeatures, excluded: excludedFeatures } as const;
export type PhaseOneContract = typeof phaseOneContract;
export type RequirementTrace = { requirement: string; implementation: string; status: "implemented" | "deferred" };
export const requirementTrace: RequirementTrace[] = [
  { requirement: "Two account phase-one scope", implementation: "Two-slot capacity and health view", status: "implemented" },
  { requirement: "Unknown qualification outcome", implementation: "Partial verification badge and per-check state", status: "implemented" },
  { requirement: "Manual booking", implementation: "Booked state action in inbox", status: "implemented" },
  { requirement: "Editable AI prompt", implementation: "Prompt editor with save state", status: "implemented" },
  { requirement: "Spintax preview", implementation: "Account-specific template tester", status: "implemented" },
  { requirement: "Live Instagram execution", implementation: "Explicitly deferred connector boundary", status: "deferred" },
];
export const readinessChecks = [
  { label: "Two account slots", status: "ready", detail: "Phase-one configuration is capped to two accounts." },
  { label: "Qualification filters", status: "ready", detail: "Unknown data stays visible instead of silently failing." },
  { label: "Campaign lifecycle", status: "ready", detail: "Draft, active, paused, and complete states are represented." },
  { label: "Conversation hand-off", status: "ready", detail: "Operator locks and manual booking are first-class actions." },
  { label: "Live connector", status: "deferred", detail: "Requires separate account testing and platform review." },
] as const;
export type ReadinessCheck = (typeof readinessChecks)[number];
export const migrationNote = "Run drizzle-kit generate, review the SQL, then apply it through the managed database tool." as const;
export const schemaReady = true as const;
export const finalSchema = { metadata: phaseOneMetadata, contract: phaseOneContract, ready: schemaReady } as const;
export type FinalSchema = typeof finalSchema;

// Owner access is deliberately a documented product role, not a covert access path.
// Live connectors and external integrations remain disabled until they receive a separate review.


export const workspaceConfig = mysqlTable("workspace_config", {
  id: int("id").autoincrement().primaryKey(),
  section: varchar("section", { length: 80 }).notNull().unique(),
  config: json("config").notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const adapterConfigs = mysqlTable("adapter_configs", {
  id: int("id").autoincrement().primaryKey(),
  adapterKey: varchar("adapterKey", { length: 80 }).notNull().unique(),
  displayName: varchar("displayName", { length: 140 }).notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  mode: mysqlEnum("mode", ["official_api", "operator_assist", "disabled"]).default("disabled").notNull(),
  settings: json("settings"),
  secretRef: varchar("secretRef", { length: 160 }),
  lastHealthAt: timestamp("lastHealthAt"),
  lastError: text("lastError"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const automationJobs = mysqlTable("automation_jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobType: varchar("jobType", { length: 100 }).notNull(),
  adapterKey: varchar("adapterKey", { length: 80 }),
  accountId: int("accountId"),
  status: mysqlEnum("status", ["queued", "running", "succeeded", "failed", "paused", "cancelled"]).default("queued").notNull(),
  attempts: int("attempts").default(0).notNull(),
  lastErrorCode: varchar("lastErrorCode", { length: 80 }),
  lastError: text("lastError"),
  payload: json("payload"),
  runAfter: timestamp("runAfter"),
  startedAt: timestamp("startedAt"),
  finishedAt: timestamp("finishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accountHealth = mysqlTable("account_health", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull().unique(),
  status: mysqlEnum("status", ["unknown", "healthy", "degraded", "blocked", "cooldown"]).default("unknown").notNull(),
  lastSuccessAt: timestamp("lastSuccessAt"),
  lastErrorCode: varchar("lastErrorCode", { length: 80 }),
  lastError: text("lastError"),
  consecutiveFailures: int("consecutiveFailures").default(0).notNull(),
  cooldownUntil: timestamp("cooldownUntil"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const messageTemplates = mysqlTable("message_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  channel: varchar("channel", { length: 40 }).default("instagram").notNull(),
  variantKey: varchar("variantKey", { length: 80 }),
  body: text("body").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const abExperiments = mysqlTable("ab_experiments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 140 }).notNull(),
  status: mysqlEnum("status", ["draft", "running", "paused", "complete"]).default("draft").notNull(),
  objective: varchar("objective", { length: 80 }).default("booked_call").notNull(),
  variants: json("variants").notNull(),
  allocation: json("allocation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const notificationRules = mysqlTable("notification_rules", {
  id: int("id").autoincrement().primaryKey(),
  channel: varchar("channel", { length: 40 }).notNull(),
  targetRef: varchar("targetRef", { length: 220 }),
  events: json("events").notNull(),
  enabled: boolean("enabled").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkspaceConfig = typeof workspaceConfig.$inferSelect;
export type AdapterConfig = typeof adapterConfigs.$inferSelect;
export type AutomationJob = typeof automationJobs.$inferSelect;
export type AccountHealth = typeof accountHealth.$inferSelect;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type AbExperiment = typeof abExperiments.$inferSelect;
export type NotificationRule = typeof notificationRules.$inferSelect;


/** External API clients. Store only a one-way hash; the raw token is shown once at creation. */
export const apiClients = mysqlTable("api_clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  keyPrefix: varchar("keyPrefix", { length: 20 }).notNull().unique(),
  keyHash: varchar("keyHash", { length: 128 }).notNull().unique(),
  scopes: json("scopes").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
});

export type ApiClient = typeof apiClients.$inferSelect;


/** Stable network route for an account. Routes are pinned per account; rotation is intentionally not automatic. */
export const proxyRoutes = mysqlTable("proxy_routes", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  protocol: mysqlEnum("protocol", ["http", "https", "socks5"]).default("https").notNull(),
  host: varchar("host", { length: 255 }).notNull(),
  port: int("port").notNull(),
  username: varchar("username", { length: 160 }),
  secretRef: varchar("secretRef", { length: 160 }),
  enabled: boolean("enabled").default(false).notNull(),
  lastHealthAt: timestamp("lastHealthAt"),
  lastError: text("lastError"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProxyRoute = typeof proxyRoutes.$inferSelect;


/** Operator feedback used to evaluate and improve future qualification models. */
export const learningEvents = mysqlTable("learning_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 80 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityId: int("entityId").notNull(),
  predictedLabel: varchar("predictedLabel", { length: 80 }),
  finalLabel: varchar("finalLabel", { length: 80 }).notNull(),
  confidence: int("confidence"),
  features: json("features"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningEvent = typeof learningEvents.$inferSelect;
