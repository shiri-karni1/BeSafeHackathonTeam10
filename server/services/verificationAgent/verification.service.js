import { evaluateAnswerAgainstSource } from "../safetyAgent/agent.js";
import { SEXUAL_HEALTH_SOURCES } from "../../trustedSources/sexualHealth.sources.js";

/**
 * Verifies a human answer against multiple trusted excerpts in the same topic.
 * - Reject immediately on contradiction with any trusted source.
 * - Approve if at least one trusted source supports the answer.
 * - Otherwise reject as "Not Supported by Trusted Source".
 */
export const verifyAnswer = async ({ question, answer }) => {
  console.time("VerificationCheck");

  let supported = false;

  for (const source of SEXUAL_HEALTH_SOURCES.sources) {
    const result = await evaluateAnswerAgainstSource({
      question,
      answer,
      trustedSourceText: source.excerpt,
    });

    // Contradiction => reject immediately
    if (!result.approve && result.category === "Contradicts Trusted Source") {
      console.timeEnd("VerificationCheck");
      return buildRejection(result, source);
    }

    // If at least one source approves, mark as supported
    if (result.approve) {
      supported = true;
    }
  }

  console.timeEnd("VerificationCheck");

  // If supported by at least one trusted excerpt -> approve
  if (supported) return null;

  // Otherwise fail-closed
  return buildRejection(
    {
      approve: false,
      category: "Not Supported by Trusted Source",
      reason: "The answer is not supported by any trusted source excerpt.",
      suggestedFix: null,
      confidence: 0.5,
    },
    null
  );
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
      ? { name: source.sourceName, url: source.url, id: source.id }
      : null,
  };
}
