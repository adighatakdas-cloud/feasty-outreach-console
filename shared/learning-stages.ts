export type LearningStageKey = "capture" | "review" | "evaluate" | "shadow" | "controlled" | "active";
export type LearningStage = { key: LearningStageKey; label: string; description: string; minimumEvents: number; requiresApproval: boolean };
export const learningStages: LearningStage[] = [
  { key: "capture", label: "Capture outcomes", description: "Collect operator labels and real outcomes without changing automation.", minimumEvents: 0, requiresApproval: false },
  { key: "review", label: "Review labels", description: "Inspect corrections, opt-outs, bookings, and classification quality.", minimumEvents: 10, requiresApproval: true },
  { key: "evaluate", label: "Evaluate offline", description: "Run a protected evaluation set and compare model or prompt versions.", minimumEvents: 25, requiresApproval: true },
  { key: "shadow", label: "Shadow mode", description: "Generate predictions beside the live workflow without taking action.", minimumEvents: 50, requiresApproval: true },
  { key: "controlled", label: "Controlled rollout", description: "Enable an approved version for a small operator-selected slice.", minimumEvents: 100, requiresApproval: true },
  { key: "active", label: "Approved active", description: "Use the approved version within configured governance and rollback controls.", minimumEvents: 250, requiresApproval: true },
];
export type LearningReadiness = { eventCount: number; currentStage: LearningStageKey; recommendedStage: LearningStageKey; canAdvance: boolean; reason: string };
export function getLearningReadiness(eventCount: number, currentStage: LearningStageKey, approved = false): LearningReadiness {
  const safeCount = Math.max(0, eventCount); const currentIndex = learningStages.findIndex((stage) => stage.key === currentStage); const next = learningStages[Math.min(Math.max(currentIndex, 0) + 1, learningStages.length - 1)]; const recommended = [...learningStages].reverse().find((stage) => safeCount >= stage.minimumEvents) ?? learningStages[0]; const canAdvance = currentStage === "capture" ? safeCount >= next.minimumEvents : approved && safeCount >= next.minimumEvents;
  return { eventCount: safeCount, currentStage, recommendedStage: recommended.key, canAdvance, reason: canAdvance ? `Ready to consider ${next.label.toLowerCase()}.` : currentStage === "capture" ? `Collect at least ${next.minimumEvents} labeled events before advancing.` : `Approval and ${next.minimumEvents} labeled events are required before advancing.` };
}
