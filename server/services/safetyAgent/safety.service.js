import { evaluateMessage } from './agent.js';

/**
 * Validates content using the AI Safety Agent.
 * Returns null if safe.
 * Returns a formatted error object if unsafe.
 * 
 * @param {string} text - The text to analyze
 * @param {string} contextType - 'Chat' or 'Message' (for error messaging)
 */
export const validateContent = async (text, contextType = 'Message') => {
  console.time(`SafetyCheck-${contextType}`);
  const result = await evaluateMessage(text);
  console.timeEnd(`SafetyCheck-${contextType}`);

  if (!result.isSafe) {
    return {
      isSafe: false,
      message: `${contextType} blocked by Safety Agent`,
      feedback: result.feedback,
      reason: result.reason,
      category: result.category
    };
  }

  return null;
};
