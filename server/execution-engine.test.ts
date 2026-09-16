import { describe, expect, it } from "vitest";
import {
  dryRunCollectionAdapter,
  dryRunSendAdapter,
  ExecutionRegistry,
  runWorkerCycle,
  selectRoutes,
  type ExecutionJob,
  type ExecutionRoute,
  type WorkerStore,
} from "./execution-engine";

const now = new Date("2026-09-16T12:00:00.000Z");
const route = (id: number, state: ExecutionRoute["state"] = "available"): ExecutionRoute => ({ id, accountId: 7, label: `route-${id}`, protocol: "https", host: `proxy-${id}.example`, port: 443, enabled: true, state });

function createStore(jobs: ExecutionJob[], routes: ExecutionRoute[] = []) {
  const updates: Array<{ id: number; patch: Partial<ExecutionJob> }> = [];
  const failures: Array<{ routeId: number; error: string }> = [];
  const successes: number[] = [];
  const store: WorkerStore = {
    async listRunnableJobs() { return jobs; },
    async updateJob(id, patch) { updates.push({ id, patch }); const index = jobs.findIndex((job) => job.id === id); if (index >= 0) jobs[index] = { ...jobs[index], ...patch }; },
    async listRoutes() { return routes; },
    async recordRouteFailure(routeId, error) { failures.push({ routeId, error }); },
    async recordRouteSuccess(routeId) { successes.push(routeId); },
  };
  return { store, updates, failures, successes };
}

describe("execution engine", () => {
  it("orders healthy routes before degraded routes and ignores disabled routes", () => {
    expect(selectRoutes([route(3, "degraded"), route(2, "available"), { ...route(1), enabled: false }], new Set())).toMatchObject([{ id: 2 }, { id: 3 }]);
  });

  it("executes a collection dry run without external traffic", async () => {
    const job: ExecutionJob = { id: 1, jobType: "collect_research", adapterKey: "authorized_import_dry_run", status: "queued", attempts: 0, payload: { candidates: [{ username: "@truck", source: "authorized_import", consentBasis: "operator supplied" }] } };
    const { store, updates } = createStore([job]);
    const result = await runWorkerCycle(store, new ExecutionRegistry().register(dryRunCollectionAdapter), "worker-test", now);
    expect(result).toMatchObject({ processed: 1, succeeded: 1, failed: 0 });
    expect(updates.at(-1)?.patch).toMatchObject({ status: "succeeded" });
  });

  it("fails closed when a compatible adapter is unavailable", async () => {
    const job: ExecutionJob = { id: 2, jobType: "send_message", adapterKey: "instagram_unconfigured", accountId: 7, status: "queued", attempts: 0 };
    const { store, updates } = createStore([job], [route(1)]);
    const result = await runWorkerCycle(store, new ExecutionRegistry(), "worker-test", now);
    expect(result.jobResults[0]).toMatchObject({ status: "failed", reason: "adapter_unavailable" });
    expect(updates.at(-1)?.patch).toMatchObject({ status: "failed", lastErrorCode: "adapter_unavailable" });
  });

  it("uses bounded route failover for transient adapter failures", async () => {
    const job: ExecutionJob = { id: 3, jobType: "send_message", adapterKey: "flaky_send", accountId: 7, status: "queued", attempts: 0 };
    const { store, failures, successes } = createStore([job], [route(1), route(2)]);
    let calls = 0;
    const flaky = { key: "flaky_send", async send({ route: selected }: { route?: ExecutionRoute }) { calls++; return calls === 1 ? { status: "error" as const, routeAttempts: [], message: `failed route ${selected?.id}` } : { status: "sent" as const, routeAttempts: [], providerMessageId: "provider-1" }; } };
    const result = await runWorkerCycle(store, new ExecutionRegistry().register(flaky), "worker-test", now);
    expect(result).toMatchObject({ processed: 1, succeeded: 1 });
    expect(calls).toBe(2);
    expect(failures).toEqual([{ routeId: 1, error: "failed route 1" }]);
    expect(successes).toEqual([2]);
  });

  it("executes a send dry run and never needs a proxy route", async () => {
    const job: ExecutionJob = { id: 4, jobType: "send_message", adapterKey: "send_dry_run", status: "queued", attempts: 0 };
    const { store } = createStore([job]);
    const result = await runWorkerCycle(store, new ExecutionRegistry().register(dryRunSendAdapter), "worker-test", now);
    expect(result.jobResults[0]).toMatchObject({ status: "succeeded" });
  });
});
