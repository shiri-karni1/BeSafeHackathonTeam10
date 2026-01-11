import dotenv from "dotenv";
import OpenAI from "openai";
import { SAFETY_SYSTEM_PROMPT } from "./prompt.js";
import { SAFETY_RESULT_SCHEMA } from "./schema.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validates content for safety using OpenAI.
 * Returns null if safe, formatted error object if unsafe.
 * 
 * @param {string} text - The text to analyze
 * @param {string} contextType - 'Chat' or 'Message' (for error messaging)
 */
export const checkSafety = async (text, contextType = 'Message') => {
  console.time(`SafetyCheck-${contextType}`);
  
  try {
    if (typeof text !== "string" || text.trim().length === 0) {
      console.timeEnd(`SafetyCheck-${contextType}`);
      return null; // Empty content is safe
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SAFETY_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_schema", json_schema: SAFETY_RESULT_SCHEMA },
      temperature: 0,
    });

    const result = JSON.parse(completion.choices[0].message.content);
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
  } catch (error) {
    console.error("Error calling OpenAI (safety):", error);
    console.timeEnd(`SafetyCheck-${contextType}`);
    return {
      isSafe: false,
      message: `${contextType} blocked by Safety Agent`,
      feedback: "Our safety system is currently unavailable. Your message could not be sent. Please try again later.",
      reason: "Safety Service Error",
      category: "Error",
    };
  }
};
