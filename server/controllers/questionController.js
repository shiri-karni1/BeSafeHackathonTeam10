import questions from '../data/questionData.js';
import { v4 as uuidv4 } from 'uuid';
import { evaluateMessage } from '../services/safetyAgent.js';

// Get all questions
export const getAllQuestions = (req, res) => {
    res.status(200).json(questions);
};

// Get a single question by ID
export const getQuestionById = (req, res) => {
    const { id } = req.params;
    const question = questions.find(q => q.id === id);

    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json(question);
};

// Create a new question (Start a chat)
export const createQuestion = (req, res) => {
    const { title, content, username } = req.body;

    if (!title || !content || !username) {
        return res.status(400).json({ message: "Title, content, and username are required" });
    }

    const newQuestion = {
        id: uuidv4(),
        title,
        content,
        username,
        timestamp: new Date().toISOString(),
        messages: []
    };

    questions.push(newQuestion);
    res.status(201).json(newQuestion);
};

// Add a message to a question (This might be handled via Socket.IO mostly, but good to have an API too)
export const addMessage = async (req, res) => {
    const { id } = req.params;
    const { text, sender } = req.body;

    const question = questions.find(q => q.id === id);

    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }

    // Safety Check
    const { isSafe, feedback, reason } = await evaluateMessage(text);

    if (!isSafe) {
        return res.status(400).json({ 
            message: "Message blocked by Safety Agent", 
            feedback: feedback,
            reason: reason || "Content violates safety guidelines." 
        });
    }

    const newMessage = {
        id: uuidv4(),
        text,
        sender,
        timestamp: new Date().toISOString(),
        feedback: feedback // Include feedback if it's safe but has a note
    };

    question.messages.push(newMessage);
    res.status(201).json(newMessage);
};
