// In-memory room state manager
const rooms = new Map();

function createRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: [],
      files: [
        {
          id: 'main.js',
          name: 'main.js',
          language: 'javascript',
          content: '// Welcome to CodeCollab!\n// Start coding together...\n\nconsole.log("Hello, World!");\n',
        },
      ],
      activeFileId: 'main.js',
    });
  }
  return rooms.get(roomId);
}

function joinRoom(roomId, user) {
  const room = createRoom(roomId);
  const existingUser = room.users.find((u) => u.socketId === user.socketId);
  if (!existingUser) {
    room.users.push(user);
  }
  return room;
}

function leaveRoom(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.users = room.users.filter((u) => u.socketId !== socketId);

  // Clean up empty rooms after a delay
  if (room.users.length === 0) {
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (currentRoom && currentRoom.users.length === 0) {
        rooms.delete(roomId);
      }
    }, 60000); // Keep room for 1 minute after last user leaves
  }

  return room;
}

function getRoomState(roomId) {
  return rooms.get(roomId) || null;
}

function updateFileContent(roomId, fileId, content) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const file = room.files.find((f) => f.id === fileId);
  if (file) {
    file.content = content;
  }
  return file;
}

function addFile(roomId, file) {
  const room = rooms.get(roomId);
  if (!room) return null;

  const existing = room.files.find((f) => f.id === file.id);
  if (!existing) {
    room.files.push(file);
  }
  return room.files;
}

function deleteFile(roomId, fileId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.files = room.files.filter((f) => f.id !== fileId);
  if (room.activeFileId === fileId && room.files.length > 0) {
    room.activeFileId = room.files[0].id;
  }
  return room.files;
}

function getUserRoomId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.users.some((u) => u.socketId === socketId)) {
      return roomId;
    }
  }
  return null;
}

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomState,
  updateFileContent,
  addFile,
  deleteFile,
  getUserRoomId,
};
