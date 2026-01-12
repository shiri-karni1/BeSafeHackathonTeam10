import { createBaseSchema, SAFETY_CATEGORIES } from "../baseResponseSchema.js";

export const SAFETY_RESULT_SCHEMA = createBaseSchema(
  "safety_evaluation",
  SAFETY_CATEGORIES,
  {
    suggestedResponse: {
      type: ["string", "null"],
      description: "When blocked: a gentle, supportive alternative message the user could send instead"
    },
  }
);
