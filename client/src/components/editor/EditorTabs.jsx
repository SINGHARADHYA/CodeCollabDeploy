import { useEditor } from '@/context/EditorContext';
import { getFileIcon } from '@/lib/constants';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EditorTabs() {
  const { files, openTabs, activeFileId, openFile, closeTab } = useEditor();

  const tabFiles = openTabs.map((id) => files.find((f) => f.id === id)).filter(Boolean);

  if (tabFiles.length === 0) return null;

  return (
    <div className="editor-tabs">
      <ScrollArea orientation="horizontal" className="editor-tabs-scroll">
        <div className="editor-tabs-list">
          {tabFiles.map((file) => (
            <div
              key={file.id}
              className={cn('editor-tab', activeFileId === file.id && 'editor-tab--active')}
              onClick={() => openFile(file.id)}
            >
              <span className="editor-tab-icon">{getFileIcon(file.name)}</span>
              <span className="editor-tab-name">{file.name}</span>
              <button
                className="editor-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(file.id);
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
