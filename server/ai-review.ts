import { invokeLLM } from "./_core/llm";

export type QualificationSuggestion = {
  verdict: "qualified" | "unqualified" | "partial";
  confidence: number;
  reasons: string[];
};

export async function suggestQualification(input: { username: string; displayName?: string; bio?: string; source: string; followers?: number }) {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are a cautious lead-qualification reviewer for an internal outreach team. Return only JSON. Do not invent facts. Use partial when the profile lacks enough evidence. Never make a final outreach decision." },
      { role: "user", content: JSON.stringify(input) },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "qualification_suggestion",
        strict: true,
        schema: {
          type: "object",
          properties: {
            verdict: { type: "string", enum: ["qualified", "unqualified", "partial"] },
            confidence: { type: "integer", minimum: 0, maximum: 100 },
            reasons: { type: "array", items: { type: "string" } },
          },
          required: ["verdict", "confidence", "reasons"],
          additionalProperties: false,
        },
      },
    },
  });
  const content = response.choices?.[0]?.message?.content;
  const raw = typeof content === "string" ? content : "";
  try {
    const parsed = JSON.parse(raw) as QualificationSuggestion;
    if (!["qualified", "unqualified", "partial"].includes(parsed.verdict)) throw new Error("Invalid verdict");
    return { verdict: parsed.verdict, confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)), reasons: Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 5) : [] } satisfies QualificationSuggestion;
  } catch {
    return { verdict: "partial", confidence: 0, reasons: ["The AI response could not be validated; operator review is required."] } satisfies QualificationSuggestion;
  }
}
