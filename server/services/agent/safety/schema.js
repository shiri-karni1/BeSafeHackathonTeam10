export const SAFETY_RESULT_SCHEMA = {
  name: "safety_evaluation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      isSafe: { type: "boolean" },
      feedback: { type: ["string", "null"] },
      reason: { type: ["string", "null"] },
      category: {
        type: "string",
        enum: [
          "Bullying/Harassment",
          "Self-Harm/Suicide",
          "Eating Disorders",
          "Sexual Content",
          "PII",
          "Medical Misinformation",
          "Safe",
          "Error",
        ],
      },
    },
    required: ["isSafe", "feedback", "reason", "category"],
    additionalProperties: false,
  },
};
