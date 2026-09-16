import type { Express, RequestHandler } from "express";
import { z } from "zod";
import { automationJobs } from "../drizzle/schema";
import { findApiClientByHash, getDb, listCampaigns, listLeads, listSendingAccounts, markApiClientUsed } from "./db";
import { hashApiKey, readBearerToken, type ApiScope } from "./api-keys";

const jobBody = z.object({
  jobType: z.string().min(2).max(100),
  adapterKey: z.string().max(80).optional(),
  accountId: z.number().int().positive().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

function requireScope(scope: ApiScope): RequestHandler {
  return async (req, res, next) => {
    try {
      const token = readBearerToken(req.header("authorization"));
      const client = token ? await findApiClientByHash(hashApiKey(token)) : undefined;
      const scopes = Array.isArray(client?.scopes) ? client.scopes : [];
      if (!client || !client.enabled || client.revokedAt || !scopes.includes(scope)) {
        res.status(401).json({ error: "unauthorized", message: "A valid API key with the required scope is required." });
        return;
      }
      void markApiClientUsed(client.id);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function registerApiRoutes(app: Express) {
  app.get("/api/v1/health", (_req, res) => {
    res.json({ service: "feasty-outreach-suite", version: "v1", status: "ok" });
  });

  app.get("/api/v1/leads", requireScope("read"), async (req, res, next) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit ?? 100), 1), 200);
      const leads = (await listLeads()).slice(0, limit);
      res.json({ data: leads, count: leads.length });
    } catch (error) { next(error); }
  });

  app.get("/api/v1/campaigns", requireScope("read"), async (_req, res, next) => {
    try { res.json({ data: await listCampaigns() }); } catch (error) { next(error); }
  });

  app.get("/api/v1/accounts", requireScope("read"), async (_req, res, next) => {
    try { res.json({ data: await listSendingAccounts() }); } catch (error) { next(error); }
  });

  app.post("/api/v1/jobs", requireScope("write"), async (req, res, next) => {
    try {
      const input = jobBody.parse(req.body);
      const db = await getDb();
      if (!db) { res.status(503).json({ error: "database_unavailable" }); return; }
      const [result] = await db.insert(automationJobs).values({ ...input, status: "queued", attempts: 0, createdAt: new Date() }).returning({ id: automationJobs.id });
      res.status(202).json({ accepted: true, jobId: result.id });
    } catch (error) {
      if (error instanceof z.ZodError) { res.status(400).json({ error: "invalid_request", issues: error.issues }); return; }
      next(error);
    }
  });
}
