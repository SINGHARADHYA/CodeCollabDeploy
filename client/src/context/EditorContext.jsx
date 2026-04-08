import { createContext, useContext, useState, useCallback } from 'react';
import { getLanguageByExt, LANGUAGES } from '@/lib/constants';

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [openTabs, setOpenTabs] = useState([]);
  const [language, setLanguage] = useState(LANGUAGES[0]);

  const initializeFiles = useCallback((initialFiles, initialActiveFileId) => {
    setFiles(initialFiles);
    setActiveFileId(initialActiveFileId);
    if (initialFiles.length > 0) {
      const activeFile = initialFiles.find((f) => f.id === initialActiveFileId) || initialFiles[0];
      setOpenTabs([activeFile.id]);
      setLanguage(getLanguageByExt(activeFile.name));
    }
  }, []);

  const openFile = useCallback(
    (fileId) => {
      setActiveFileId(fileId);
      setOpenTabs((prev) => (prev.includes(fileId) ? prev : [...prev, fileId]));
      const file = files.find((f) => f.id === fileId);
      if (file) {
        setLanguage(getLanguageByExt(file.name));
      }
    },
    [files]
  );

  const closeTab = useCallback(
    (fileId) => {
      setOpenTabs((prev) => {
        const newTabs = prev.filter((id) => id !== fileId);
        if (activeFileId === fileId && newTabs.length > 0) {
          setActiveFileId(newTabs[newTabs.length - 1]);
        }
        return newTabs;
      });
    },
    [activeFileId]
  );

  const addFile = useCallback((file) => {
    setFiles((prev) => [...prev, file]);
    setOpenTabs((prev) => [...prev, file.id]);
    setActiveFileId(file.id);
    setLanguage(getLanguageByExt(file.name));
  }, []);

  const removeFile = useCallback(
    (fileId) => {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      closeTab(fileId);
    },
    [closeTab]
  );

  const updateFileContent = useCallback((fileId, content) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, content } : f)));
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId) || null;

  return (
    <EditorContext.Provider
      value={{
        files,
        setFiles,
        activeFile,
        activeFileId,
        setActiveFileId,
        openTabs,
        language,
        setLanguage,
        initializeFiles,
        openFile,
        closeTab,
        addFile,
        removeFile,
        updateFileContent,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
