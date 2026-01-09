import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import AppError from '../../utils/AppError.js';

/**
 * Get all chats (summary only, no messages)
 */
export const getAllChats = async () => {
  return await Chat.find().select('-messages').sort({ createdAt: -1 });
};

/**
 * Get a single chat by ID
 */
export const getChatById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Chat.findById(id);
};

/**
 * Create a new chat
 */
export const createChat = async (chatData) => {
  const user = await User.findOne({ username: chatData.username });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return await Chat.create({
    ...chatData,
    messages: []
  });
};

/**
 * Add a message to a chat
 */
export const addMessageToChat = async (chatId, text, username, warning=null) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) return null;

  // Check if user exists
  const user = await User.findOne({ username });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  const chat = await Chat.findById(chatId);
  if (!chat) return null;

  const messageData = {
    text,
    username,
    isSafe: true,
    feedback: null,
    warning: warning
  };

  chat.messages.push(messageData);
  await chat.save();
  
  // Return the last saved message (with generated _id and timestamp)
  return chat.messages[chat.messages.length - 1];
};
