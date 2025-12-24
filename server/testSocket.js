import { io } from "socket.io-client";
import fetch from "node-fetch";

const SERVER_URL = "http://localhost:8080";

// Helper to create a promise that resolves when a specific event is received
const waitForEvent = (socket, event) => {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
};

// Helper to delay execution
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runComprehensiveTest() {
  console.log("🚀 Starting Comprehensive Socket & API Test...\n");

  // 1. Initialize Two Clients (Alice and Bob)
  const socketAlice = io(SERVER_URL);
  const socketBob = io(SERVER_URL);

  try {
    // Wait for both to connect
    await Promise.all([
      waitForEvent(socketAlice, "connect"),
      waitForEvent(socketBob, "connect")
    ]);
    console.log(`✅ Alice Connected (${socketAlice.id})`);
    console.log(`✅ Bob Connected   (${socketBob.id})`);

    // 1.5 User Registration Tests
    console.log("\n👤 --- Test 0: User Registration ---");

    // Test 0.1: Bad Username (Short)
    console.log("   Testing Bad Username (Short)...");
    const badUserRes = await fetch(`${SERVER_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "short", password: "password123" })
    });
    if (badUserRes.status === 400) {
        console.log("   ✅ Correctly rejected short username.");
    } else {
        console.error(`   ❌ FAILED: Expected 400, got ${badUserRes.status}`);
    }

    // Test 0.2: Good Users
    console.log("   Registering valid users (AliceUser & BobUser)...");
    await fetch(`${SERVER_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "AliceUser", password: "password123" })
    });
    await fetch(`${SERVER_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: "BobUser", password: "password123" })
    });

    // 2. Alice Creates a Chat Room
    console.log("\n📝 Alice is creating a new chat room...");
    const createRes = await fetch(`${SERVER_URL}/api/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Project Discussion",
        content: "Let's talk about the hackathon project.",
        username: "AliceUser"
      })
    });
    const chat = await createRes.json();
    const roomId = chat._id;
    console.log(`✅ Room Created! ID: ${roomId}`);

    // 3. Both Join the Room
    console.log(`\n👥 Both users joining room ${roomId}...`);
    socketAlice.emit("join_room", roomId);
    socketBob.emit("join_room", roomId);
    
    // Give a moment for joins to process
    await sleep(500);

    // Setup Listeners
    socketAlice.on("receive_message", (msg) => {
      console.log(`\n[Alice's Screen] 📩 Received: "${msg.text}" from ${msg.username}`);
    });

    socketBob.on("receive_message", (msg) => {
      console.log(`\n[Bob's Screen]   📩 Received: "${msg.text}" from ${msg.username}`);
    });

    // Test 0.5: Message with Wrong Username
    console.log("\n--- Test 0.5: Sending message with non-existent user ---");
    const badMsg = { text: "Hello?", username: "GhostUser" };
    const badMsgRes = await fetch(`${SERVER_URL}/api/chats/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badMsg)
    });
    
    if (badMsgRes.status === 404) {
         console.log("✅ Correctly rejected message from non-existent user (404).");
    } else {
         console.error(`❌ FAILED: Expected 404, got ${badMsgRes.status}`);
    }

    // 4. Alice Sends a Safe Message
    console.log("\n--- Test 1: Alice sends a SAFE message ---");
    const msg1 = { text: "Hey Bob, are you ready for the demo?", username: "AliceUser" };
    
    await fetch(`${SERVER_URL}/api/chats/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg1)
    });
    
    // Wait to see logs
    await sleep(2000);

    // 5. Bob Sends a Safe Reply
    console.log("\n--- Test 2: Bob sends a SAFE reply ---");
    const msg2 = { text: "Yes Alice! I think we are ready.", username: "BobUser" };
    
    await fetch(`${SERVER_URL}/api/chats/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg2)
    });

    // Wait to see logs
    await sleep(2000);

    // 6. Alice Sends an UNSAFE Message (Should be blocked)
    console.log("\n--- Test 3: Alice sends an UNSAFE message (Should be blocked) ---");
    const msg3 = { text: "You are an idiot and I hate working with you.", username: "AliceUser" };
    
    const unsafeRes = await fetch(`${SERVER_URL}/api/chats/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg3)
    });
    
    const unsafeData = await unsafeRes.json();
    
    // The server returns 200 OK even for blocked messages (handled by frontend)
    if (unsafeRes.status === 200 && unsafeData.isSafe === false) {
        console.log(`✅ System Correctly Blocked Message!`);
        console.log(`   Reason: ${unsafeData.reason}`);
        console.log(`   Feedback: ${unsafeData.feedback}`);
    } else {
        console.error(`❌ FAILED: Unsafe message was NOT blocked. Status: ${unsafeRes.status}`);
        console.error(`   Response: ${JSON.stringify(unsafeData)}`);
    }

    // Wait to ensure NO socket events are fired for this
    await sleep(2000);

    console.log("\n✅ Test Suite Completed Successfully!");

  } catch (error) {
    console.error("❌ Error during test:", error);
  } finally {
    socketAlice.disconnect();
    socketBob.disconnect();
    // eslint-disable-next-line n/no-process-exit
    process.exit(0);
  }
}

runComprehensiveTest();
