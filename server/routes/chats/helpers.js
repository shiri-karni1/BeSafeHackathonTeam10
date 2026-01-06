import { validateContent } from "../../services/safetyAgent/safety.service.js";
import { verifyAnswer } from "../../services/verificationAgent/verification.service.js";
import AppError from "../../utils/AppError.js";

export const sendChatNotFound = (res) =>
  res.status(404).json({ message: "Chat not found" });

/**
 * handleSafetyCheck now supports:
 * - BLOCK (Safety)         => returns null (and sends response)
 * - BLOCK (Verification)   => returns null (and sends response)
 * - WARN (Verification)    => returns { ok:true, warning:{...} }
 * - APPROVE                => returns { ok:true, warning:null }
 */
export const handleSafetyCheck = async (res, text, contextType) => {
  // 1) SAFETY GATE (blocks unsafe teen content)
  const safetyError = await validateContent(text, contextType);
  if (safetyError) {
    // NOTE: you currently return 200 on safetyError - keeping your behavior.
    // If you prefer, change to 400/403.
    res.status(200).json(safetyError);
    return null; // Blocked
  }

  // 2) VERIFICATION (warn or block only if relevant)
  // If you don't have a "question", we can pass contextType as the question.
  const verification = await verifyAnswer({
    question: contextType || "Content",
    answer: text,
  });

  // verifyAnswer returns:
  // - null                 => approve
  // - { approved:false ...} => block
  // - { approved:true, warning:{...} ... } => warn
  if (verification) {
    if (verification.approved === false) {
      // BLOCK (contradiction / harmful medical advice)
      // choose status: 400 is typical; keeping consistent with "blocked" semantics
      res.status(400).json(verification);
      return null;
    }

    if (verification.approved === true && verification.warning) {
      // WARN (publish but show warning)
      return { ok: true, warning: verification.warning };
    }
  }

  // APPROVE
  return { ok: true, warning: null };
};

export const handleError = (res, error) => {
  // Handle operational errors (known errors)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // Handle Mongoose validation errors
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((val) => val.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Handle unknown errors (don't leak details in production)
  console.error("Unexpected Error:", error);
  res.status(500).json({ message: "Internal Server Error" });
};
