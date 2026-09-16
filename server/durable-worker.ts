export type DurableJobStatus = "queued" | "running" | "succeeded" | "failed" | "paused" | "cancelled";

export type DurableJob = {
  id: number;
  status: DurableJobStatus | string;
  attempts: number;
  runAfter?: Date | null;
  leaseOwner?: string | null;
  leaseExpiresAt?: Date | null;
  correlationId?: string | null;
  finishedAt?: Date | null;
  lastErrorCode?: string | null;
  lastError?: string | null;
};

export type WorkerDecision = { ok: boolean; reason: string; job: DurableJob };

function copy(job: DurableJob, patch: Partial<DurableJob>): DurableJob { return { ...job, ...patch }; }
function canRun(job: DurableJob, now: Date): boolean { return job.status === "queued" && (!job.runAfter || job.runAfter.getTime() <= now.getTime()); }

export function leaseJob(job: DurableJob, workerId: string, now = new Date(), leaseMs = 60_000): WorkerDecision {
  if (!workerId.trim()) return { ok: false, reason: "Worker identity is required.", job };
  const expired = job.status === "running" && !!job.leaseExpiresAt && job.leaseExpiresAt.getTime() <= now.getTime();
  if (!canRun(job, now) && !expired) return { ok: false, reason: `Job is not leasable from ${job.status}.`, job };
  const attempts = job.attempts + 1;
  const correlationId = job.correlationId ?? `job:${job.id}:attempt:${attempts}`;
  return { ok: true, reason: expired ? "Expired lease recovered and renewed." : "Job leased.", job: copy(job, { status: "running", attempts, leaseOwner: workerId, leaseExpiresAt: new Date(now.getTime() + leaseMs), correlationId, lastErrorCode: null, lastError: null }) };
}

export function renewLease(job: DurableJob, workerId: string, now = new Date(), leaseMs = 60_000): WorkerDecision {
  if (job.status !== "running" || job.leaseOwner !== workerId) return { ok: false, reason: "Only the current worker can renew a running lease.", job };
  return { ok: true, reason: "Lease renewed.", job: copy(job, { leaseExpiresAt: new Date(now.getTime() + leaseMs) }) };
}

export function completeJob(job: DurableJob, workerId: string, outcome: { status: "succeeded" | "failed"; errorCode?: string; error?: string; retryAt?: Date }, now = new Date()): WorkerDecision {
  if (job.status !== "running" || job.leaseOwner !== workerId) return { ok: false, reason: "Only the current worker can complete a running lease.", job };
  if (outcome.status === "failed" && outcome.retryAt) return { ok: true, reason: "Failure scheduled for retry.", job: copy(job, { status: "queued", runAfter: outcome.retryAt, leaseOwner: null, leaseExpiresAt: null, lastErrorCode: outcome.errorCode ?? "worker_failed", lastError: outcome.error ?? "Worker failed." }) };
  return { ok: true, reason: `Job ${outcome.status}.`, job: copy(job, { status: outcome.status, finishedAt: now, leaseOwner: null, leaseExpiresAt: null, lastErrorCode: outcome.errorCode ?? null, lastError: outcome.error ?? null }) };
}

export function pauseJob(job: DurableJob): WorkerDecision {
  if (["succeeded", "failed", "cancelled"].includes(job.status)) return { ok: false, reason: `Completed job cannot be paused from ${job.status}.`, job };
  return { ok: true, reason: "Job paused.", job: copy(job, { status: "paused", leaseOwner: null, leaseExpiresAt: null }) };
}

export function resumeJob(job: DurableJob): WorkerDecision {
  if (job.status !== "paused") return { ok: false, reason: "Only paused jobs can be resumed.", job };
  return { ok: true, reason: "Job resumed.", job: copy(job, { status: "queued", runAfter: null }) };
}

export function cancelJob(job: DurableJob): WorkerDecision {
  if (["succeeded", "failed", "cancelled"].includes(job.status)) return { ok: false, reason: `Completed job cannot be cancelled from ${job.status}.`, job };
  return { ok: true, reason: "Job cancelled.", job: copy(job, { status: "cancelled", finishedAt: new Date(), leaseOwner: null, leaseExpiresAt: null }) };
}
