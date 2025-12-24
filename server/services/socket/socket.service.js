/**
 * Notify clients in a specific room
 */
export const notifyChatRoom = (io, roomId, event, data) => {
  if (!io) {
    console.warn("Socket.IO not initialized, skipping notification");
    return;
  }
  io.to(roomId).emit(event, data);
};
