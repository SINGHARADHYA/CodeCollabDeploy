import { useRef, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useEditor } from '@/context/EditorContext';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { Loader2 } from 'lucide-react';

export default function CodeEditor() {
  const { activeFile, language, updateFileContent } = useEditor();
  const { socket } = useSocket();
  const { roomId } = useRoom();
  const editorRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
      fontLigatures: true,
      minimap: { enabled: true, scale: 1 },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'all',
      bracketPairColorization: { enabled: true },
      padding: { top: 16 },
    });

    // Custom dark theme
    monaco.editor.defineTheme('codecollab-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6a737d', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
        { token: 'type', foreground: 'e5c07b' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#e6edf3',
        'editor.lineHighlightBackground': '#161b2233',
        'editor.selectionBackground': '#7c3aed33',
        'editorCursor.foreground': '#7c3aed',
        'editor.inactiveSelectionBackground': '#7c3aed1a',
        'editorLineNumber.foreground': '#484f58',
        'editorLineNumber.activeForeground': '#e6edf3',
        'editorIndentGuide.background': '#21262d',
        'editorIndentGuide.activeBackground': '#30363d',
        'editor.selectionHighlightBackground': '#7c3aed1a',
        'editorGutter.background': '#0d1117',
      },
    });
    monaco.editor.setTheme('codecollab-dark');
  };

  // Handle local changes
  const handleChange = useCallback(
    (value) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }
      if (!activeFile) return;

      updateFileContent(activeFile.id, value);

      if (socket && roomId) {
        socket.emit('code-change', {
          roomId,
          fileId: activeFile.id,
          content: value,
        });
      }
    },
    [activeFile, socket, roomId, updateFileContent]
  );

  // Listen for remote code changes
  useEffect(() => {
    if (!socket) return;

    const handleRemoteChange = ({ fileId, content }) => {
      if (activeFile && fileId === activeFile.id && editorRef.current) {
        const currentValue = editorRef.current.getValue();
        if (currentValue !== content) {
          isRemoteUpdate.current = true;
          const position = editorRef.current.getPosition();
          editorRef.current.setValue(content);
          if (position) {
            editorRef.current.setPosition(position);
          }
        }
      }
      // Also update file content in context for non-active files
      if (!activeFile || fileId !== activeFile.id) {
        updateFileContent(fileId, content);
      }
    };

    socket.on('code-change', handleRemoteChange);
    return () => socket.off('code-change', handleRemoteChange);
  }, [socket, activeFile, updateFileContent]);

  if (!activeFile) {
    return (
      <div className="editor-empty">
        <div className="editor-empty-content">
          <span className="editor-empty-icon">📝</span>
          <p>Select or create a file to start coding</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-editor">
      <Editor
        height="100%"
        language={language.monacoLang}
        value={activeFile.content}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="editor-loading">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading editor...</span>
          </div>
        }
        options={{
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
        }}
      />
    </div>
  );
}
