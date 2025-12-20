import { evaluateMessage } from '../services/safetyAgent.js';
import Question from '../models/Question.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    // Note: 'send_message' is now handled via the REST API (questionController.js)
    // The API will broadcast the 'receive_message' event to this room.

    socket.on('disconnect', () => {
      console.log('User Disconnected', socket.id);
    });
  });
};
