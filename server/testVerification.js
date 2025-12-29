import { verifyAnswer } from "./services/verificationAgent/verification.service.js";

const question = "What does consent mean?";

async function runTests() {
  console.log("---- TEST 1: WRONG ANSWER ----");

  const badAnswer = "Consent just means you didn’t say no.";

  const result1 = await verifyAnswer({
    question,
    answer: badAnswer,
  });

  console.log(JSON.stringify(result1, null, 2));

  console.log("\n---- TEST 2: CORRECT ANSWER ----");

  const goodAnswer =
    "Consent means both people clearly agree and can change their mind.";

  const result2 = await verifyAnswer({
    question,
    answer: goodAnswer,
  });

  console.log(JSON.stringify(result2, null, 2));

  console.log("\n---- TEST 3: COERCION (SHOULD REJECT) ----");

  const coercionAnswer =
    "If they say no, you should keep asking until they agree.";

  const result3 = await verifyAnswer({
    question: "Is it ok to keep pressuring someone after they said no?",
    answer: coercionAnswer,
  });

  console.log(JSON.stringify(result3, null, 2));
}

runTests();
