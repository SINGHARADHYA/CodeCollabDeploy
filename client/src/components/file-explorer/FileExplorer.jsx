import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import NewFileDialog from './NewFileDialog';
import { getFileIcon } from '@/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { FilePlus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FileExplorer() {
  const { files, activeFileId, openFile, removeFile } = useEditor();
  const { socket } = useSocket();
  const { roomId } = useRoom();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileClick = (fileId) => {
    openFile(fileId);
    if (socket && roomId) {
      socket.emit('file-switch', { roomId, fileId });
    }
  };

  const handleDeleteFile = (e, fileId) => {
    e.stopPropagation();
    if (files.length <= 1) return;
    removeFile(fileId);
    if (socket && roomId) {
      socket.emit('file-delete', { roomId, fileId });
    }
  };

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <span className="file-explorer-title">FILES</span>
        <Button
          variant="ghost"
          size="sm"
          className="file-explorer-add"
          onClick={() => setDialogOpen(true)}
        >
          <FilePlus size={14} />
        </Button>
      </div>

      <ScrollArea className="file-explorer-list">
        {files.map((file) => (
          <div
            key={file.id}
            className={cn('file-explorer-item', activeFileId === file.id && 'file-explorer-item--active')}
            onClick={() => handleFileClick(file.id)}
          >
            <span className="file-explorer-icon">{getFileIcon(file.name)}</span>
            <span className="file-explorer-name">{file.name}</span>
            {files.length > 1 && (
              <button
                className="file-explorer-delete"
                onClick={(e) => handleDeleteFile(e, file.id)}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </ScrollArea>

      <NewFileDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
