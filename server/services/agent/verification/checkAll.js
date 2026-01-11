import { checkAnswerAgainstSource } from "./checkSingle.js";
import { WARNING_CATEGORIES } from "./warnings.js";
import { getAllSources, sourceToText } from "./sources.js";

/**
 * Public API: Verifies an answer against all trusted sources.
 * Returns null if approved, formatted result if blocked/warned.
 * 
 * Checks all sources in parallel for performance.
 */
export const checkVerification = async ({ question, answer }) => {
  console.time("VerificationCheck");

  const allSources = getAllSources();

  // Check all sources in parallel
  const results = await Promise.all(
    allSources.map(async (source) => {
      const trustedText = sourceToText(source);
      const result = await checkAnswerAgainstSource({
        question,
        answer,
        trustedSourceText: trustedText,
      });
      return { result, source };
    })
  );

  // Check for blocks first (contradictions)
  for (const { result, source } of results) {
    const isRelevant = result?.isRelevant === true;

    if (
      isRelevant &&
      result?.approve === false &&
      (result?.category === "Contradicts Trusted Source" ||
      result?.category === "Potentially Harmful Medical Advice")
    ) {
      console.timeEnd("VerificationCheck");
      return buildRejection(result, source);
    }
  }

  // Then check for warnings
  for (const { result } of results) {
    const isRelevant = result?.isRelevant === true;

    if (isRelevant && WARNING_CATEGORIES.has(result?.category)) {
      console.timeEnd("VerificationCheck");
      return buildWarning(result);
    }
  }

  console.timeEnd("VerificationCheck");
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
