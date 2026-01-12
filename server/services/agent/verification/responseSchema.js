import { createBaseSchema, VERIFICATION_CATEGORIES } from "../baseResponseSchema.js";

export const VERIFICATION_SCHEMA = createBaseSchema(
  "answer_verification",
  VERIFICATION_CATEGORIES,
  {
    additionalInfo: {
      type: ["string", "null"],
      description: "Additional context, clarification, or educational info to display alongside the message. Null if no info needed."
    },
    shouldAttachReference: {
      type: "boolean",
      description:
        "Whether a reference to the trusted source should be attached (true = attach source reference, false = no reference needed).",
    },
    referenceNote: {
      type: ["string", "null"],
      description:
        "Optional note about why this source is being referenced (e.g., 'for clarification', 'contradicts this claim', 'provides safer alternatives').",
    },
  }
);
