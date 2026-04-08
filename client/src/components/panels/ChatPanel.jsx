import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { Send } from 'lucide-react';

export default function ChatPanel() {
  const { socket, isConnected } = useSocket();
  const { username, roomId, messages, addMessage } = useRoom();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;

    const messagePayload = {
      roomId,
      username,
      message: inputValue.trim(),
    };

    // Optimistically add message
    const tempId = Math.random().toString(36).substr(2, 9);
    addMessage({
      id: tempId,
      username,
      message: inputValue.trim(),
      timestamp: new Date().toISOString(),
      isSelf: true,
    });

    socket.emit('chat-message', messagePayload);
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full w-full max-h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet. Send a message to start chatting!
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.username === username || msg.isSelf;
            const time = new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <span className="text-xs text-muted-foreground mb-1 ml-1 mr-1">
                  {isSelf ? 'You' : msg.username} • {time}
                </span>
                <div
                  className={`px-3 py-2 rounded-lg text-sm break-words shadow-sm ${
                    isSelf
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-medium'
                      : 'bg-muted text-muted-foreground border border-border/50'
                  }`}
                  style={isSelf ? { backgroundColor: 'var(--primary)' } : {}}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-border bg-background/50 backdrop-blur-sm">
        <form
          className="flex items-center gap-2"
          onSubmit={handleSendMessage}
        >
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 h-10 px-3 bg-muted/50 border border-border rounded-md text-sm outline-none focus:border-[var(--primary)] transition-colors text-foreground"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            title="Send Message"
            className="h-10 w-10 flex items-center justify-center rounded-md bg-[var(--primary)] text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
