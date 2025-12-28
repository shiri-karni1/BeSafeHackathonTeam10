import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * =========================================================
 * 1) SAFETY GATE (your existing logic)
 * =========================================================
 * Purpose:
 * Block content that is unsafe for teen users (before publishing).
 */

// JSON Schema for Safety moderation
const SAFETY_RESULT_SCHEMA = {
  name: "safety_evaluation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      isSafe: { type: "boolean" },
      feedback: { type: ["string", "null"] },
      reason: { type: ["string", "null"] },
      category: {
        type: "string",
        enum: [
          "Bullying/Harassment",
          "Self-Harm/Suicide",
          "Eating Disorders",
          "Sexual Content",
          "PII",
          "Medical Misinformation",
          "Safe",
          "Error" // ✅ IMPORTANT: add this because you return "Error" on failures
        ],
      },
    },
    required: ["isSafe", "feedback", "reason", "category"],
    additionalProperties: false,
  },
};

const SAFETY_SYSTEM_PROMPT = `
You are a Safety Agent for a teenage girl forum.
Your goal is to block unsafe content.

UNSAFE CATEGORIES:
1. Bullying/Harassment
2. Self-Harm/Suicide
3. Eating Disorders
4. Sexual Content
5. PII (Phone/Address)
6. Medical Misinformation

If the message is safe:
- isSafe=true
- feedback=null
- reason=null
- category="Safe"

If unsafe:
- isSafe=false
- category=best match
- reason=short reason
- feedback=gentle supportive alternative

Return JSON only.
`.trim();

export const evaluateMessage = async (message) => {
  try {
    // Basic guard
    if (typeof message !== "string" || message.trim().length === 0) {
      return { isSafe: true, feedback: null, reason: null, category: "Safe" };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SAFETY_SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: { type: "json_schema", json_schema: SAFETY_RESULT_SCHEMA },
      temperature: 0,
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Error calling OpenAI (safety):", error);
    // Fail-closed (block) is OK for safety, but keep schema-valid output
    return {
      isSafe: false,
      feedback:
        "Our safety system is currently unavailable. Your message could not be sent. Please try again later.",
      reason: "Safety Service Error",
      category: "Error",
    };
  }
};

/**
 * =========================================================
 * 2) ANSWER VERIFICATION (NEW)
 * =========================================================
 * Purpose:
 * Approve/reject human answers based on a trusted source excerpt.
 *
 * IMPORTANT:
 * - This does NOT “add a warning label”.
 * - It decides: approve=true/false.
 * - Later you can plug in a real website retrieval step.
 */

// JSON Schema for verification
const VERIFICATION_SCHEMA = {
  name: "answer_verification",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      approve: {
        type: "boolean",
        description: "Whether the answer is approved for publishing."
      },
      category: {
        type: "string",
        enum: [
          "Accurate",
          "Contradicts Trusted Source",
          "Not Supported by Trusted Source",
          "Potentially Harmful Medical Advice",
          "Unclear",
          "Error"
        ]
      },
      reason: { type: ["string", "null"] },
      suggestedFix: {
        type: ["string", "null"],
        description: "Optional: a safer rewrite (if you want). If you don't want rewrites, keep it null."
      },
      confidence: { type: "number", minimum: 0, maximum: 1 }
    },
    required: ["approve", "category", "reason", "suggestedFix", "confidence"]
  }
};

const VERIFICATION_SYSTEM_PROMPT = `
You are an Answer Verification Agent for a teen forum.

The forum answers are written by PEOPLE.
Your job is to verify an answer against a TRUSTED SOURCE excerpt.

Rules:
- Approve ONLY if the answer is supported by the trusted source.
- If the answer contradicts the source, reject it.
- If the answer gives medical advice that could be harmful or tells to stop meds etc., reject it.
- If the trusted source does not cover the claim, reject as "Not Supported by Trusted Source".
- Be strict: if unsure, do not approve.

Return JSON only.
`.trim();

/**
 * Verify a human answer against a trusted source excerpt.
 *
 * @param {Object} params
 * @param {string} params.question - original question in the forum
 * @param {string} params.answer - human answer to verify
 * @param {string} params.trustedSourceText - relevant excerpt from your trusted website/source
 */
export const evaluateAnswerAgainstSource = async ({
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
      // If you have no source text, you cannot verify -> reject
      return {
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
Decide if the human answer is supported by the trusted source excerpt.
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
    // Fail-closed: if verification fails, do not approve content
    return {
      approve: false,
      category: "Error",
      reason: "Verification service error",
      suggestedFix: null,
      confidence: 0.0,
    };
  }
};
