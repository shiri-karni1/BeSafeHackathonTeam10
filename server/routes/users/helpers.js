import jwt from 'jsonwebtoken';
import AppError from '../../utils/AppError.js';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

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

export const formatUserResponse = (user) => {
  return {
    _id: user.id,
    username: user.username,
    token: generateToken(user._id),
  };
};