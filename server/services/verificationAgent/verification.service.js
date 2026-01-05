// services/verificationAgent/verification.service.js

import { evaluateAnswerAgainstSource } from "../safetyAgent/agent.js";

import { SEXUAL_HEALTH_SOURCES } from "../../utils/trustedSources/sexualHealth.sources.js";
import { NUTRITION_AND_BODY_IMAGE_SOURCES } from "../../utils/trustedSources/nutritionAndBodyImage.sources.js";
import { PEER_PRESSURE_AND_SOCIAL_LIFE_SOURCES } from "../../utils/trustedSources/peerPressureAndSocialLife.sources.js";
import { EDUCATION_AND_HOBBIES_SOURCES } from "../../utils/trustedSources/educationAndHobbies.sources.js";
import { RELATIONSHIPS_SOURCES } from "../../utils/trustedSources/relationships.sources.js";

/**
 * Categories that should WARN (publish, but show warning).
 * Must match EXACT string values returned by agent.js (VERIFICATION_SCHEMA enum).
 */
const WARNING_CATEGORIES = new Set([
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

/**
 * Turns a structured trusted source object into a single text excerpt
 * for the LLM to compare against.
 */
function sourceToText(source) {
  const summary = source.summary ? `Summary:\n${source.summary}` : "";

  const keyPoints =
    Array.isArray(source.keyPoints) && source.keyPoints.length
      ? `Key Points:\n${source.keyPoints.map((kp) => `- ${kp}`).join("\n")}`
      : "";

  const notes =
    Array.isArray(source.notes) && source.notes.length
      ? `Notes:\n${source.notes
          .map((n) => {
            const name = n?.name ? `- ${n.name}` : "- (note)";
            const why = n?.why ? `  Why: ${n.why}` : "";
            const url = n?.url ? `  URL: ${n.url}` : "";
            return [name, why, url].filter(Boolean).join("\n");
          })
          .join("\n")}`
      : "";

  return [
    `Source Name: ${source.name ?? source.sourceName ?? "Unknown"}`,
    source.url ? `Source URL: ${source.url}` : "",
    source.topic ? `Topic: ${source.topic}` : "",
    summary,
    keyPoints,
    notes,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Verifies a human answer against multiple trusted excerpts.
 *
 * Policy:
 * - BLOCK only if there is a contradiction WITH A RELEVANT trusted source.
 * - WARN if policy red-flag exists AND isRelevant=true.
 * - Otherwise APPROVE by default (no need for explicit support).
 */
export const verifyAnswer = async ({ question, answer }) => {
  console.time("VerificationCheck");

  const allSources = [
    ...SEXUAL_HEALTH_SOURCES.sources,
    ...NUTRITION_AND_BODY_IMAGE_SOURCES.sources,
    ...PEER_PRESSURE_AND_SOCIAL_LIFE_SOURCES.sources,
    ...EDUCATION_AND_HOBBIES_SOURCES.sources,
    ...RELATIONSHIPS_SOURCES.sources,
  ];

  for (const source of allSources) {
    const trustedText = sourceToText(source);

    const result = await evaluateAnswerAgainstSource({
      question,
      answer,
      trustedSourceText: trustedText,
    });

    const isRelevant = result?.isRelevant === true;

    // 1) BLOCK on contradiction ONLY if the source is relevant
    if (
      isRelevant &&
      result?.approve === false &&
      (result?.category === "Contradicts Trusted Source" ||
      result?.category === "Potentially Harmful Medical Advice")
    ) {
      console.timeEnd("VerificationCheck");
      return buildRejection(result, source);
    }

    // 2) WARN on red-flags ONLY if relevant
    if (isRelevant && WARNING_CATEGORIES.has(result?.category)) {
      console.timeEnd("VerificationCheck");
      return buildWarning(result);
    }

    // 3) "Not Supported by Trusted Source" is NOT rejection anymore.
    // Also: irrelevant sources should never cause block/warn.
  }

  console.timeEnd("VerificationCheck");

  // Default: approve
  return null;
};

function buildRejection(result, source) {
  return {
    approved: false,
    message: "Answer rejected by Verification Agent",
    category: result.category,
    reason: result.reason,
    suggestedFix: result.suggestedFix,
    confidence: result.confidence,
    source: source
      ? {
          name: source.name ?? source.sourceName ?? null,
          url: source.url,
          id: source.id,
        }
      : null,
  };
}

function buildWarning(result) {
  return {
    approved: true,
    message: "Answer published with warning",
    category: result.category,
    reason: result.reason,
    suggestedFix: result.suggestedFix,
    confidence: result.confidence,
    warning: {
      category: result.category,
      reason: result.reason,
      suggestedFix: result.suggestedFix,
    },
    source: null,
  };
}
