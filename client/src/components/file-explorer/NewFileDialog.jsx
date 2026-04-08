import { useState } from 'react';
import { useEditor } from '@/context/EditorContext';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { getLanguageByExt, LANGUAGES } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewFileDialog({ open, onOpenChange }) {
  const [filename, setFilename] = useState('');
  const { files, addFile } = useEditor();
  const { socket } = useSocket();
  const { roomId } = useRoom();

  const handleCreate = () => {
    const name = filename.trim();
    if (!name) {
      toast.error('Please enter a filename');
      return;
    }

    // Check for valid extension
    const ext = name.includes('.') ? '.' + name.split('.').pop() : null;
    const validExts = LANGUAGES.map((l) => l.ext);

    if (!ext || !validExts.includes(ext)) {
      toast.error(`Please use a valid extension: ${validExts.join(', ')}`);
      return;
    }

    // Check for duplicate
    if (files.some((f) => f.id === name)) {
      toast.error('A file with this name already exists');
      return;
    }

    const lang = getLanguageByExt(name);
    const newFile = {
      id: name,
      name: name,
      language: lang.value,
      content: lang.template,
    };

    addFile(newFile);

    if (socket && roomId) {
      socket.emit('file-create', { roomId, file: newFile });
    }

    setFilename('');
    onOpenChange(false);
    toast.success(`Created ${name}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-dark">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Enter a filename with extension (.js, .py, .cpp, .java)
          </DialogDescription>
        </DialogHeader>

        <Input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., solution.py"
          className="dialog-input"
          autoFocus
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
