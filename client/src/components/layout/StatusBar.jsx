import { useEditor } from '@/context/EditorContext';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';

export default function StatusBar() {
  const { activeFile, language } = useEditor();
  const { isConnected } = useSocket();
  const { users, roomId } = useRoom();

  return (
    <footer className="status-bar">
      <div className="status-bar-left">
        <div className="status-bar-item">
          <div className={`status-dot ${isConnected ? 'status-dot--connected' : 'status-dot--disconnected'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        {roomId && (
          <div className="status-bar-item">
            <span>Room: {roomId}</span>
          </div>
        )}
      </div>

      <div className="status-bar-right">
        {activeFile && (
          <>
            <div className="status-bar-item">
              <span>{language.name}</span>
            </div>
            <div className="status-bar-item">
              <span>UTF-8</span>
            </div>
          </>
        )}
        <div className="status-bar-item">
          <span>{users.length} user{users.length !== 1 ? 's' : ''} online</span>
        </div>
      </div>
    </footer>
  );
}
