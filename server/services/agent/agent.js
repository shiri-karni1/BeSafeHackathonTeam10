import { checkSafety } from "./safety/check.js";
import { checkVerification } from "./verification/checkAll.js";

/**
 * Unified content validation agent.
 * Flow matches diagram:
 * 1) Safety check - BLOCKS if unsafe (isSafe = false)
 * 2) Verification check - ATTACHES reference info if needed (shouldAttachInfo = true)
 * 
 * @returns null if approved with no info, 
 *          { isSafe: false, ... } if blocked by safety,
 *          { ok: true, reference: {...} } if approved with reference info
 */
export const validateMessage = async ({ text, contextType = 'Message', question = null }) => {
  console.log("\n[AGENT] ===== Starting validation =====");
  console.log("[AGENT] Text:", text);
  console.log("[AGENT] Context:", contextType);
  console.log("[AGENT] Question:", question?.substring(0, 100) || "none");
  
  // 1) Safety check (blocks unsafe content)
  const safetyResult = await checkSafety(text, contextType);
  console.log("[AGENT] Safety result:", safetyResult ? { isSafe: safetyResult.isSafe, category: safetyResult.category } : "null (safe)");
  
  if (safetyResult && !safetyResult.isSafe) { 
    console.log("[AGENT] ❌ BLOCKED by safety");
    return safetyResult; // BLOCKED
  }
  if (contextType === "Chat") // dont run verification on chats
  {
    console.log("[AGENT] ✅ Approved (no verification on Chat)");
    return safetyResult;
  }

  // 2) Verification check (attaches reference/clarification info if needed)
  const verificationResult = await checkVerification({
    question: question || "General conversation",
    answer: text,
  });
  
  console.log("[AGENT] Verification result:", verificationResult ? "Has reference" : "null (no reference)");

  if (verificationResult) {
    console.log("[AGENT] ✅ Approved with reference");
    // Has reference info to attach
    return { 
      ok: true, 
      reference: verificationResult 
    };
  }

  console.log("[AGENT] ✅ Approved (no reference)");
  // Fully approved, no additional info needed
  return null;
};
