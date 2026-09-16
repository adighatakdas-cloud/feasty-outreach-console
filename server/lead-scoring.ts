export type LeadFeatures = {
  followers: number;
  engagementRate: number;
  postingFrequency30d: number;
  locationMatch: number;
  keywordMatch: number;
  verified: number;
};

export type LeadLabel = "positive" | "negative";
export type ScoringWeights = LeadFeatures & { bias: number; modelVersion: string };
export type LeadScore = { score: number; probability: number; label: "high" | "medium" | "low"; reasons: string[]; modelVersion: string };

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const normalizeFollowers = (followers: number) => clamp(Math.log10(Math.max(1, followers)) / 6);

export function featurize(input: { followers?: number | null; engagementRate?: number | null; postingFrequency30d?: number | null; locationMatch?: boolean | null; keywordMatch?: boolean | null; verified?: boolean | null }): LeadFeatures {
  return {
    followers: normalizeFollowers(input.followers ?? 0),
    engagementRate: clamp((input.engagementRate ?? 0) / 100),
    postingFrequency30d: clamp((input.postingFrequency30d ?? 0) / 30),
    locationMatch: input.locationMatch ? 1 : 0,
    keywordMatch: input.keywordMatch ? 1 : 0,
    verified: input.verified ? 1 : 0,
  };
}

export const baselineWeights: ScoringWeights = {
  followers: 0.18,
  engagementRate: 0.24,
  postingFrequency30d: 0.14,
  locationMatch: 0.18,
  keywordMatch: 0.2,
  verified: 0.06,
  bias: -0.48,
  modelVersion: "baseline-v1",
};

function sigmoid(value: number) { return 1 / (1 + Math.exp(-value)); }

export function scoreLead(features: LeadFeatures, weights = baselineWeights): LeadScore {
  const keys: Array<keyof LeadFeatures> = ["followers", "engagementRate", "postingFrequency30d", "locationMatch", "keywordMatch", "verified"];
  const raw = weights.bias + keys.reduce((sum, key) => sum + features[key] * weights[key], 0);
  const probability = sigmoid(raw * 5);
  const reasons = keys.filter((key) => features[key] >= 0.7 && weights[key] >= 0.1).map((key) => key);
  return { score: Number(raw.toFixed(4)), probability: Number(probability.toFixed(4)), label: probability >= 0.7 ? "high" : probability >= 0.45 ? "medium" : "low", reasons, modelVersion: weights.modelVersion };
}

export type LabeledExample = { features: LeadFeatures; label: LeadLabel };

/** Fits a small, deterministic perceptron from operator-labeled examples. This is offline/shadow-only until governance approves promotion. */
export function fitPerceptron(examples: LabeledExample[], options: { epochs?: number; learningRate?: number; modelVersion?: string } = {}): ScoringWeights {
  const epochs = Math.max(1, options.epochs ?? 8);
  const rate = Math.max(0.001, Math.min(1, options.learningRate ?? 0.08));
  const weights: ScoringWeights = { ...baselineWeights, modelVersion: options.modelVersion ?? "operator-fit-v1" };
  const keys: Array<keyof LeadFeatures> = ["followers", "engagementRate", "postingFrequency30d", "locationMatch", "keywordMatch", "verified"];
  for (let epoch = 0; epoch < epochs; epoch++) {
    for (const example of examples) {
      const prediction = scoreLead(example.features, weights).probability >= 0.5 ? 1 : 0;
      const expected = example.label === "positive" ? 1 : 0;
      const error = expected - prediction;
      if (error === 0) continue;
      weights.bias += error * rate;
      for (const key of keys) weights[key] += error * rate * example.features[key];
    }
  }
  return weights;
}
