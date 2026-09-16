import "dotenv/config";
import { hostname } from "node:os";
import { dryRunCollectionAdapter, dryRunSendAdapter, ExecutionRegistry, runWorkerCycle } from "./execution-engine";
import { listExecutionRoutes, listRunnableAutomationJobs, recordExecutionRouteFailure, recordExecutionRouteSuccess, updateAutomationJob } from "./db";

const workerId = process.env.WORKER_ID ?? `worker:${hostname()}:${process.pid}`;
const intervalMs = Math.max(1_000, Number(process.env.WORKER_POLL_MS ?? 5_000));
const once = process.env.WORKER_ONCE === "1";
let stopping = false;

const registry = new ExecutionRegistry()
  .register(dryRunCollectionAdapter)
  .register(dryRunSendAdapter);

async function cycle() {
  const result = await runWorkerCycle({
    listRunnableJobs: listRunnableAutomationJobs,
    updateJob: updateAutomationJob,
    listRoutes: listExecutionRoutes,
    recordRouteFailure: recordExecutionRouteFailure,
    recordRouteSuccess: recordExecutionRouteSuccess,
  }, registry, workerId);
  if (result.processed > 0) console.log(JSON.stringify({ event: "worker_cycle", workerId, ...result }));
  return result;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run the worker.");
  }
  console.log(JSON.stringify({ event: "worker_started", workerId, intervalMs, once }));
  do {
    await cycle();
    if (!once && !stopping) await new Promise((resolve) => setTimeout(resolve, intervalMs));
  } while (!once && !stopping);
  console.log(JSON.stringify({ event: "worker_stopped", workerId }));
}

for (const signal of ["SIGINT", "SIGTERM"] as const) process.once(signal, () => { stopping = true; });
main().catch((error) => { console.error(JSON.stringify({ event: "worker_failed", workerId, error: error instanceof Error ? error.message : String(error) })); process.exitCode = 1; });
