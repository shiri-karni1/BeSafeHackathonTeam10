import { checkAnswerAgainstSource } from "./checkSingle.js";
import { getAllSources, sourceToText } from "./sources.js";

/**
 * Public API: Verifies an answer against all trusted sources.
 * Returns null if no additional info needed, or reference info to attach.
 * 
 * NEVER blocks content - only attaches clarification/reference info.
 * Checks all sources in parallel for performance.
 */
export const checkVerification = async ({ question, answer }) => {
  console.time("VerificationCheck");
  console.log("[VERIFICATION] Starting check for:", { question, answer });

  const allSources = getAllSources();
  console.log("[VERIFICATION] Checking against", allSources.length, "sources");

  // Check all sources in parallel
  const results = await Promise.all(
    allSources.map(async (source) => {
      const trustedText = sourceToText(source);
      const result = await checkAnswerAgainstSource({
        question,
        answer,
        trustedSourceText: trustedText,
      });
      console.log(`[VERIFICATION] Source ${source.name}:`, {
        shouldAttachReference: result?.shouldAttachReference,
        category: result?.category,
        additionalInfo: result?.additionalInfo?.substring(0, 50)
      });
      return { result, source };
    })
  );

  // Check if OpenAI wants to attach a reference
  for (const { result, source } of results) {
    if (result?.shouldAttachReference === true) {
      console.log("[VERIFICATION] ✅ Attaching reference from:", source.name);
      console.timeEnd("VerificationCheck");
      return buildReferenceInfo(result, source);
    }
  }

  console.log("[VERIFICATION] ❌ No reference attached");
  console.timeEnd("VerificationCheck");
  return null;
};

function buildReferenceInfo(result, source) {
  return {
    ...result,  // Spread all OpenAI fields: isSafe, category, reason, additionalInfo, shouldAttachReference, referenceNote
    reference: {
      name: source.name ?? source.sourceName ?? null,
      url: source.url,
      id: source.id,
      note: result.referenceNote,
    },
  };
}
