import { useRoom } from '@/context/RoomContext';
import { useEditor } from '@/context/EditorContext';
import { useSocket } from '@/context/SocketContext';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useAIDebug } from '@/hooks/useAIDebug';
import UserAvatar from '@/components/room/UserAvatar';
import LanguageSelector from '@/components/editor/LanguageSelector';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Code2,
  Play,
  Bug,
  Copy,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Header({ sidebarOpen, onToggleSidebar, onRun, onDebug, onSave, isRunning, isDebugging, isSaving }) {
  const { username, roomId, users, leaveRoom } = useRoom();
  const { isConnected } = useSocket();

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard!');
  };

  const handleLeave = () => {
    leaveRoom();
    window.location.href = '/';
  };

  return (
    <header className="editor-header">
      <div className="editor-header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="editor-header-logo">
          <Code2 size={20} className="text-violet-400" />
          <span className="editor-header-title">
            Code<span className="text-violet-400">Collab</span>
          </span>
        </div>

        <div className="editor-header-room">
          <Badge variant="outline" className="room-badge" onClick={handleCopyRoomId}>
            <span className="room-badge-label">Room:</span>
            <span className="room-badge-id">{roomId}</span>
            <Copy size={12} />
          </Badge>
        </div>
      </div>

      <div className="editor-header-center">
        <LanguageSelector />

        <Button
          onClick={onRun}
          disabled={isRunning}
          className="run-btn"
          size="sm"
        >
          <Play size={14} />
          {isRunning ? 'Running...' : 'Run'}
        </Button>

        <Button
          onClick={onSave}
          disabled={isSaving}
          variant="outline"
          className="save-btn hidden sm:flex text-violet-400 border-violet-500/20 hover:bg-violet-500/10"
          size="sm"
        >
          <Save size={14} className="mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Button
          onClick={onDebug}
          disabled={isDebugging}
          variant="outline"
          className="debug-btn"
          size="sm"
        >
          <Bug size={14} />
          {isDebugging ? 'Debugging...' : 'Debug'}
        </Button>
      </div>

      <div className="editor-header-right">
        <div className="editor-header-users">
          {users.map((user) => (
            <UserAvatar
              key={user.socketId}
              username={user.username}
              color={user.color}
              size="sm"
            />
          ))}
        </div>

        <div className="connection-status">
          <div className={`connection-dot ${isConnected ? 'connection-dot--connected' : 'connection-dot--disconnected'}`} />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="leave-btn" onClick={handleLeave}>
              <LogOut size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Leave Room</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
