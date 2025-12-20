import { io } from "socket.io-client";
import fetch from "node-fetch";

const SERVER_URL = "http://localhost:5000";
const socket = io(SERVER_URL);

async function runTest() {
  try {
    console.log("1. Creating a new Chat Room (Question) via API...");
    const response = await fetch(`${SERVER_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Test Chat",
        content: "Testing sockets",
        username: "Tester"
      })
    });

    const question = await response.json();
    
    if (!question._id) {
      console.error("Failed to create question:", question);
      return;
    }

    const roomId = question._id;
    console.log(`✅ Room Created! ID: ${roomId}`);

    socket.on("connect", () => {
      console.log("Connected to server with ID:", socket.id);

      // 2. Join Room
      console.log(`Joining room: ${roomId}`);
      socket.emit("join_room", roomId);

      // 3. Send Safe Message
      setTimeout(() => {
        console.log("\n--- Sending SAFE message ---");
        socket.emit("send_message", {
          roomId,
          message: "Hello everyone! I hope you are having a great day.",
          username: "TestUser"
        });
      }, 1000);

      // 4. Send Unsafe Message
      setTimeout(() => {
        console.log("\n--- Sending UNSAFE message ---");
        socket.emit("send_message", {
          roomId,
          message: "You are ugly and nobody likes you.",
          username: "BullyBot"
        });
      }, 3000);
    });

    socket.on("receive_message", (data) => {
      console.log("✅ RECEIVED MESSAGE:", data);
    });

    socket.on("message_blocked", (data) => {
      console.log("🚫 MESSAGE BLOCKED:", data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

  } catch (error) {
    console.error("Error running test:", error);
  }
}

runTest();

// Keep the script running for a bit then exit
setTimeout(() => {
  console.log("\nTest finished. Exiting...");
  socket.disconnect();
  process.exit(0);
}, 6000);
