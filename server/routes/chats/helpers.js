import { validateContent } from '../../services/safetyAgent/safety.service.js';

export const sendChatNotFound = (res) => res.status(404).json({ message: 'Chat not found' });

export const handleSafetyCheck = async (res, text, contextType) => {
  const safetyError = await validateContent(text, contextType);
  if (safetyError) {
    res.status(200).json(safetyError);
    return false; // Blocked
  }
  return true; // Safe
};

export const handleError = (res, error, status = 500) => {
  res.status(status).json({ message: error.message });
};
