import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { useEditor } from '@/context/EditorContext';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useAIDebug } from '@/hooks/useAIDebug';
import { getLanguageByValue, API_BASE } from '@/lib/constants';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import StatusBar from '@/components/layout/StatusBar';
import EditorTabs from '@/components/editor/EditorTabs';
import CodeEditor from '@/components/editor/CodeEditor';
import OutputPanel from '@/components/panels/OutputPanel';
import InputPanel from '@/components/panels/InputPanel';
import AIDebugPanel from '@/components/panels/AIDebugPanel';
import ChatPanel from '@/components/panels/ChatPanel';
import { toast } from 'sonner';

export default function EditorPage() {
  const { roomId: paramRoomId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { username, roomId, isInRoom, setUsers, addMessage } = useRoom();
  const {
    files,
    activeFile,
    language,
    setLanguage,
    initializeFiles,
    addFile,
    removeFile,
    updateFileContent,
    openFile,
  } = useEditor();

  const { runCode, output, isRunning, error: runError, clearOutput } = useCodeExecution();
  const { debugCode, result: debugResult, isDebugging, error: debugError, clearResult } = useAIDebug();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stdin, setStdin] = useState('');
  const [activePanel, setActivePanel] = useState('output');
  const [isSaving, setIsSaving] = useState(false); // 'output' | 'input' | 'debug'

  // Auto-Save feature
  useEffect(() => {
    // Only auto-save if authenticated and we have files
    const token = localStorage.getItem('token');
    if (!token || files.length === 0) return;

    // Debounce save by 5 seconds of inactivity
    const handler = setTimeout(() => {
      // Background save (silently to avoid toasts on every typing pause)
      fetch(`${API_BASE}/workspaces/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: `Room: ${roomId}`,
          files: files,
          activeFileId: activeFile?.id
        })
      }).catch(err => console.error("Auto-save failed", err));
    }, 5000);

    return () => clearTimeout(handler);
  }, [files, activeFile, roomId]);

  // Redirect if not in a room
  useEffect(() => {
    if (!isInRoom) {
      navigate('/');
    }
  }, [isInRoom, navigate]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the room
    socket.emit('join-room', { roomId: paramRoomId, username });

    // Receive room state
    const handleRoomState = (state) => {
      setUsers(state.users);
      initializeFiles(state.files, state.activeFileId);
    };

    // User joined
    const handleUserJoined = ({ user, users }) => {
      setUsers(users);
      toast.success(`${user.username} joined the room`);
    };

    // User left
    const handleUserLeft = ({ socketId, users }) => {
      setUsers(users);
      toast.info('A user left the room');
    };

    // Remote language change
    const handleLanguageChange = ({ fileId, language: lang }) => {
      setLanguage(getLanguageByValue(lang));
    };

    // Remote file create
    const handleFileCreated = ({ file }) => {
      addFile(file);
      toast.info(`${file.name} was created`);
    };

    // Remote file delete
    const handleFileDeleted = ({ fileId }) => {
      removeFile(fileId);
    };

    // Remote file switch
    const handleFileSwitched = ({ fileId }) => {
      openFile(fileId);
    };

    // Chat message received
    const handleChatMessage = (msg) => {
      addMessage(msg);
      // Removed toast to avoid annoying pop-ups every message
    };

    socket.on('room-state', handleRoomState);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('language-change', handleLanguageChange);
    socket.on('file-created', handleFileCreated);
    socket.on('file-deleted', handleFileDeleted);
    socket.on('file-switched', handleFileSwitched);
    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('room-state', handleRoomState);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('language-change', handleLanguageChange);
      socket.off('file-created', handleFileCreated);
      socket.off('file-deleted', handleFileDeleted);
      socket.off('file-switched', handleFileSwitched);
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket, isConnected, paramRoomId, username, addMessage]);

  // Run code handler
  const handleRun = useCallback(() => {
    if (!activeFile) return;
    setActivePanel('output');
    runCode(activeFile.content, language.value, stdin);
  }, [activeFile, language, stdin, runCode]);

  // Debug code handler
  const handleDebug = useCallback(() => {
    if (!activeFile) return;
    setActivePanel('debug');
    const errorMsg = output?.stderr || output?.compile_output || '';
    debugCode(activeFile.content, language.value, errorMsg);
  }, [activeFile, language, output, debugCode]);

  // Apply AI fix
  const handleApplyFix = useCallback(
    (correctedCode) => {
      if (!activeFile) return;
      updateFileContent(activeFile.id, correctedCode);
      if (socket && roomId) {
        socket.emit('code-change', {
          roomId,
          fileId: activeFile.id,
          content: correctedCode,
        });
      }
      toast.success('Fix applied!');
    },
    [activeFile, socket, roomId, updateFileContent]
  );

  // Save workspace handler
  const handleSaveWorkspace = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to save your workspace.');
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/workspaces/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: `Room: ${roomId}`,
          files: files,
          activeFileId: activeFile?.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Workspace saved to your profile!');
    } catch (err) {
      toast.error(err.message || 'Failed to save workspace');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter = Run
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
      // Ctrl/Cmd + Shift + D = Debug
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handleDebug();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleDebug]);

  if (!isInRoom) return null;

  return (
    <div className="editor-page">
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onRun={handleRun}
        onDebug={handleDebug}
        onSave={handleSaveWorkspace}
        isRunning={isRunning}
        isDebugging={isDebugging}
        isSaving={isSaving}
      />

      <div className="editor-body">
        <Sidebar isOpen={sidebarOpen} />

        <div className="editor-main">
          <EditorTabs />

          <div className="editor-content">
            <div className="editor-area">
              <CodeEditor />
            </div>

            <div className="editor-panels">
              <div className="panel-tabs">
                <button
                  className={`panel-tab ${activePanel === 'output' ? 'panel-tab--active' : ''}`}
                  onClick={() => setActivePanel('output')}
                >
                  Output
                </button>
                <button
                  className={`panel-tab ${activePanel === 'input' ? 'panel-tab--active' : ''}`}
                  onClick={() => setActivePanel('input')}
                >
                  Input
                </button>
                <button
                  className={`panel-tab ${activePanel === 'debug' ? 'panel-tab--active' : ''}`}
                  onClick={() => setActivePanel('debug')}
                >
                  <span className="ai-sparkle">✨</span> AI Debug
                </button>
                <button
                  className={`panel-tab ${activePanel === 'chat' ? 'panel-tab--active' : ''}`}
                  onClick={() => setActivePanel('chat')}
                >
                  💬 Chat
                </button>
              </div>

              <div className="panel-content">
                {activePanel === 'output' && (
                  <OutputPanel
                    output={output}
                    isRunning={isRunning}
                    error={runError}
                    onClear={clearOutput}
                  />
                )}
                {activePanel === 'input' && (
                  <InputPanel stdin={stdin} onStdinChange={setStdin} />
                )}
                {activePanel === 'debug' && (
                  <AIDebugPanel
                    result={debugResult}
                    isDebugging={isDebugging}
                    error={debugError}
                    onApplyFix={handleApplyFix}
                  />
                )}
                {activePanel === 'chat' && (
                  <ChatPanel />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
