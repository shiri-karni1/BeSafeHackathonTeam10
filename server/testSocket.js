import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to server with ID:", socket.id);

  const roomId = "1";

  // 1. Join Room
  console.log(`Joining room: ${roomId}`);
  socket.emit("join_room", roomId);

  // 2. Send Safe Message
  setTimeout(() => {
    console.log("\n--- Sending SAFE message ---");
    socket.emit("send_message", {
      roomId,
      message: "Hello everyone! I hope you are having a great day.",
      username: "TestUser"
    });
  }, 1000);

  // 3. Send Unsafe Message
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

// Keep the script running for a bit then exit
setTimeout(() => {
  console.log("\nTest finished. Exiting...");
  socket.disconnect();
  process.exit(0);
}, 6000);
