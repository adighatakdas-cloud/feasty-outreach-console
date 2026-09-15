import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import {
  abExperiments,
  adapterConfigs,
  appSettings,
  automationJobs,
  campaigns,
  leads,
  notificationRules,
  sendingAccounts,
  workspaceConfig,
} from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { API_SCOPES, createApiKey } from "./api-keys";
import { suggestQualification } from "./ai-review";
import { normalizeConsentBasis } from "./compliance";
import {
  createCampaign,
  createLead,
  getDb,
  getPrompt,
  healthCheck,
  listAccountHealth,
  listAdapters,
  listAuditLogs,
  listCampaigns,
  listConversations,
  listDoNotContact,
  listExperiments,
  listJobs,
  listLeads,
  listLearningEvents,
  listNotificationRules,
  listApiClients,
  listProxyRoutes,
  listSendingAccounts,
  listTemplates,
  listWorkspaceConfig,
  updateAccount,
  writeAuditLog,
  revokeApiClient,
  recordLearningEvent,
  saveApiClient,
  saveDoNotContact,
  saveProxyRoute,
} from "./db";

const ownerOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Owner controls require an administrator role." });
  return next();
});

const jsonObject = z.record(z.string(), z.unknown());

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    health: publicProcedure.query(() => healthCheck()),
    snapshot: protectedProcedure.query(async () => {
      const [accounts, health, leads, campaigns, conversations, jobs, adapters, templates, experiments, notifications, config, audit, proxies, prompt, learning, doNotContactRecords] = await Promise.all([
        listSendingAccounts(), listAccountHealth(), listLeads(), listCampaigns(), listConversations(), listJobs(), listAdapters(), listTemplates(), listExperiments(), listNotificationRules(), listWorkspaceConfig(), listAuditLogs(), listProxyRoutes(), getPrompt(), listLearningEvents(), listDoNotContact(),
      ]);
      return { accounts, health, leads, campaigns, conversations, jobs, adapters, templates, experiments, notifications, config, audit, proxies, prompt, learning, doNotContact: doNotContactRecords };
    }),
    prompt: protectedProcedure.query(() => getPrompt()),
  }),
  leads: router({
    create: ownerOnly.input(z.object({ username: z.string().min(2).max(120), displayName: z.string().max(160).optional(), bio: z.string().max(5000).optional(), source: z.string().min(1).max(80), consentBasis: z.string().min(2).max(160), followers: z.number().int().nonnegative().optional() })).mutation(async ({ ctx, input }) => {
      const { consentBasis, ...leadInput } = input;
      await createLead({ ...leadInput, qualificationStatus: { consentBasis: normalizeConsentBasis(consentBasis), checks: [] }, qualificationVerdict: "partial", scrapedAt: new Date(), createdAt: new Date() });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "lead_created", targetType: "lead", details: { username: input.username, source: input.source } });
      return { ok: true } as const;
    }),
    review: ownerOnly.input(z.object({ id: z.number().int().positive(), verdict: z.enum(["qualified", "unqualified", "partial"]), notes: z.string().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.update(leads).set({ qualificationVerdict: input.verdict, qualificationStatus: input.notes ? { notes: input.notes, reviewedAt: new Date().toISOString() } : undefined }).where(eq(leads.id, input.id));
      await recordLearningEvent({ eventType: "qualification_review", entityType: "lead", entityId: input.id, finalLabel: input.verdict, features: input.notes ? { notes: input.notes } : undefined, createdBy: ctx.user.id });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "lead_reviewed", targetType: "lead", targetId: input.id, details: { verdict: input.verdict } });
      return { ok: true } as const;
    }),
    suggest: ownerOnly.input(z.object({ username: z.string().min(2).max(120), displayName: z.string().max(160).optional(), bio: z.string().max(5000).optional(), source: z.string().min(1).max(80), followers: z.number().int().nonnegative().optional() })).mutation(async ({ ctx, input }) => {
      const suggestion = await suggestQualification(input);
      await recordLearningEvent({ eventType: "ai_qualification_suggestion", entityType: "lead", entityId: 0, predictedLabel: suggestion.verdict, finalLabel: "pending_review", confidence: suggestion.confidence, features: { username: input.username, reasons: suggestion.reasons }, createdBy: ctx.user.id });
      return suggestion;
    }),
  }),
  compliance: router({
    optOut: ownerOnly.input(z.object({ username: z.string().min(2).max(120), reason: z.string().min(2).max(240) })).mutation(async ({ ctx, input }) => {
      await saveDoNotContact({ ...input, createdBy: ctx.user.id });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "lead_opted_out", targetType: "lead", details: { username: input.username, reason: input.reason } });
      return { ok: true } as const;
    }),
  }),
  campaigns: router({
    create: ownerOnly.input(z.object({ name: z.string().min(2).max(160), followerMin: z.number().int().optional(), followerMax: z.number().int().optional(), includeKeywords: z.array(z.string()).optional(), excludeKeywords: z.array(z.string()).optional() })).mutation(async ({ ctx, input }) => {
      await createCampaign({ name: input.name, status: "draft", followerMin: input.followerMin, followerMax: input.followerMax, includeKeywords: input.includeKeywords, excludeKeywords: input.excludeKeywords, createdAt: new Date(), updatedAt: new Date(), nonResponderFollowupsEnabled: false });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "campaign_created", targetType: "campaign", details: input });
      return { ok: true } as const;
    }),
    setStatus: ownerOnly.input(z.object({ id: z.number().int().positive(), status: z.enum(["draft", "active", "paused", "complete"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.update(campaigns).set({ status: input.status, updatedAt: new Date() }).where(eq(campaigns.id, input.id));
      await writeAuditLog({ actorUserId: ctx.user.id, action: `campaign_${input.status}`, targetType: "campaign", targetId: input.id });
      return { ok: true } as const;
    }),
  }),
  accounts: router({
    create: ownerOnly.input(z.object({ handle: z.string().min(2).max(120), label: z.string().min(2).max(140) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.insert(sendingAccounts).values({ handle: input.handle.startsWith("@") ? input.handle : `@${input.handle}`, label: input.label, status: "warming", enabled: false, coldCap: 5, warmCap: 10, workingHours: "09:00-17:00", spintaxTemplate: "", createdAt: new Date(), updatedAt: new Date() });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "account_created", targetType: "account", details: { label: input.label } });
      return { ok: true } as const;
    }),
    update: ownerOnly.input(z.object({ id: z.number().int().positive(), status: z.enum(["healthy", "warming", "attention", "paused"]).optional(), coldCap: z.number().int().min(0).max(500).optional(), warmCap: z.number().int().min(0).max(500).optional(), workingHours: z.string().max(80).optional(), spintaxTemplate: z.string().max(10000).optional(), enabled: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
      const { id, ...values } = input;
      await updateAccount(id, values);
      await writeAuditLog({ actorUserId: ctx.user.id, action: "account_updated", targetType: "account", targetId: id, details: values });
      return { ok: true } as const;
    }),
  }),
  config: router({
    saveSection: ownerOnly.input(z.object({ section: z.string().min(2).max(80), config: jsonObject })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.insert(workspaceConfig).values({ section: input.section, config: input.config, updatedBy: ctx.user.id, updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { config: input.config, updatedBy: ctx.user.id, updatedAt: new Date() } });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "config_section_saved", targetType: "workspace_config", details: { section: input.section } });
      return { ok: true } as const;
    }),
  }),
  adapters: router({
    upsert: ownerOnly.input(z.object({ adapterKey: z.string().min(2).max(80), displayName: z.string().min(2).max(140), enabled: z.boolean(), mode: z.enum(["official_api", "operator_assist", "disabled"]), settings: jsonObject.optional(), secretRef: z.string().max(160).optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.insert(adapterConfigs).values({ ...input, settings: input.settings, updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { displayName: input.displayName, enabled: input.enabled, mode: input.mode, settings: input.settings, secretRef: input.secretRef, updatedAt: new Date() } });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "adapter_configured", targetType: "adapter", details: { adapterKey: input.adapterKey, mode: input.mode, enabled: input.enabled } });
      return { ok: true } as const;
    }),
  }),
  jobs: router({
    enqueue: ownerOnly.input(z.object({ jobType: z.string().min(2).max(100), adapterKey: z.string().max(80).optional(), accountId: z.number().int().positive().optional(), payload: jsonObject.optional() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.insert(automationJobs).values({ ...input, status: "queued", attempts: 0, createdAt: new Date() });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "job_enqueued", targetType: "automation_job", details: { jobType: input.jobType, adapterKey: input.adapterKey } });
      return { ok: true } as const;
    }),
    control: ownerOnly.input(z.object({ id: z.number().int().positive(), status: z.enum(["paused", "cancelled", "queued"]) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.update(automationJobs).set({ status: input.status }).where(eq(automationJobs.id, input.id));
      await writeAuditLog({ actorUserId: ctx.user.id, action: `job_${input.status}`, targetType: "automation_job", targetId: input.id });
      return { ok: true } as const;
    }),
  }),
  notifications: router({
    saveRule: ownerOnly.input(z.object({ id: z.number().int().positive().optional(), channel: z.string().min(2).max(40), targetRef: z.string().max(220).optional(), events: z.array(z.string()).min(1), enabled: z.boolean() })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      if (input.id) await db.update(notificationRules).set({ channel: input.channel, targetRef: input.targetRef, events: input.events, enabled: input.enabled, updatedAt: new Date() }).where(eq(notificationRules.id, input.id));
      else await db.insert(notificationRules).values({ channel: input.channel, targetRef: input.targetRef, events: input.events, enabled: input.enabled, updatedAt: new Date() });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "notification_rule_saved", targetType: "notification_rule", targetId: input.id, details: { channel: input.channel, enabled: input.enabled } });
      return { ok: true } as const;
    }),
  }),
  owner: router({
    savePrompt: ownerOnly.input(z.object({ prompt: z.string().min(20).max(10000) })).mutation(async ({ ctx, input }) => {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.insert(appSettings).values({ settingKey: "conversation_prompt", settingValue: input.prompt, updatedBy: ctx.user.id, updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { settingValue: input.prompt, updatedBy: ctx.user.id, updatedAt: new Date() } });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "prompt_updated", targetType: "setting", details: { settingKey: "conversation_prompt" } });
      return { ok: true } as const;
    }),
  }),
  apiClients: router({
    list: ownerOnly.query(() => listApiClients()),
    create: ownerOnly.input(z.object({ name: z.string().min(2).max(120), scopes: z.array(z.enum(API_SCOPES)).min(1) })).mutation(async ({ ctx, input }) => {
      const generated = createApiKey();
      await saveApiClient({ name: input.name, keyPrefix: generated.keyPrefix, keyHash: generated.keyHash, scopes: input.scopes, createdBy: ctx.user.id });
      await writeAuditLog({ actorUserId: ctx.user.id, action: "api_client_created", targetType: "api_client", details: { name: input.name, scopes: input.scopes } });
      return { ok: true, token: generated.token, keyPrefix: generated.keyPrefix } as const;
    }),
    revoke: ownerOnly.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await revokeApiClient(input.id, ctx.user.id);
      await writeAuditLog({ actorUserId: ctx.user.id, action: "api_client_revoked", targetType: "api_client", targetId: input.id });
      return { ok: true } as const;
    }),
  }),
  proxies: router({
    save: ownerOnly.input(z.object({ accountId: z.number().int().positive(), label: z.string().min(2).max(120), protocol: z.enum(["http", "https", "socks5"]), host: z.string().min(3).max(255), port: z.number().int().min(1).max(65535), username: z.string().max(160).optional(), secretRef: z.string().max(160).optional(), enabled: z.boolean() })).mutation(async ({ ctx, input }) => {
      await saveProxyRoute(input);
      await writeAuditLog({ actorUserId: ctx.user.id, action: "proxy_route_saved", targetType: "proxy_route", targetId: input.accountId, details: { label: input.label, protocol: input.protocol, enabled: input.enabled } });
      return { ok: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
