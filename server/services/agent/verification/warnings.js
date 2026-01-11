/**
 * Categories that should WARN (publish, but show warning).
 * Must match EXACT string values returned by agent.js (VERIFICATION_SCHEMA enum).
 */
export const WARNING_CATEGORIES = new Set([
  // Relationships / power dynamics
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

  // Consent / intimacy (warn-only bucket; explicit/illegal should be blocked by Safety Gate)
  "Consent Gray Area",
  "Ambiguous Consent Situation",
  "Pressure Around Sexual Activity",
  "Readiness Unclear",
  "Emotional Safety Concern",
  "Intimacy Pressure",
  "Lack of Informed Consent",

  // Body image / dieting (warn-only; severe cases should be blocked by Safety Gate)
  "Unhealthy Body Image Messaging",
  "Diet Culture Risk",
  "Weight Fixation Concern",
  "Food Restriction Warning",
  "Appearance Pressure",
  "Comparison Pressure",
  "Self-Esteem Risk",

  // Mental health / coping (warn-only; self-harm should be blocked by Safety Gate)
  "Emotional Vulnerability",
  "Distress Signals",
  "Lack of Support System",
  "Normalization of Emotional Pain",
  "Avoidance of Help-Seeking",
  "Unhealthy Coping Strategy",

  // Decision making / life choices
  "Impulsive Decision Making",
  "Long-Term Consequences Unclear",
  "Lack of Adult Guidance",
  "Overconfidence Risk",
  "Life Experience Gap",

  // Generic fallbacks
  "Potential Harm – Context Dependent",
  "Situational Risk",
  "Requires Careful Consideration",
  "Sensitive Topic – Caution Advised",
  "Complex Situation",
]);
