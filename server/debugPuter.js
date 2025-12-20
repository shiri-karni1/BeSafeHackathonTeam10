import dotenv from 'dotenv';
import { init } from '@heyputer/puter.js/src/init.cjs';

dotenv.config();

const puter = init(process.env.PUTER_TOKEN);

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
`;

async function test() {
    try {
        console.log("Sending SAFE message request...");
        const fullPrompt = `${SYSTEM_PROMPT}\n\nMessage to analyze: "Hello everyone! I hope you are having a great day."`;
        
        const response = await puter.ai.chat(fullPrompt);
        console.log("RAW RESPONSE:", JSON.stringify(response, null, 2));

        let content = typeof response === 'object' ? response.message?.content || JSON.stringify(response) : response;
        if (typeof content === 'string') {
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        console.log("PARSED CONTENT:", content);
        
        try {
            const json = JSON.parse(content);
            console.log("FINAL JSON:", json);
        } catch (e) {
            console.error("JSON PARSE ERROR:", e.message);
        }

    } catch (error) {
        console.error("FULL ERROR:", error);
    }
}

test();