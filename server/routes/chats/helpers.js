import { validateContent } from '../../services/safetyAgent/safety.service.js';
import AppError from '../../utils/AppError.js';

export const sendChatNotFound = (res) => res.status(404).json({ message: 'Chat not found' });

export const handleSafetyCheck = async (res, text, contextType) => {
  const safetyError = await validateContent(text, contextType);
  if (safetyError) {
    res.status(200).json(safetyError);
    return false; // Blocked
  }
  return true; // Safe
};

export const handleError = (res, error) => {
  // Handle operational errors (known errors)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Handle unknown errors (don't leak details in production)
  console.error('Unexpected Error:', error);
  res.status(500).json({ message: 'Internal Server Error' });
};
