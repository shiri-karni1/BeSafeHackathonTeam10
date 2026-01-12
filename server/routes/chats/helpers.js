import { validateMessage } from "../../services/agent/agent.js";
import AppError from "../../utils/AppError.js";

export const sendChatNotFound = (res) =>
  res.status(404).json({ message: "Chat not found" });

/**
 * handleSafetyCheck validates content through unified agent.
 * - BLOCK        => returns null (and sends response with shouldBlock=true)
 * - ATTACH INFO  => returns { ok:true, reference:{...} }
 * - APPROVE      => returns { ok:true, reference:null }
 */
export const handleSafetyCheck = async (res, text, contextType) => {
  const result = await validateMessage({ text, contextType });

  // null = approved, no additional info
  if (!result) {
    return { ok: true, reference: null };
  }

  // Has reference info but approved
  if (result.ok && result.reference) {
    return result;
  }

  // Blocked by safety check
  if (result.isSafe === false) {
    res.status(200).json(result);
    return null;
  }

  // Unexpected result format
  res.status(500).json({ 
    isSafe: false,
    message: "Internal validation error",
    suggestedResponse: "An error occurred while processing your message. Please try again.",
    reason: "Unexpected validation result",
    category: "Error"
  });
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
