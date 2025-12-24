import mongoose from 'mongoose';
import Chat from '../models/Chat.js';

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
  return await Chat.create({
    ...chatData,
    messages: []
  });
};

/**
 * Add a message to a chat
 */
export const addMessageToChat = async (chatId, text, username) => {
  if (!mongoose.Types.ObjectId.isValid(chatId)) return null;
  
  const chat = await Chat.findById(chatId);
  if (!chat) return null;

  const messageData = {
    text,
    username,
    isSafe: true,
    feedback: null
  };

  chat.messages.push(messageData);
  await chat.save();
  
  // Return the last saved message (with generated _id and timestamp)
  return chat.messages[chat.messages.length - 1];
};
