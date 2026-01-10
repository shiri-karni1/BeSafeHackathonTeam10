import { generateToken } from '../../services/auth/auth.middleware.js';
import AppError from '../../utils/AppError.js';

export const handleAuthError = (res, error) => {
  // Handle operational errors (known errors)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  // Handle MongoDB duplicate key error
  if (error.code === 11000) {
    return res.status(400).json({ message: 'User already exists' });
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

/**
 * Format user response with JWT token
 * Sets the token in cookies and also returns it in the response
 */
export const formatUserResponse = (user, res) => {
  const token = generateToken(user._id);
  
  // Set token in httpOnly cookie (secure in production)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return {
    _id: user.id,
    username: user.username,
    token, // Also return in response for client-side storage if needed
  };
};