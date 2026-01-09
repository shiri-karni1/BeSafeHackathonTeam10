import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * =========================================================
 * 1) SAFETY GATE (less aggressive)
 * =========================================================
 * Purpose:
 * Block ONLY content that is truly unsafe for teen users (before publishing).
 *
 * Key change:
 * - Sensitive topics (alcohol/parties, sex/relationships, contraception, body image, dieting)
 *   are NOT auto-blocked.
 * - Emotional distress / help-seeking around body image & food is SAFE.
 * - Eating Disorders are blocked ONLY when there is actionable coaching/instructions.
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
          "Error", // ✅ IMPORTANT: add this because you return "Error" on failures
        ],
      },
    },
    required: ["isSafe", "feedback", "reason", "category"],
    additionalProperties: false,
  },
};

const SAFETY_SYSTEM_PROMPT = `
You are a Safety Agent for a teenage girl forum.

Your job is to BLOCK only content that is truly unsafe or that provides actionable harm facilitation.
Do NOT block just because a topic is sensitive.

VERY IMPORTANT (to reduce false blocks):
- Emotional distress statements about body image, food, dieting, or anxiety are SAFE to post.
  SAFE examples:
  - "I hate my body and food stresses me out."
  - "Eating makes me anxious."
  - "I feel guilty after eating."
  - "I'm insecure about my weight."
  These are NOT eating-disorder coaching and must NOT be blocked.

Sensitive topics that are often SAFE (allow) when asked in a help-seeking way:
- Alcohol/parties/peer pressure (e.g., "I'm 16, friends pressure me to drink") WITHOUT instructions on how to do illegal/age-restricted things.
- Sex/relationships/consent questions (non-explicit).
- Contraception and sexual health info (non-explicit, educational).
- Body image / dieting concerns (supportive, non-extreme).

UNSAFE (set isSafe=false) ONLY when the message includes any of the following:

1) Bullying/Harassment:
   - Insults, humiliation, threats, targeted harassment.

2) Self-Harm/Suicide:
   - Any self-harm or suicide ideation, planning, encouragement, or instructions.

3) Eating Disorders (COACHING / INSTRUCTIONS ONLY):
   Block ONLY if the message asks for or gives actionable disordered-eating guidance, such as:
   - Extreme restriction plans (e.g., "how to eat 300-500 calories a day", "how to starve")
   - Purging instructions (e.g., "how to make yourself vomit", laxatives/diuretics for weight loss)
   - "How to lose weight fast", "how to drop X kg in a week"
   - Tips to hide disordered eating from parents/teachers
   - Pro-ED encouragement or competition (e.g., "you should eat less", "skip meals to be thin")
   DO NOT block general insecurity, guilt, or anxiety around food/body unless it contains the above.

4) Sexual Content:
   - Explicit sexual content, erotic descriptions, pornographic content, or sexual content involving minors.
   - Explicit sexual instructions.

5) PII:
   - Phone numbers, addresses, IDs, doxxing or attempts to obtain personal info about someone.

6) Medical Misinformation:
   - Harmful advice such as telling someone to stop prescribed meds, unsafe treatments,
     or dangerous instructions.

7) Instructions/facilitation for age-restricted or illegal activities:
   - Examples: "How can I get alcohol at 16?", "How do I drink without getting caught?",
     "How to hide alcohol/smell", "How to buy fake ID".
   - These should be blocked even if asked as a "tip".

Decision rule (must follow):
- If the message does NOT include the actionable unsafe instructions/facilitation above,
  and is not explicit sexual content, self-harm, harassment, PII, or dangerous medical advice,
  then it is SAFE.

If the message is safe:
- isSafe=true
- feedback=null
- reason=null
- category="Safe"

If unsafe:
- isSafe=false
- category=best match from the enum list
- reason=short reason
- feedback=gentle supportive alternative (what they can ask instead / safer direction)

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
 * 2) ANSWER VERIFICATION (unchanged)
 * =========================================================
 * Purpose:
 * Compare a human answer against a trusted source excerpt.
 *
 * IMPORTANT:
 * - The trusted source excerpt may be irrelevant to the question/answer.
 * - If it is irrelevant, the agent must NOT claim contradiction.
 * - We return isRelevant so the caller can ignore irrelevant sources.
 *
 * ALSO:
 * - The agent can emit WARNING categories when content is allowed but risky.
 * - For WARNING categories: approve=true (publish) + category set to warning type.
 */

// JSON Schema for verification (UPDATED: adds isRelevant + warning categories)
const VERIFICATION_SCHEMA = {
  name: "answer_verification",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      isRelevant: {
        type: "boolean",
        description:
          "Whether the trusted source excerpt is relevant to the question/answer topic.",
      },
      approve: {
        type: "boolean",
        description:
          "Whether the answer should be allowed for publishing (true can include WARN).",
      },
      category: {
        type: "string",
        enum: [
          // ✅ core verification outcomes
          "Accurate",
          "Contradicts Trusted Source",
          "Not Supported by Trusted Source",
          "Potentially Harmful Medical Advice",
          "Unclear",
          "Error",

          // ⚠️ WARN categories (publish with warning)
          "Age Gap / Power Imbalance",
          "Potential Grooming Risk",
          "Risky Relationship Dynamics",
          "Authority Figure Involved",
          "Emotional Manipulation Risk",
          "Unequal Emotional Maturity",
          "Dependency Risk",
          "Boundary Concerns",
          "Pressure to Move Too Fast",
          "Isolation From Friends or Family",

          "Peer Pressure Risk",
          "Risky Social Situation",
          "Substance Pressure",
          "Party Safety Concern",
          "Loss of Control Risk",
          "Encouraging Risky Behavior",
          "Normalization of Harmful Behavior",

          "Consent Gray Area",
          "Ambiguous Consent Situation",
          "Pressure Around Sexual Activity",
          "Readiness Unclear",
          "Emotional Safety Concern",
          "Intimacy Pressure",
          "Lack of Informed Consent",

          "Unhealthy Body Image Messaging",
          "Diet Culture Risk",
          "Weight Fixation Concern",
          "Food Restriction Warning",
          "Appearance Pressure",
          "Comparison Pressure",
          "Self-Esteem Risk",

          "Emotional Vulnerability",
          "Distress Signals",
          "Lack of Support System",
          "Normalization of Emotional Pain",
          "Avoidance of Help-Seeking",
          "Unhealthy Coping Strategy",

          "Impulsive Decision Making",
          "Long-Term Consequences Unclear",
          "Lack of Adult Guidance",
          "Overconfidence Risk",
          "Life Experience Gap",

          "Potential Harm – Context Dependent",
          "Situational Risk",
          "Requires Careful Consideration",
          "Sensitive Topic – Caution Advised",
          "Complex Situation",
        ],
      },
      reason: { type: ["string", "null"] },
      suggestedFix: {
        type: ["string", "null"],
        description:
          "Optional: a safer rewrite. Keep it short and teen-appropriate.",
      },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: [
      "isRelevant",
      "approve",
      "category",
      "reason",
      "suggestedFix",
      "confidence",
    ],
  },
};

const VERIFICATION_SYSTEM_PROMPT = `
You are an Answer Verification Agent for a teen forum.

The forum answers are written by PEOPLE.
Your job is to verify an answer against a TRUSTED SOURCE excerpt AND mark risk when appropriate.

CRITICAL STEP 1: Relevance
- First decide whether the trusted source excerpt is relevant to the question/answer topic.
- If the excerpt is NOT relevant:
  - set isRelevant=false
  - set category="Unclear"
  - DO NOT claim "Contradicts Trusted Source"
  - approve should usually be false (cannot verify), but never invent contradictions.

If the excerpt IS relevant (isRelevant=true), then apply:

A) BLOCK outcomes (do NOT publish):
- If the answer clearly contradicts the excerpt: approve=false, category="Contradicts Trusted Source".
- If the answer gives medical advice that could be harmful (e.g., tells to stop meds, extreme restriction, unsafe actions): approve=false, category="Potentially Harmful Medical Advice".

B) APPROVE outcomes (publish normally):
- If the answer is clearly supported by the excerpt: approve=true, category="Accurate".
- If the excerpt does not cover the claim, AND there is no safety concern: do NOT block. Use:
  - approve=true, category="Not Supported by Trusted Source"
  (This means: allowed to publish, but not verified by sources.)

C) WARN outcomes (publish WITH warning):
If the answer is allowed but includes a red-flag / risk pattern for teens, set approve=true AND choose ONE warning category from the WARN list:
Examples of WARN triggers:
- Large age gaps or power imbalance, authority figures, manipulation, isolation.
- Peer pressure, risky parties, substance pressure.
- Consent ambiguity or pressure (without explicit illegal content).
- Body image / dieting messaging that may be unhealthy but not explicitly disordered.
- Emotional vulnerability or unhealthy coping.
Return a short reason explaining the risk and a suggestedFix that rewrites the answer to be safer.

Be strict about contradictions and harmful medical advice.
But do NOT fabricate contradiction for irrelevant excerpts.

Return JSON only.
`.trim();

/**
 * Verify a human answer against a trusted source excerpt.
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
