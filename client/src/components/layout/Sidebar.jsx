import FileExplorer from '@/components/file-explorer/FileExplorer';
import { cn } from '@/lib/utils';

export default function Sidebar({ isOpen }) {
  return (
    <aside className={cn('editor-sidebar', !isOpen && 'editor-sidebar--collapsed')}>
      <div className="sidebar-header">
        <span className="sidebar-header-title">Explorer</span>
      </div>
      <div className="sidebar-content">
        <FileExplorer />
      </div>
    </aside>
  );
}
