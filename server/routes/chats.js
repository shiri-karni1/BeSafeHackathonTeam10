import express from 'express';
import Chat from '../models/Chat.js';
import { evaluateMessage } from '../services/safetyAgent.js';

const router = express.Router();

// get all chat titles
router.get('/', async (req, res) => {
  try {
    // Return chats without the messages array (lighter payload for home page)
    const chats = await Chat.find().select('-messages').sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a specific chat room
// Get chat + messages by ID
router.get('/:id', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (chat) {
      res.json(chat);
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new chat
// TODO: add inline code to controller services mvc pattern
router.post('/', async (req, res) => {
  try {
    const { title, content, username } = req.body;

    // Safety Check
    const combinedText = `${title}\n${content}`;
    
    console.time("SafetyCheck-Chat");
    const { isSafe, feedback, reason } = await evaluateMessage(combinedText);
    console.timeEnd("SafetyCheck-Chat");

    // TODO: change status code to 200 ok
    if (!isSafe) {
      return res.status(400).json({ 
        message: 'Chat blocked by Safety Agent', 
        feedback, 
        reason 
      });
    }

    const newChat = await Chat.create({
      title,
      content,
      username,
      messages: []
    });
    res.status(201).json(newChat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add message to a chat
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, sender } = req.body;

    // 1. Check Safety
    console.time("SafetyCheck-Message");
    const { isSafe, feedback, reason } = await evaluateMessage(text);
    console.timeEnd("SafetyCheck-Message");

    // TODO: change status code to 200 ok
    if (!isSafe) {
      return res.status(400).json({ 
        message: 'Message blocked by Safety Agent', 
        feedback, 
        reason 
      });
    }

    // 2. Find Chat and Add Message
    const chat = await Chat.findById(id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Ensure Socket.IO is available before proceeding
    if (!req.io) {
      return res.status(500).json({ message: 'Socket.IO is not initialized. Cannot send message.' });
    }

    const newMessage = { text, sender, isSafe, feedback };
    chat.messages.push(newMessage);
    await chat.save();

    // Get the saved message (with _id and timestamp)
    const savedMessage = chat.messages[chat.messages.length - 1];

    // 3. Emit to Socket.IO Room (Real-time update)
    req.io.to(id).emit('receive_message', savedMessage);

    // Return the last message added
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
