import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the result model (JSON Schema) for Structured Outputs
const SAFETY_RESULT_SCHEMA = {
  name: "safety_evaluation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      isSafe: {
        type: "boolean",
        description: "Indicates if the message is safe for a teenage audience."
      },
      feedback: {
        type: ["string", "null"],
        description: "Helpful feedback for the user if the message is unsafe. Null if safe."
      },
      reason: {
        type: ["string", "null"],
        description: "The reason why the message was flagged as unsafe. Null if safe."
      },
      category: {
        type: "string",
        enum: [
          "Bullying/Harassment",
          "Self-Harm/Suicide",
          "Eating Disorders",
          "Sexual Content",
          "PII",
          "Medical Misinformation",
          "Safe"
        ],
        description: "The category of the safety classification."
      }
    },
    required: ["isSafe", "feedback", "reason", "category"],
    additionalProperties: false
  }
};

const SYSTEM_PROMPT = `
You are a "Big Sister" Safety Agent for a teenage girl chat app.
Your goal is to ensure conversations are safe, supportive, and medically accurate.

Analyze the message and return a JSON object matching the provided schema.

UNSAFE CATEGORIES:
1. Bullying/Harassment
2. Self-Harm/Suicide
3. Eating Disorders
4. Sexual Content
5. PII (Phone/Address)
6. Medical Misinformation

If the message is safe, set isSafe to true and feedback/reason to null.
If unsafe, provide gentle, supportive feedback.
`;

export const evaluateMessage = async (message) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      response_format: {
        type: "json_schema",
        json_schema: SAFETY_RESULT_SCHEMA
      },
    });

    const content = completion.choices[0].message.content;
    const result = JSON.parse(content);

    return result;

  } catch (error) {
    console.error("Error calling OpenAI:", error);
    // Block the message if the AI service fails
    return {
      isSafe: false,
      feedback: "Our safety system is currently unavailable. Your message could not be sent. Please try again later.",
      reason: "Safety Service Error",
      category: "Error"
    };
  }
};
