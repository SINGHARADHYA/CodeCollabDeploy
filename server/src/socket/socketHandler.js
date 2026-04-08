const roomManager = require('./roomManager');

function initializeSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a room
    socket.on('join-room', ({ roomId, username }) => {
      socket.join(roomId);

      const user = {
        socketId: socket.id,
        username,
        color: generateUserColor(),
      };

      const room = roomManager.joinRoom(roomId, user);

      // Send current room state to the joining user
      socket.emit('room-state', {
        users: room.users,
        files: room.files,
        activeFileId: room.activeFileId,
      });

      // Notify others in the room
      socket.to(roomId).emit('user-joined', {
        user,
        users: room.users,
      });

      console.log(`${username} joined room ${roomId}`);
    });

    // Code change
    socket.on('code-change', ({ roomId, fileId, content }) => {
      roomManager.updateFileContent(roomId, fileId, content);
      socket.to(roomId).emit('code-change', { fileId, content });
    });

    // Language change
    socket.on('language-change', ({ roomId, fileId, language }) => {
      const room = roomManager.getRoomState(roomId);
      if (room) {
        const file = room.files.find((f) => f.id === fileId);
        if (file) {
          file.language = language;
        }
      }
      socket.to(roomId).emit('language-change', { fileId, language });
    });

    // File creation
    socket.on('file-create', ({ roomId, file }) => {
      const files = roomManager.addFile(roomId, file);
      socket.to(roomId).emit('file-created', { file, files });
    });

    // File deletion
    socket.on('file-delete', ({ roomId, fileId }) => {
      const files = roomManager.deleteFile(roomId, fileId);
      socket.to(roomId).emit('file-deleted', { fileId, files });
    });

    // File switch
    socket.on('file-switch', ({ roomId, fileId }) => {
      const room = roomManager.getRoomState(roomId);
      if (room) {
        room.activeFileId = fileId;
      }
      socket.to(roomId).emit('file-switched', { fileId });
    });

    // Cursor position
    socket.on('cursor-change', ({ roomId, cursor, username }) => {
      socket.to(roomId).emit('cursor-change', { socketId: socket.id, cursor, username });
    });

    // Chat message
    socket.on('chat-message', ({ roomId, message, username }) => {
      socket.to(roomId).emit('chat-message', {
        id: Math.random().toString(36).substr(2, 9),
        message,
        username,
        timestamp: new Date().toISOString()
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const roomId = roomManager.getUserRoomId(socket.id);
      if (roomId) {
        const room = roomManager.leaveRoom(roomId, socket.id);
        if (room) {
          io.to(roomId).emit('user-left', {
            socketId: socket.id,
            users: room.users,
          });
        }
      }
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

function generateUserColor() {
  const colors = [
    '#7c3aed', '#3b82f6', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4',
    '#84cc16', '#f97316', '#14b8a6', '#6366f1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = { initializeSocketHandlers };
