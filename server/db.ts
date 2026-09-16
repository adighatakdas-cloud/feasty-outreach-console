import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  abExperiments,
  accountHealth,
  adapterConfigs,
  apiClients,
  appSettings,
  auditLogs,
  automationJobs,
  campaigns,
  conversations,
  doNotContact,
  leads,
  learningEvents,
  messageTemplates,
  notificationRules,
  proxyRoutes,
  sendingAccounts,
  users,
  workspaceConfig,
  type InsertAuditLog,
  type InsertCampaign,
  type InsertLead,
  type InsertSendingAccount,
  type InsertUser,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let dbInstance: ReturnType<typeof drizzle> | null = null;
let pool: Pool | null = null;

export async function getDb() {
  if (!dbInstance && process.env.DATABASE_URL) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL, max: Number(process.env.DB_POOL_MAX ?? 10), ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
      dbInstance = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      dbInstance = null;
    }
  }
  return dbInstance;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) {
    values.role = user.role ?? "admin";
    updateSet.role = values.role;
  }
  await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listSendingAccounts() { const db = await getDb(); return db ? db.select().from(sendingAccounts).orderBy(sendingAccounts.id) : []; }
export async function listAccountHealth() { const db = await getDb(); return db ? db.select().from(accountHealth).orderBy(desc(accountHealth.updatedAt)) : []; }
export async function listLeads() { const db = await getDb(); return db ? db.select().from(leads).orderBy(desc(leads.scrapedAt)).limit(200) : []; }
export async function listDoNotContact() { const db = await getDb(); return db ? db.select().from(doNotContact).orderBy(desc(doNotContact.createdAt)) : []; }
export async function listCampaigns() { const db = await getDb(); return db ? db.select().from(campaigns).orderBy(desc(campaigns.updatedAt)) : []; }
export async function listConversations() { const db = await getDb(); return db ? db.select().from(conversations).orderBy(desc(conversations.updatedAt)).limit(100) : []; }
export async function listAuditLogs() { const db = await getDb(); return db ? db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100) : []; }
export async function listJobs() { const db = await getDb(); return db ? db.select().from(automationJobs).orderBy(desc(automationJobs.createdAt)).limit(100) : []; }
export async function listAdapters() { const db = await getDb(); return db ? db.select().from(adapterConfigs).orderBy(adapterConfigs.displayName) : []; }
export async function listTemplates() { const db = await getDb(); return db ? db.select().from(messageTemplates).orderBy(desc(messageTemplates.updatedAt)) : []; }
export async function listExperiments() { const db = await getDb(); return db ? db.select().from(abExperiments).orderBy(desc(abExperiments.updatedAt)) : []; }
export async function listNotificationRules() { const db = await getDb(); return db ? db.select().from(notificationRules).orderBy(notificationRules.channel) : []; }
export async function listWorkspaceConfig() { const db = await getDb(); return db ? db.select().from(workspaceConfig).orderBy(workspaceConfig.section) : []; }
export async function listLearningEvents() { const db = await getDb(); return db ? db.select().from(learningEvents).orderBy(desc(learningEvents.createdAt)).limit(200) : []; }
export async function listApiClients() { const db = await getDb(); return db ? db.select({ id: apiClients.id, name: apiClients.name, keyPrefix: apiClients.keyPrefix, scopes: apiClients.scopes, enabled: apiClients.enabled, createdAt: apiClients.createdAt, lastUsedAt: apiClients.lastUsedAt, revokedAt: apiClients.revokedAt }).from(apiClients).orderBy(desc(apiClients.createdAt)) : []; }
export async function listProxyRoutes() { const db = await getDb(); return db ? db.select().from(proxyRoutes).orderBy(proxyRoutes.accountId) : []; }
export async function getPrompt() { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(appSettings).where(eq(appSettings.settingKey, "conversation_prompt")).limit(1); return result[0]; }
export async function createLead(lead: InsertLead) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(leads).values(lead); }
export async function saveDoNotContact(input: { username: string; reason: string; source?: string; createdBy?: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(doNotContact).values({ username: input.username, reason: input.reason, source: input.source ?? "operator", createdBy: input.createdBy, createdAt: new Date() }).onConflictDoUpdate({ target: doNotContact.username, set: { reason: input.reason, source: input.source ?? "operator" } }); }
export async function createCampaign(campaign: InsertCampaign) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(campaigns).values(campaign); }
export async function updateAccount(accountId: number, values: Partial<InsertSendingAccount>) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(sendingAccounts).set(values).where(eq(sendingAccounts.id, accountId)); }
export async function writeAuditLog(event: InsertAuditLog) { const db = await getDb(); if (!db) return; await db.insert(auditLogs).values(event); }
export async function recordLearningEvent(input: { eventType: string; entityType: string; entityId: number; predictedLabel?: string; finalLabel: string; confidence?: number; features?: Record<string, unknown>; createdBy?: number }) { const db = await getDb(); if (!db) return; await db.insert(learningEvents).values({ ...input, createdAt: new Date() }); }
export async function saveApiClient(input: { name: string; keyPrefix: string; keyHash: string; scopes: string[]; createdBy: number }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(apiClients).values({ ...input, scopes: input.scopes, createdAt: new Date() }); }
export async function revokeApiClient(id: number, actorUserId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.update(apiClients).set({ enabled: false, revokedAt: new Date() }).where(eq(apiClients.id, id)); }
export async function saveProxyRoute(input: { accountId: number; label: string; protocol: "http" | "https" | "socks5"; host: string; port: number; username?: string; secretRef?: string; enabled: boolean }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); return db.insert(proxyRoutes).values({ ...input, updatedAt: new Date() }).onConflictDoUpdate({ target: proxyRoutes.accountId, set: { ...input, updatedAt: new Date() } }); }
export async function findApiClientByHash(keyHash: string) { const db = await getDb(); if (!db) return undefined; const result = await db.select().from(apiClients).where(eq(apiClients.keyHash, keyHash)).limit(1); return result[0]; }
export async function markApiClientUsed(id: number) { const db = await getDb(); if (!db) return; await db.update(apiClients).set({ lastUsedAt: new Date() }).where(eq(apiClients.id, id)); }
export async function healthCheck() { const db = await getDb(); return { database: db ? "connected" : "unavailable" as const, mode: "live-data" as const }; }
