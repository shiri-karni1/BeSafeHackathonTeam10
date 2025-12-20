import puter from '@heyputer/puter.js';

async function testPuter() {
    console.log("Testing Puter AI...");
    try {
        const response = await puter.ai.chat("Say hello");
        console.log("Response:", response);
    } catch (error) {
        console.error("Error:", error);
    }
}

testPuter();