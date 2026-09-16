import { describe, expect, it } from "vitest";
import { getLearningReadiness } from "./learning-stages";

describe("learning stage governance", () => {
  it("starts in capture and recommends only from observed event volume", () => {
    expect(getLearningReadiness(0, "capture")).toMatchObject({ recommendedStage: "capture", canAdvance: false });
    expect(getLearningReadiness(12, "capture")).toMatchObject({ recommendedStage: "review", canAdvance: true });
  });

  it("requires approval for later stages", () => {
    expect(getLearningReadiness(60, "review", false)).toMatchObject({ recommendedStage: "shadow", canAdvance: false });
    expect(getLearningReadiness(60, "review", true)).toMatchObject({ recommendedStage: "shadow", canAdvance: true });
  });

  it("caps recommendations at the approved active stage", () => {
    expect(getLearningReadiness(999, "controlled", true)).toMatchObject({ recommendedStage: "active", canAdvance: true });
  });
});
