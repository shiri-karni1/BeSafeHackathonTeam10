export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Frontend emits this when entering a specific chat page
    socket.on('join_room', (roomId) => {
        // subscribe the user to a specific room
        // now each message sent to this roomId will be received by users in this room
      socket.join(roomId);
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    // Note: Socket.IO automatically handles removing the user from all rooms when they disconnect.
    // We don't need to write manual logic for it.
    // happens when user closes tab or navigates away
    socket.on('disconnect', () => {
      console.log('User Disconnected', socket.id);
    });
  });
};
