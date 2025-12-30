import express from 'express';
import * as userCrud from '../../db/crud/user.crud.js';
import { formatUserResponse, handleAuthError } from './helpers.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Create user
    // If user already exists, this will throw an error (code 11000) which is caught below
    // also validates required fields
    // Password hashing is handled by the User model pre-save hook
    const user = await userCrud.createUser({
      username,
      password
    });

    if (user) {
      res.status(201).json(formatUserResponse(user));
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    handleAuthError(res, error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // loginUser throws if credentials are invalid or use not found
    const user = await userCrud.loginUser(username, password);
    res.json(formatUserResponse(user));
  } catch (error) {
    handleAuthError(res, error);
  }
});

router.get('/:username/questions', async (req, res) => {
  try {
    const questions = await userCrud.getUserQuestions(req.params.username);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
