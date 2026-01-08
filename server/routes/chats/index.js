import express from "express";
import * as dbService from "../../db/crud/chat.crud.js";
import * as socketService from "../../services/socket/socket.service.js";
import { sendChatNotFound, handleSafetyCheck, handleError } from "./helpers.js";
import { verifyToken } from "../../services/auth/auth.middleware.js";

const router = express.Router();

// --- Routes ---

// Get all chat titles (requires authentication)
router.get("/", verifyToken, async (req, res) => {
  try {
    const chats = await dbService.getAllChats();
    res.json(chats);
  } catch (error) {
    handleError(res, error);
  }
});

// Get chat + messages by ID (requires authentication)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const chat = await dbService.getChatById(req.params.id);
    if (!chat) return sendChatNotFound(res);
    res.json(chat);
  } catch (error) {
    handleError(res, error);
  }
});

// Create a new chat (requires authentication)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content, username } = req.body;

    // 1) Safety + Verification (BLOCK/WARN/APPROVE)
    const combinedText = `${title}\n${content}`;
    const check = await handleSafetyCheck(res, combinedText, "Chat");
    if (!check) return; // blocked (response already sent)

    // 2) Add to DB
    const newChat = await dbService.createChat({ title, content, username });

    // (Optional) Notify main lobby that a new chat was created
    // socketService.notifyChatRoom(req.io, "lobby", "new_chat", newChat);

    // 3) Respond with new chat (+ optional warning)
    res.status(201).json({
      ...newChat.toObject(),
      isSafe: true,
      warning: check.warning, // null or {...}
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Add message to a chat (requires authentication)
router.post("/:id/messages", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, username } = req.body;

    // 1) Safety + Verification (BLOCK/WARN/APPROVE)
    const check = await handleSafetyCheck(res, text, "Message");
    if (!check) return; // blocked (response already sent)

    // 2) Add to DB
    const savedMessage = await dbService.addMessageToChat(id, text, username);
    if (!savedMessage) return sendChatNotFound(res);

    // 3) Build payload with warning so EVERYONE (socket + sender) gets it
    const payload = {
      ...(savedMessage.toObject ? savedMessage.toObject() : savedMessage),
      warning: check.warning, // 🟡 null if no warning
    };

    // 4) Socket Call (send payload, not savedMessage)
    socketService.notifyChatRoom(req.io, id, "receive_message", payload);

    // 5) Respond with the same payload
    res.status(201).json(payload);
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
