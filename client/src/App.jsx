import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from '@/context/SocketContext';
import { RoomProvider } from '@/context/RoomContext';
import { EditorProvider } from '@/context/EditorContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import DashboardPage from '@/pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <RoomProvider>
          <EditorProvider>
            <TooltipProvider>
              <div className="app dark">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
                <Toaster
                  position="bottom-right"
                  theme="dark"
                  richColors
                  closeButton
                />
              </div>
            </TooltipProvider>
          </EditorProvider>
        </RoomProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
