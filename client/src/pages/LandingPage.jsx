import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '@/context/RoomContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code2, Sparkles, Users, Zap, Copy, ArrowRight, Mail, KeyRound, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/constants';

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8) + '-' + Math.random().toString(36).substring(2, 6);
}

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [authStep, setAuthStep] = useState(0); // 0: loading, 1: auth, 3: logged in
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const navigate = useNavigate();
  const { joinRoom } = useRoom();
  const { connectSocket } = useSocket();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    const savedName = localStorage.getItem('name');
    if (token && savedEmail) {
      setEmail(savedEmail);
      if (savedName) setName(savedName);
      setAuthStep(3); // Already authenticated
    } else {
      setAuthStep(1); // Needs login
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Email and password are required');
      return;
    }
    if (authMode === 'signup' && !name.trim()) {
      toast.error('Name is required for signup');
      return;
    }
    
    setIsAuthLoading(true);
    try {
      const endpoint = authMode === 'signup' ? '/auth/signup' : '/auth/login';
      const body = authMode === 'signup' 
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      if (data.name) localStorage.setItem('name', data.name);
      
      toast.success(data.message);
      setAuthStep(3);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    setPassword('');
    setAuthStep(1);
    toast.success('Logged out successfully');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }
    if (!roomId.trim()) {
      toast.error('Please enter a Room ID');
      return;
    }
    joinRoom(username.trim(), roomId.trim());
    connectSocket();
    navigate(`/editor/${roomId.trim()}`);
  };

  const handleGenerateId = () => {
    const id = generateRoomId();
    setRoomId(id);
    toast.success('Room ID generated!');
  };

  const handleCopyId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied!');
    }
  };

  if (authStep === 0) return null; // loading shield

  return (
    <div className="landing-page relative">
      
      {/* Logout button at top right if authenticated */}
      {authStep === 3 && (
        <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
          <span className="text-sm text-zinc-400">{localStorage.getItem('name') || email}</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="border-violet-500 text-violet-300 hover:text-white hover:bg-violet-500/20 transition-all">
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-800 text-zinc-300 hover:text-white transition-all">
            <LogOut size={14} className="mr-2" /> Logout
          </Button>
        </div>
      )}

      {/* Animated background */}
      <div className="landing-bg">
        <div className="landing-bg-grid" />
        <div className="landing-bg-glow landing-bg-glow--1" />
        <div className="landing-bg-glow landing-bg-glow--2" />
        <div className="landing-bg-glow landing-bg-glow--3" />
        <div className="floating-code floating-code--1">{'{ }'}</div>
        <div className="floating-code floating-code--2">{'< />'}</div>
        <div className="floating-code floating-code--3">{'( )'}</div>
        <div className="floating-code floating-code--4">{'[ ]'}</div>
        <div className="floating-code floating-code--5">{'=>'}</div>
      </div>

      <div className="landing-content">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <Code2 size={32} />
          </div>
          <h1 className="landing-title">
            Code<span className="landing-title-accent">Collab</span>
          </h1>
          <p className="landing-subtitle">Real-time collaborative coding with AI-powered debugging</p>
        </div>

        <div className="landing-features">
          <div className="landing-feature"><Users size={18} /><span>Real-time Collaboration</span></div>
          <div className="landing-feature"><Zap size={18} /><span>Multi-language Execution</span></div>
          <div className="landing-feature"><Sparkles size={18} /><span>AI Debugging</span></div>
        </div>

        {/* AUTH BOX */}
        {authStep === 1 && (
          <form onSubmit={handleAuthSubmit} className="landing-form mt-8">
            <div className="landing-card shadow-2xl border border-zinc-800/50 backdrop-blur-xl bg-zinc-950/80">
              <div className="landing-card-header text-center pb-4 border-b border-zinc-800/50">
                <div className="flex gap-4 justify-center">
                  <button 
                    type="button"
                    className={`text-lg font-medium transition-colors ${authMode === 'login' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    onClick={() => setAuthMode('login')}
                  >
                    Login
                  </button>
                  <span className="text-zinc-800">|</span>
                  <button 
                    type="button"
                    className={`text-lg font-medium transition-colors ${authMode === 'signup' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    onClick={() => setAuthMode('signup')}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              
              <div className="landing-card-body p-6">
                {authMode === 'signup' && (
                  <div className="landing-field mb-4">
                    <label htmlFor="name" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                      <User size={16} /> Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="landing-input bg-zinc-900 border-zinc-800 mt-2"
                      required
                    />
                  </div>
                )}
                
                <div className="landing-field mb-4">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Mail size={16} /> Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="landing-input bg-zinc-900 border-zinc-800 mt-2"
                    required
                  />
                </div>

                <div className="landing-field mb-6">
                  <label htmlFor="password" className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <KeyRound size={16} /> Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="landing-input bg-zinc-900 border-zinc-800 mt-2"
                    required
                  />
                </div>

                <Button type="submit" className="landing-join-btn w-full py-6 text-base" disabled={isAuthLoading}>
                  {isAuthLoading ? 'Authenticating...' : (authMode === 'login' ? 'Login' : 'Create Account')}
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                
                <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-zinc-800 after:h-px after:flex-1 after:bg-zinc-800">
                  <span className="text-xs text-zinc-500 uppercase font-medium tracking-wider">or</span>
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-6 py-6 text-base border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors"
                  onClick={() => {
                    setEmail('Guest User');
                    setAuthStep(3);
                  }}
                >
                  Continue as Guest
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* JOIN ROOM BOX (Only visible after login) */}
        {authStep === 3 && (
          <form onSubmit={handleJoinRoom} className="landing-form mt-8">
            <div className="landing-card shadow-2xl border border-zinc-800/50 backdrop-blur-xl bg-zinc-950/80">
              <div className="landing-card-header text-center">
                <h2>Join a Session</h2>
                <p className="text-zinc-400 mt-2">Enter your display name and a room ID</p>
              </div>
              <div className="landing-card-body p-6">
                <div className="landing-field mb-5">
                  <label htmlFor="username" className="text-sm font-medium text-zinc-300">Display Name</label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="landing-input bg-zinc-900 border-zinc-800 mt-2"
                    autoComplete="off"
                  />
                </div>
                <div className="landing-field mb-6">
                  <label htmlFor="roomId" className="text-sm font-medium text-zinc-300">Room ID</label>
                  <div className="landing-room-input flex gap-2 mt-2">
                    <Input
                      id="roomId"
                      type="text"
                      placeholder="Enter room ID or generate one"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      className="landing-input bg-zinc-900 border-zinc-800 w-full"
                      autoComplete="off"
                    />
                    {roomId && (
                      <Button type="button" variant="outline" className="border-zinc-800 hover:bg-zinc-800 px-3" onClick={handleCopyId} title="Copy Room ID">
                        <Copy size={16} />
                      </Button>
                    )}
                  </div>
                  <button type="button" className="landing-generate-btn mt-3 flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300" onClick={handleGenerateId}>
                    <Sparkles size={14} /> Generate a Random Room ID
                  </button>
                </div>
                <Button type="submit" className="landing-join-btn w-full py-6 text-base shadow-lg shadow-violet-500/20">
                  Enter Workspace
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
