import { createBaseSchema, VERIFICATION_CATEGORIES } from "../baseResponseSchema.js";

export const VERIFICATION_SCHEMA = createBaseSchema(
  "answer_verification",
  VERIFICATION_CATEGORIES,
  {
    confidence: { 
      type: "number", 
      minimum: 0, 
      maximum: 1 
    },
  }
);
