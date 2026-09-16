import { describe, expect, it } from "vitest";
import { cancelJob, completeJob, leaseJob, pauseJob, renewLease, resumeJob, type DurableJob } from "./durable-worker";

const now = new Date("2026-09-16T10:00:00.000Z");
const queued: DurableJob = { id: 4, status: "queued", attempts: 0, runAfter: null, leaseOwner: null, leaseExpiresAt: null };

describe("durable worker state machine", () => {
  it("leases a queued job with a correlation id", () => {
    const result = leaseJob(queued, "worker-a", now, 60_000);
    expect(result.ok).toBe(true);
    expect(result.job).toMatchObject({ status: "running", attempts: 1, leaseOwner: "worker-a", correlationId: "job:4:attempt:1" });
  });

  it("recovers an expired lease", () => {
    const result = leaseJob({ ...queued, status: "running", attempts: 1, leaseOwner: "dead-worker", leaseExpiresAt: new Date("2026-09-16T09:59:00.000Z") }, "worker-b", now);
    expect(result.ok).toBe(true); expect(result.reason).toContain("recovered"); expect(result.job.attempts).toBe(2);
  });

  it("prevents a different worker from renewing or completing", () => {
    const running = leaseJob(queued, "worker-a", now).job;
    expect(renewLease(running, "worker-b", now).ok).toBe(false);
    expect(completeJob(running, "worker-b", { status: "succeeded" }, now).ok).toBe(false);
  });

  it("schedules a retry without losing the correlation id", () => {
    const running = leaseJob(queued, "worker-a", now).job;
    const result = completeJob(running, "worker-a", { status: "failed", errorCode: "temporary", retryAt: new Date("2026-09-16T10:05:00.000Z") }, now);
    expect(result.job).toMatchObject({ status: "queued", runAfter: new Date("2026-09-16T10:05:00.000Z"), correlationId: "job:4:attempt:1", lastErrorCode: "temporary" });
  });

  it("pauses, resumes, and cancels only valid states", () => {
    const running = leaseJob(queued, "worker-a", now).job;
    const paused = pauseJob(running).job;
    expect(paused.status).toBe("paused");
    expect(resumeJob(paused).job.status).toBe("queued");
    expect(cancelJob(running).job.status).toBe("cancelled");
    expect(cancelJob({ ...queued, status: "succeeded" }).ok).toBe(false);
  });

  it("completes exactly once from the active owner", () => {
    const running = leaseJob(queued, "worker-a", now).job;
    const done = completeJob(running, "worker-a", { status: "succeeded" }, now);
    expect(done.job.status).toBe("succeeded");
    expect(completeJob(done.job, "worker-a", { status: "succeeded" }, now).ok).toBe(false);
  });
});
