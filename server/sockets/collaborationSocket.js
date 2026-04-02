import logger from '../utils/logger.js';

const setupCollaborationSocket = (io) => {
  const activeDocuments = new Map(); // noteId -> Set of socket ids
  const userCursors = new Map(); // socketId -> { noteId, userId, userName, position }

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join a note editing session
    socket.on('join-note', ({ noteId, userId, userName }) => {
      socket.join(`note:${noteId}`);
      
      if (!activeDocuments.has(noteId)) {
        activeDocuments.set(noteId, new Set());
      }
      activeDocuments.get(noteId).add(socket.id);

      userCursors.set(socket.id, { noteId, userId, userName, position: 0 });

      // Notify others in the room
      socket.to(`note:${noteId}`).emit('user-joined', {
        userId,
        userName,
        socketId: socket.id,
        activeUsers: Array.from(activeDocuments.get(noteId)).length,
      });

      logger.info(`User ${userName} joined note ${noteId}`);
    });

    // Leave a note editing session
    socket.on('leave-note', ({ noteId }) => {
      socket.leave(`note:${noteId}`);
      const cursor = userCursors.get(socket.id);
      
      if (activeDocuments.has(noteId)) {
        activeDocuments.get(noteId).delete(socket.id);
        if (activeDocuments.get(noteId).size === 0) {
          activeDocuments.delete(noteId);
        }
      }

      socket.to(`note:${noteId}`).emit('user-left', {
        userId: cursor?.userId,
        userName: cursor?.userName,
        socketId: socket.id,
      });

      userCursors.delete(socket.id);
    });

    // Broadcast content changes
    socket.on('note-change', ({ noteId, changes, userId }) => {
      socket.to(`note:${noteId}`).emit('note-updated', {
        changes,
        userId,
        socketId: socket.id,
      });
    });

    // Broadcast cursor position
    socket.on('cursor-move', ({ noteId, position, userId, userName }) => {
      userCursors.set(socket.id, { noteId, userId, userName, position });
      socket.to(`note:${noteId}`).emit('cursor-updated', {
        userId,
        userName,
        position,
        socketId: socket.id,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const cursor = userCursors.get(socket.id);
      if (cursor) {
        const { noteId, userId, userName } = cursor;
        if (activeDocuments.has(noteId)) {
          activeDocuments.get(noteId).delete(socket.id);
          if (activeDocuments.get(noteId).size === 0) {
            activeDocuments.delete(noteId);
          }
        }
        io.to(`note:${noteId}`).emit('user-left', {
          userId,
          userName,
          socketId: socket.id,
        });
      }
      userCursors.delete(socket.id);
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};

export default setupCollaborationSocket;
