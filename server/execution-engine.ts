import { completeJob, leaseJob, type DurableJob } from "./durable-worker";

export type ExecutionJob = DurableJob & {
  jobType: string;
  adapterKey?: string | null;
  accountId?: number | null;
  payload?: unknown;
  startedAt?: Date | null;
};

export type RouteState = "available" | "degraded" | "disabled";
export type ExecutionRoute = {
  id: number;
  accountId: number;
  label: string;
  protocol: "http" | "https" | "socks5";
  host: string;
  port: number;
  secretRef?: string | null;
  enabled: boolean;
  state?: RouteState;
  lastError?: string | null;
};

export type RouteAttempt = { routeId: number; attemptedAt: Date; error?: string };

export type Candidate = {
  username: string;
  displayName?: string;
  bio?: string;
  source: string;
  consentBasis: string;
  followers?: number;
  verified?: boolean;
  metadata?: Record<string, unknown>;
};

export type CollectionResult = {
  status: "complete" | "rate_limited" | "challenge" | "error";
  candidates: Candidate[];
  routeAttempts: RouteAttempt[];
  message?: string;
};

export type SendResult = {
  status: "sent" | "blocked" | "challenge" | "rate_limited" | "error" | "dry_run";
  providerMessageId?: string;
  routeAttempts: RouteAttempt[];
  message?: string;
};

export type ExecutionContext = {
  now: Date;
  job: ExecutionJob;
  route?: ExecutionRoute;
};

export type CollectionAdapter = {
  key: string;
  collect(context: ExecutionContext): Promise<CollectionResult>;
};

export type SendAdapter = {
  key: string;
  send(context: ExecutionContext): Promise<SendResult>;
};

export type ExecutionAdapter = CollectionAdapter | SendAdapter;

export type WorkerStore = {
  listRunnableJobs(now: Date): Promise<ExecutionJob[]>;
  updateJob(jobId: number, patch: Partial<ExecutionJob>): Promise<void>;
  listRoutes(accountId: number): Promise<ExecutionRoute[]>;
  recordRouteFailure(routeId: number, error: string, now: Date): Promise<void>;
  recordRouteSuccess(routeId: number, now: Date): Promise<void>;
};

export type WorkerCycleResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  jobResults: Array<{ jobId: number; status: "succeeded" | "failed" | "skipped"; reason: string }>;
};

export function selectRoutes(routes: ExecutionRoute[], attempted: Set<number>): ExecutionRoute[] {
  return routes
    .filter((route) => route.enabled && route.state !== "disabled" && !attempted.has(route.id))
    .sort((a, b) => {
      const stateRank = (state?: RouteState) => state === "available" || !state ? 0 : state === "degraded" ? 1 : 2;
      return stateRank(a.state) - stateRank(b.state) || a.id - b.id;
    });
}

export function isCollectionAdapter(adapter: ExecutionAdapter): adapter is CollectionAdapter {
  return "collect" in adapter;
}

export function isSendAdapter(adapter: ExecutionAdapter): adapter is SendAdapter {
  return "send" in adapter;
}

export class ExecutionRegistry {
  private readonly adapters = new Map<string, ExecutionAdapter>();

  register(adapter: ExecutionAdapter) {
    this.adapters.set(adapter.key, adapter);
    return this;
  }

  get(key: string | null | undefined) {
    return key ? this.adapters.get(key) : undefined;
  }
}

export const dryRunCollectionAdapter: CollectionAdapter = {
  key: "authorized_import_dry_run",
  async collect({ job }) {
    const payload = (job.payload ?? {}) as { candidates?: Candidate[] };
    return { status: "complete", candidates: payload.candidates ?? [], routeAttempts: [], message: "Dry-run collection completed without external traffic." };
  },
};

export const dryRunSendAdapter: SendAdapter = {
  key: "send_dry_run",
  async send({ job }) {
    const payload = (job.payload ?? {}) as { providerMessageId?: string };
    return { status: "dry_run", providerMessageId: payload.providerMessageId ?? `dry-run:${job.id}`, routeAttempts: [], message: "Dry-run send completed without external traffic." };
  },
};

async function executeWithRouteFailover(
  store: WorkerStore,
  job: ExecutionJob,
  routes: ExecutionRoute[],
  execute: (route?: ExecutionRoute) => Promise<CollectionResult | SendResult>,
  now: Date,
) {
  if (routes.length === 0) return execute(undefined);
  const attempts = new Set<number>();
  let lastResult: CollectionResult | SendResult = { status: "error", routeAttempts: [], message: "No route was available." };
  for (const route of selectRoutes(routes, attempts)) {
    attempts.add(route.id);
    try {
      const result = await execute(route);
      if (!["error", "rate_limited", "challenge", "blocked"].includes(result.status)) {
        await store.recordRouteSuccess(route.id, now);
        return result;
      }
      lastResult = { ...result, routeAttempts: [...result.routeAttempts, { routeId: route.id, attemptedAt: now, error: result.message }] };
      await store.recordRouteFailure(route.id, result.message ?? result.status, now);
      if (result.status === "challenge" || result.status === "blocked") break;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Adapter execution failed.";
      lastResult = { status: "error", routeAttempts: [{ routeId: route.id, attemptedAt: now, error: message }], message };
      await store.recordRouteFailure(route.id, message, now);
    }
  }
  return lastResult;
}

export async function runWorkerCycle(store: WorkerStore, registry: ExecutionRegistry, workerId: string, now = new Date()): Promise<WorkerCycleResult> {
  const jobs = await store.listRunnableJobs(now);
  const result: WorkerCycleResult = { processed: 0, succeeded: 0, failed: 0, skipped: 0, jobResults: [] };
  for (const job of jobs) {
    const leased = leaseJob(job, workerId, now);
    if (!leased.ok) {
      result.skipped++;
      result.jobResults.push({ jobId: job.id, status: "skipped", reason: leased.reason });
      continue;
    }
    await store.updateJob(job.id, leased.job);
    const adapter = registry.get(job.adapterKey);
    if (!adapter || (job.jobType.startsWith("collect") && !isCollectionAdapter(adapter)) || (job.jobType.startsWith("send") && !isSendAdapter(adapter))) {
      const done = completeJob(leased.job, workerId, { status: "failed", errorCode: "adapter_unavailable", error: "No compatible enabled adapter is registered." }, now);
      await store.updateJob(job.id, done.job);
      result.processed++;
      result.failed++;
      result.jobResults.push({ jobId: job.id, status: "failed", reason: "adapter_unavailable" });
      continue;
    }
    const routes = job.accountId ? await store.listRoutes(job.accountId) : [];
    const execution = isCollectionAdapter(adapter)
      ? await executeWithRouteFailover(store, job, routes, (route) => adapter.collect({ now, job, route }), now)
      : await executeWithRouteFailover(store, job, routes, (route) => adapter.send({ now, job, route }), now);
    const successful = ["complete", "sent", "dry_run"].includes(execution.status);
    const done = completeJob(leased.job, workerId, successful ? { status: "succeeded" } : { status: "failed", errorCode: execution.status, error: execution.message ?? execution.status }, now);
    await store.updateJob(job.id, done.job);
    result.processed++;
    if (successful) {
      result.succeeded++;
      result.jobResults.push({ jobId: job.id, status: "succeeded", reason: execution.message ?? execution.status });
    } else {
      result.failed++;
      result.jobResults.push({ jobId: job.id, status: "failed", reason: execution.message ?? execution.status });
    }
  }
  return result;
}
