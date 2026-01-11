import { checkSafety } from "./safety/check.js";
import { checkVerification } from "./verification/checkAll.js";

/**
 * Unified content validation agent.
 * Runs both safety and verification checks.
 * 
 * @returns null if approved, or error object with details if blocked/warned
 */
export const validateMessage = async ({ text, contextType = 'Message' }) => {
  // 1) Safety check (blocks unsafe content) safetyError is null if safe
  const safetyError = await checkSafety(text, contextType);
  if (safetyError) {
    return safetyError;
  }

  // 2) Verification check (blocks contradictions, warns on risky topics)
  const verification = await checkVerification({
    question: contextType || "Content",
    answer: text,
  });

  if (verification) {
    if (verification.approved === false) {
      // Blocked by verification
      return verification;
    }

    if (verification.approved === true && verification.warning) {
      // Approved but with warning
      return { ok: true, warning: verification.warning };
    }
  }

  // Fully approved
  return null;
};
