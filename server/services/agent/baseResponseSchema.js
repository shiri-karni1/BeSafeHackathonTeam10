/**
 * Base response schema shared by both Safety and Verification agents.
 * Both return: isSafe, reason, category (plus their specific fields)
 */

// Safety categories
export const SAFETY_CATEGORIES = [
  "Bullying/Harassment",
  "Self-Harm/Suicide",
  "Eating Disorders",
  "Sexual Content",
  "PII",
  "Medical Misinformation",
  "Safe",
  "Error",
];

// Verification categories
export const VERIFICATION_CATEGORIES = [
  "Accurate",
  "Contradicts Trusted Source",
  "Not Supported by Trusted Source",
  "Potentially Harmful Medical Advice",
  "Unclear",
  "Error",
  "Age Gap / Power Imbalance",
  "Potential Grooming Risk",
  "Risky Relationship Dynamics",
  "Authority Figure Involved",
  "Emotional Manipulation Risk",
  "Unequal Emotional Maturity",
  "Dependency Risk",
  "Boundary Concerns",
  "Pressure to Move Too Fast",
  "Isolation From Friends or Family",
  "Peer Pressure Risk",
  "Risky Social Situation",
  "Substance Pressure",
  "Party Safety Concern",
  "Loss of Control Risk",
  "Encouraging Risky Behavior",
  "Normalization of Harmful Behavior",
  "Consent Gray Area",
  "Ambiguous Consent Situation",
  "Pressure Around Sexual Activity",
  "Readiness Unclear",
  "Emotional Safety Concern",
  "Intimacy Pressure",
  "Lack of Informed Consent",
  "Unhealthy Body Image Messaging",
  "Diet Culture Risk",
  "Weight Fixation Concern",
  "Food Restriction Warning",
  "Appearance Pressure",
  "Comparison Pressure",
  "Self-Esteem Risk",
  "Emotional Vulnerability",
  "Distress Signals",
  "Lack of Support System",
  "Normalization of Emotional Pain",
  "Avoidance of Help-Seeking",
  "Unhealthy Coping Strategy",
  "Impulsive Decision Making",
  "Long-Term Consequences Unclear",
  "Lack of Adult Guidance",
  "Overconfidence Risk",
  "Life Experience Gap",
  "Potential Harm – Context Dependent",
  "Situational Risk",
  "Requires Careful Consideration",
  "Sensitive Topic – Caution Advised",
  "Complex Situation",
];

/**
 * Creates a base schema with common fields (isSafe, reason, category)
 * and allows adding specific fields for each agent
 */
export const createBaseSchema = (name, categories, additionalProperties = {}) => {
  return {
    name,
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        isSafe: {
          type: "boolean",
          description: "Whether the content is safe (true = safe/allow, false = unsafe/block)"
        },
        reason: {
          type: ["string", "null"],
          description: "Internal reason for the decision"
        },
        category: {
          type: "string",
          enum: categories,
        },
        ...additionalProperties,
      },
      required: ["isSafe", "reason", "category", ...Object.keys(additionalProperties)],
    },
  };
};
