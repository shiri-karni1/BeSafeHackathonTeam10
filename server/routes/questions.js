import express from 'express';
import Question from '../models/Question.js';
import { evaluateMessage } from '../services/safetyAgent.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the message
 *         text:
 *           type: string
 *           description: The message content
 *         sender:
 *           type: string
 *           description: The username of the sender
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The time the message was sent
 *     Question:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - username
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the question
 *         title:
 *           type: string
 *           description: The title of the question
 *         content:
 *           type: string
 *           description: The detailed content of the question
 *         username:
 *           type: string
 *           description: The user who asked the question
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The time the question was created
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *       example:
 *         id: d5fE_asz
 *         title: How do I deal with a mean friend?
 *         content: My friend keeps making fun of me...
 *         username: Sarah123
 *         timestamp: 2023-10-27T10:00:00Z
 *         messages: []
 */

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: The questions/chat managing API
 */

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Returns the list of all questions
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: The list of the questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get a question by id
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The question id
 *     responses:
 *       200:
 *         description: The question description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: The question was not found
 */
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

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question (Start a chat)
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - username
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: The question was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       400:
 *         description: Missing required fields
 */
router.post('/', async (req, res) => {
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
});

/**
 * @swagger
 * /questions/{id}/messages:
 *   post:
 *     summary: Add a message to a question chat
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The question id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - sender
 *             properties:
 *               text:
 *                 type: string
 *               sender:
 *                 type: string
 *     responses:
 *       201:
 *         description: The message was successfully added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       400:
 *         description: Message blocked by Safety Agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message blocked by Safety Agent"
 *                 feedback:
 *                   type: string
 *                   example: "This message is hurtful and violates our community guidelines."
 *                 reason:
 *                   type: string
 *                   example: "Bullying"
 *       404:
 *         description: Question not found
 */
router.post('/:id/messages', async (req, res) => {
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
