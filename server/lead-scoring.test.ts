import { describe, expect, it } from "vitest";
import { baselineWeights, featurize, fitPerceptron, scoreLead } from "./lead-scoring";

describe("lead scoring", () => {
  it("featurizes raw lead signals into bounded values", () => {
    expect(featurize({ followers: 10000, engagementRate: 8, postingFrequency30d: 15, locationMatch: true, keywordMatch: true, verified: false })).toMatchObject({ engagementRate: 0.08, postingFrequency30d: 0.5, locationMatch: 1, keywordMatch: 1, verified: 0 });
  });

  it("returns a transparent score with reasons and a model version", () => {
    const result = scoreLead({ followers: 1, engagementRate: 1, postingFrequency30d: 1, locationMatch: 1, keywordMatch: 1, verified: 1 });
    expect(result.modelVersion).toBe(baselineWeights.modelVersion);
    expect(result.reasons).toContain("keywordMatch");
    expect(result.probability).toBeGreaterThan(0.5);
  });

  it("fits a deterministic operator-labeled model offline", () => {
    const positive = { followers: 1, engagementRate: 1, postingFrequency30d: 1, locationMatch: 1, keywordMatch: 1, verified: 1 };
    const negative = { followers: 0, engagementRate: 0, postingFrequency30d: 0, locationMatch: 0, keywordMatch: 0, verified: 0 };
    const weights = fitPerceptron([{ features: positive, label: "positive" }, { features: negative, label: "negative" }], { modelVersion: "shadow-test-v1" });
    expect(weights.modelVersion).toBe("shadow-test-v1");
    expect(scoreLead(positive, weights).probability).toBeGreaterThan(scoreLead(negative, weights).probability);
  });
});
