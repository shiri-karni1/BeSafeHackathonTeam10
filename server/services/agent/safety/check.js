// safety.service.js (or checkSafety.js)

import dotenv from "dotenv";
import OpenAI from "openai";
import { SAFETY_SYSTEM_PROMPT } from "./prompt.js";
import { SAFETY_RESULT_SCHEMA } from "./responseSchema.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validates content for safety using OpenAI.
 * Returns:
 *  - null if safe
 *  - { isSafe:true, warning, category } if safe but needs a warning (UI can surface)
 *  - { isSafe:false, message, suggestedResponse, reason, category } if blocked
 *
 * @param {string} text - The text to analyze
 * @param {string} contextType - 'Chat' or 'Message'
 */
export const checkSafety = async (text, contextType = "Message") => {
  console.time(`SafetyCheck-${contextType}`);

  try {
    if (typeof text !== "string" || text.trim().length === 0) {
      console.timeEnd(`SafetyCheck-${contextType}`);
      return null;
    }

    //use LLM safety check
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: SAFETY_SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_schema", json_schema: SAFETY_RESULT_SCHEMA },
      temperature: 0,
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    const result = JSON.parse(raw);

    console.timeEnd(`SafetyCheck-${contextType}`);

    if (!result.isSafe) {
      return {
        isSafe: false,
        message: `${contextType} blocked by Safety Agent`,
        suggestedResponse: result.suggestedResponse,
        reason: result.reason,
        category: result.category,
      };
    }

    return null;
  } catch (error) {
    console.error("Error calling OpenAI (safety):", error);
    console.timeEnd(`SafetyCheck-${contextType}`);
    return {
      isSafe: false,
      message: `${contextType} blocked by Safety Agent`,
      suggestedResponse:
        "Our safety system is currently unavailable. Your message could not be sent. Please try again later.",
      reason: "Safety Service Error",
      category: "Error",
    };
  }
};
