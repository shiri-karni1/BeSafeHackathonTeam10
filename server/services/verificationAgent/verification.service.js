// server/services/verificationAgent/verification.service.js

import { evaluateAnswerAgainstSource } from "../safetyAgent/agent.js";
import { SEXUAL_CONSENT_SOURCE } from "../../trustedSources/sexualConsent.source.js";

/**
 * Verifies a human answer against a trusted excerpt (fail-closed).
 * Returns null if approved (like safety.service.js).
 * Returns an error object if rejected.
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.answer
 */
export const verifyAnswer = async ({ question, answer }) => {
  console.time("VerificationCheck");

  const result = await evaluateAnswerAgainstSource({
    question,
    answer,
    trustedSourceText: SEXUAL_CONSENT_SOURCE.excerpt,
  });

  console.timeEnd("VerificationCheck");

  if (!result.approve) {
    return {
      approved: false,
      message: "Answer rejected by Verification Agent",
      category: result.category,
      reason: result.reason,
      suggestedFix: result.suggestedFix,
      confidence: result.confidence,
      source: {
        name: SEXUAL_CONSENT_SOURCE.sourceName,
        url: SEXUAL_CONSENT_SOURCE.url,
        id: SEXUAL_CONSENT_SOURCE.id,
      },
    };
  }

  // Approved
  return null;
};
