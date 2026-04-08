import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEditor } from '@/context/EditorContext';
import { useSocket } from '@/context/SocketContext';
import { useRoom } from '@/context/RoomContext';
import { LANGUAGES, getLanguageByValue } from '@/lib/constants';

export default function LanguageSelector() {
  const { language, setLanguage, activeFileId, activeFile, updateFileContent } = useEditor();
  const { socket } = useSocket();
  const { roomId } = useRoom();

  const handleChange = (value) => {
    const lang = getLanguageByValue(value);
    
    // Confirm if the user wants to get the new template (it will erase current code)
    if (activeFile && activeFile.content.trim() !== '' && activeFile.content !== language.template) {
      if (!window.confirm(`Switching to ${lang.name} will replace your current code with the default boilerplate. Continue?`)) {
        return; // User cancelled
      }
    }

    setLanguage(lang);
    
    if (activeFile) {
      // Overwrite the previous code with the new language template (boilerplate)
      updateFileContent(activeFileId, lang.template);

      if (socket && roomId) {
        socket.emit('code-change', {
          roomId,
          fileId: activeFileId,
          content: lang.template,
        });

        socket.emit('language-change', {
          roomId,
          fileId: activeFileId,
          language: value,
        });
      }
    }
  };

  return (
    <Select value={language.value} onValueChange={handleChange}>
      <SelectTrigger className="language-selector">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent className="language-dropdown">
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.id} value={lang.value}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
