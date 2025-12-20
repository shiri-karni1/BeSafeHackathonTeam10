import dotenv from 'dotenv';
dotenv.config();
import { init } from '@heyputer/puter.js/src/init.cjs';

// Initialize Puter with the token from .env
const puter = init(process.env.PUTER_TOKEN);

// ⚠️ DEV MODE: Set to true to bypass AI checks (for testing DB/Frontend)
const DEV_MODE = false;

const SYSTEM_PROMPT = `
You are a "Big Sister" Safety Agent for a teenage girl chat app.
Your goal is to ensure conversations are safe, supportive, and medically accurate.

Analyze the message and return a JSON object:
{
  "isSafe": boolean,
  "feedback": string | null,
  "reason": string | null
}

UNSAFE CATEGORIES:
1. Bullying/Harassment
2. Self-Harm/Suicide
3. Eating Disorders
4. Sexual Content
5. PII (Phone/Address)
6. Medical Misinformation

Return ONLY the raw JSON.

Examples:
Input: "You are ugly" -> { "isSafe": false, "feedback": "Be kind.", "reason": "Bullying" }
Input: "I'm sad" -> { "isSafe": true, "feedback": null, "reason": "Supportive" }
`;

export const evaluateMessage = async (message) => {
  // ⚠️ DEV MODE BYPASS
  if (DEV_MODE) {
    console.log("⚠️ DEV MODE: Bypassing Safety Agent");
    return { isSafe: true, feedback: "Dev Mode: Safety Check Bypassed", reason: "Testing" };
  }

  try {
    // Combine system prompt and user message for Puter
    const fullPrompt = `${SYSTEM_PROMPT}\n\nMessage to analyze: "${message}"`;

    // Call Puter AI (Free)
    const response = await puter.ai.chat(fullPrompt);

    // Check for Puter error response (e.g. missing token)
    if (response?.code === 'token_missing' || response?.error) {
        throw new Error("Puter AI Error: " + (response.message || "Unknown error"));
    }
    
    // Puter returns a string (or object depending on version), we need to ensure it's a string first
    let content = typeof response === 'object' ? response.message?.content || JSON.stringify(response) : response;

    // Clean up potential markdown formatting (e.g. ```json ... ```)
    if (typeof content === 'string') {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const result = JSON.parse(content);

    // Validate result structure
    if (typeof result.isSafe === 'undefined') {
         throw new Error("Invalid AI response structure");
    }

    return result;

  } catch (error) {
    console.error("Error calling Puter AI:", error);
    // Block the message if the AI service fails
    return {
      isSafe: false,
      feedback: "Our safety system is currently unavailable. Your message could not be sent. Please try again later.",
      reason: "Safety Service Error"
    };
  }
};