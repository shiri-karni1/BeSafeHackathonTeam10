import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Chat from '../models/Chat.js';
import AppError from '../../utils/AppError.js';

export const createUser = async (userData) => {
  /* 
   * Error Handling:
   * - user.save() throws if validation fails (e.g. missing fields) 
   *   or if username is duplicate (MongoError code 11000).
   * - These errors propagate up to the route handler.
   */
  const user = new User(userData);
  return await user.save();
};

export const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    // Use generic message for security
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  return user;
};

export const getUserQuestions = async (username) => {
  // Find chats where the username matches
  return await Chat.find({ username }).select('-messages');
};