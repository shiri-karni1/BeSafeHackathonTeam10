import { validateMessage } from "../../services/agent/agent.js";
import AppError from "../../utils/AppError.js";

export const sendChatNotFound = (res) =>
  res.status(404).json({ message: "Chat not found" });

/**
 * handleSafetyCheck validates content through unified agent.
 * - BLOCK        => returns null (and sends response)
 * - WARN         => returns { ok:true, warning:{...} }
 * - APPROVE      => returns { ok:true, warning:null }
 */
export const handleSafetyCheck = async (res, text, contextType) => {
  const result = await validateMessage({ text, contextType });

  // null = approved
  if (!result) {
    return { ok: true, warning: null };
  }

  // Has warning but approved
  if (result.ok && result.warning) {
    return result;
  }

  // Blocked (safety or verification)
  const status = result.isSafe === false ? 200 : 400;
  res.status(status).json(result);
  return null;
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
