import Question from '../models/Question.js';
import { evaluateMessage } from '../services/safetyAgent.js';

// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
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
};

// Create a new question (Start a chat)
export const createQuestion = async (req, res) => {
  try {
    const { title, content, username } = req.body;
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
};

// Add a message to a question (REST way)
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, sender } = req.body;

    // 1. Check Safety
    const { isSafe, feedback, reason } = await evaluateMessage(text);

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

    // Return the last message added (which now has an _id)
    res.status(201).json(question.messages[question.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
