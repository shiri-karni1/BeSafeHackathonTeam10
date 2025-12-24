import express from 'express';
import * as dbService from '../../db/crud/chat.crud.js';
import * as socketService from '../../services/socket/socket.service.js';
import { sendChatNotFound, handleSafetyCheck, handleError } from './helpers.js';

const router = express.Router();

// --- Routes ---

// Get all chat titles
router.get('/', async (req, res) => {
  try {
    const chats = await dbService.getAllChats();
    res.json(chats);
  } 
  catch (error) {
    handleError(res, error);
  }
});

// Get chat + messages by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await dbService.getChatById(req.params.id);
    if (!chat) return sendChatNotFound(res);
    res.json(chat);
  } 
  catch (error) {
    handleError(res, error);
  }
});

// Create a new chat
router.post('/', async (req, res) => {
  try {
    const { title, content, username } = req.body;

    // 1. Safety Check
    const combinedText = `${title}\n${content}`;
    if (!await handleSafetyCheck(res, combinedText, 'Chat')) return;

    // 2. Add to DB
    const newChat = await dbService.createChat({ title, content, username });
    
    // (Optional) Notify main lobby that a new chat was created
    // socketService.notifyChatRoom(req.io, 'lobby', 'new_chat', newChat);

    // 3. Respond with new chat
    res.status(201).json({ ...newChat.toObject(), isSafe: true });
  } 
  catch (error) {
    handleError(res, error, 400);
  }
});

// Add message to a chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, sender } = req.body;

    // 1. Safety Check
    if (!await handleSafetyCheck(res, text, 'Message')) return;

    // 2. Add to DB
    const savedMessage = await dbService.addMessageToChat(id, text, sender);

    if (!savedMessage) return sendChatNotFound(res);

    // 3. Socket Call
    socketService.notifyChatRoom(req.io, id, 'receive_message', savedMessage);

    // 4. Respond with saved message
    res.status(201).json(savedMessage);
  } 
  catch (error) {
    handleError(res, error);
  }
});

export default router;
