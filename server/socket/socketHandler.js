import questions from '../data/questionData.js';
import { v4 as uuidv4 } from 'uuid';
import { evaluateMessage } from '../services/safetyAgent.js';

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific chat room (e.g., based on a question ID)
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      const { roomId, message, username } = data;

      console.log(`Message received in room ${roomId}:`, message);

      // Call the Safety Agent
      const { isSafe, feedback, reason } = await evaluateMessage(message);

      if (isSafe) {
        // Find the question/room to save the message
        const question = questions.find(q => q.id === roomId);
        
        if (question) {
            const newMessage = {
                id: uuidv4(),
                text: message,
                sender: username, // or userId depending on your auth
                timestamp: new Date().toISOString(),
                feedback: feedback
            };

            // Save to "database"
            question.messages.push(newMessage);

            // Broadcast the message to everyone in the room
            io.to(roomId).emit('receive_message', newMessage);
        } else {
            console.error(`Room ${roomId} not found`);
        }
      } else {
        // Notify the sender that the message was blocked
        socket.emit('message_blocked', {
          message: "Message blocked by Safety Agent",
          feedback: feedback,
          reason: reason || 'Message content violates safety guidelines.',
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
