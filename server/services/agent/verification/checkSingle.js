import dotenv from "dotenv";
import OpenAI from "openai";
import { VERIFICATION_SYSTEM_PROMPT } from "./prompt.js";
import { VERIFICATION_SCHEMA } from "./schema.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Checks an answer against a single trusted source using OpenAI.
 * Returns raw evaluation result.
 */
export const checkAnswerAgainstSource = async ({
  question,
  answer,
  trustedSourceText,
}) => {
  try {
    if (
      typeof answer !== "string" ||
      answer.trim().length === 0 ||
      typeof trustedSourceText !== "string" ||
      trustedSourceText.trim().length === 0
    ) {
      return {
        isRelevant: false,
        approve: false,
        category: "Unclear",
        reason: "Missing answer or trusted source excerpt for verification.",
        suggestedFix: null,
        confidence: 0.0,
      };
    }

    const userInput = `
Question:
${question || "(no question provided)"}

Answer (human):
${answer}

Trusted source excerpt:
${trustedSourceText}

Task:
1) Decide if the trusted source excerpt is relevant to the question/answer topic.
2) If relevant, decide if the answer contradicts/supports/is not covered.
3) If allowed but risky for teens, choose a WARN category and set approve=true.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: VERIFICATION_SYSTEM_PROMPT },
        { role: "user", content: userInput },
      ],
      response_format: { type: "json_schema", json_schema: VERIFICATION_SCHEMA },
      temperature: 0,
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling OpenAI (verification):", error);
    return {
      isRelevant: false,
      approve: false,
      category: "Error",
      reason: "Verification service error",
      suggestedFix: null,
      confidence: 0.0,
    };
  }
};
