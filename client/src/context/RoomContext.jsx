import { createContext, useContext, useState, useCallback } from 'react';
import { getLanguageByExt } from '@/lib/constants';

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);

  const joinRoom = useCallback((name, id) => {
    setUsername(name);
    setRoomId(id);
    setMessages([]);
    setIsInRoom(true);
  }, []);

  const leaveRoom = useCallback(() => {
    setUsername('');
    setRoomId('');
    setUsers([]);
    setMessages([]);
    setIsInRoom(false);
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return (
    <RoomContext.Provider
      value={{
        username,
        roomId,
        users,
        messages,
        setUsers,
        isInRoom,
        joinRoom,
        leaveRoom,
        addMessage,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
