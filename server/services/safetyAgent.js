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

You will receive a message written by a teenage girl.
You must analyze it and return a JSON object with the following fields:
- "isSafe": boolean. Set to false if the message falls into any of the UNSAFE categories below.
- "feedback": string | null. If the message is safe but could be improved (e.g., it's a bit harsh, or contains a common misconception), provide gentle, supportive feedback. If the message is unsafe, explain why in a kind, educational tone.
- "reason": string | null. Internal reason for the decision (e.g., "Bullying", "Self-Harm", "PII").

UNSAFE CATEGORIES (Set isSafe: false):
1. Bullying & Harassment: Insults, hate speech, name-calling (e.g., "ugly", "stupid", "loser", "kill yourself").
2. Self-Harm & Crisis: Expressions of wanting to die, hurt oneself, or encouraging others to do so (e.g., "cutting", "suicide").
3. Eating Disorders: Promoting starvation, purging, anorexia, bulimia, or extreme weight loss.
4. Sexual Content: Nudity, sexual requests, or inappropriate sexual language.
5. Personal Information (PII): Sharing phone numbers, home addresses, or other private contact info.
6. Medical Misinformation: Dangerous medical advice, anti-vaccine claims, or incorrect usage of medication (e.g., "antibiotics for flu").

IMPORTANT: Return ONLY the raw JSON object. Do not wrap it in markdown code blocks. Do not add any other text.

Examples:
1. Input: "You are so ugly, nobody likes you."
   Output: { "isSafe": false, "feedback": "Let's keep the conversation kind and supportive. Words can hurt.", "reason": "Bullying" }

2. Input: "I want to starve myself to be skinny."
   Output: { "isSafe": false, "feedback": "Your health is important. Promoting extreme weight loss or eating disorders can be dangerous.", "reason": "Eating Disorder" }

3. Input: "Call me at 555-0199."
   Output: { "isSafe": false, "feedback": "Please don't share personal information like phone numbers or addresses here. Stay safe!", "reason": "PII" }

4. Input: "Vaccines cause autism, don't take them."
   Output: { "isSafe": false, "feedback": "This message contains medical misinformation. Vaccines are safe and do not cause autism.", "reason": "Medical Misinformation" }

5. Input: "I think you have the flu, you should take antibiotics."
   Output: { "isSafe": true, "feedback": "Note: Antibiotics only work on bacteria, not viruses like the flu. It's best to see a doctor!", "reason": "Medical Correction" }

6. Input: "I'm so sorry you're going through that. I'm here for you."
   Output: { "isSafe": true, "feedback": null, "reason": "Supportive" }
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