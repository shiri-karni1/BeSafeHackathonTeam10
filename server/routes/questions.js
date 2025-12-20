import express from 'express';
import Question from '../models/Question.js';
import { evaluateMessage } from '../services/safetyAgent.js';

const router = express.Router();

// get all question titles (chats)
router.get('/', async (req, res) => {
  try {
    // Return questions without the messages array (lighter payload for home page)
    const questions = await Question.find().select('-messages').sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a specific question (chat room)
// Get question + answers by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (question) {
      res.json(question);
    } else {
      res.status(404).json({ message: 'Question not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new question (Start a chat)
router.post('/', async (req, res) => {
  try {
    const { title, content, username } = req.body;

    // Safety Check
    const combinedText = `${title}\n${content}`;
    
    console.time("SafetyCheck-Question");
    const { isSafe, feedback, reason } = await evaluateMessage(combinedText);
    console.timeEnd("SafetyCheck-Question");

    if (!isSafe) {
      return res.status(400).json({ 
        message: 'Question blocked by Safety Agent', 
        feedback, 
        reason 
      });
    }

    const newQuestion = await Question.create({
      title,
      content,
      username,
      messages: []
    });
    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add answer to a question (message in chat room)
router.post('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { text, sender } = req.body;

    // 1. Check Safety
    console.time("SafetyCheck-Message");
    const { isSafe, feedback, reason } = await evaluateMessage(text);
    console.timeEnd("SafetyCheck-Message");

    if (!isSafe) {
      return res.status(400).json({ 
        message: 'Message blocked by Safety Agent', 
        feedback, 
        reason 
      });
    }

    // 2. Find Question and Add Message
    const question = await Question.findById(id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const newMessage = { text, sender, isSafe, feedback };
    question.messages.push(newMessage);
    await question.save();

    // Get the saved message (with _id and timestamp)
    const savedMessage = question.messages[question.messages.length - 1];

    // 3. Emit to Socket.IO Room (Real-time update)
    if (req.io) {
      req.io.to(id).emit('receive_message', savedMessage);
    }

    // Return the last message added
    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
