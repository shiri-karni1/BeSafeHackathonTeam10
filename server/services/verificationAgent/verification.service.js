import { evaluateAnswerAgainstSource } from "../safetyAgent/agent.js";
import { SEXUAL_HEALTH_SOURCES } from "../../trustedSources/sexualHealth.sources.js";

/**
 * Turns a structured trusted source object into a single text excerpt
 * for the LLM to compare against.
 */
function sourceToText(source) {
  const summary = source.summary ? `Summary:\n${source.summary}` : "";

  const keyPoints = Array.isArray(source.keyPoints) && source.keyPoints.length
    ? `Key Points:\n${source.keyPoints.map((kp) => `- ${kp}`).join("\n")}`
    : "";

  const notes = Array.isArray(source.notes) && source.notes.length
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
    `Source Name: ${source.name ?? "Unknown"}`,
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
 * Verifies a human answer against multiple trusted excerpts in the same topic.
 * - Reject immediately on contradiction with any trusted source.
 * - Approve if at least one trusted source supports the answer.
 * - Otherwise reject as "Not Supported by Trusted Source".
 */
export const verifyAnswer = async ({ question, answer }) => {
  console.time("VerificationCheck");

  let supported = false;
  let supportingSource = null;

  for (const source of SEXUAL_HEALTH_SOURCES.sources) {
    const trustedText = sourceToText(source);

    const result = await evaluateAnswerAgainstSource({
      question,
      answer,
      trustedSourceText: trustedText,
    });

    // Contradiction => reject immediately
    if (!result.approve && result.category === "Contradicts Trusted Source") {
      console.timeEnd("VerificationCheck");
      return buildRejection(result, source);
    }

    // If at least one source approves, mark as supported
    if (result.approve) {
      supported = true;
      if (!supportingSource) supportingSource = source;
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
      ? { name: source.name, url: source.url, id: source.id }
      : null,
  };
}
