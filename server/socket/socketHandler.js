import { evaluateMessage } from '../services/safetyAgent.js';
import Question from '../models/Question.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      const { roomId, message, username } = data;

      // 1. Safety Check
      const { isSafe, feedback, reason } = await evaluateMessage(message);

      if (isSafe) {
        try {
          // 2. Save to MongoDB
          const question = await Question.findById(roomId);
          
          if (question) {
            const newMessage = {
              text: message,
              sender: username,
              isSafe: true,
              feedback: feedback // Save the positive feedback too if it exists
            };

            question.messages.push(newMessage);
            await question.save();

            // 3. Broadcast to Room
            // We send the full object so frontend has timestamps/feedback
            // The last message in the array has the new _id and createdAt
            const savedMessage = question.messages[question.messages.length - 1];
            io.to(roomId).emit('receive_message', savedMessage);
          } else {
             console.error(`Room (Question) ${roomId} not found in DB`);
          }
        } catch (error) {
          console.error("DB Error:", error);
        }
      } else {
        // Blocked
        socket.emit('message_blocked', {
          message: "Message blocked by Safety Agent",
          feedback: feedback,
          reason: reason
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected', socket.id);
    });
  });
};
