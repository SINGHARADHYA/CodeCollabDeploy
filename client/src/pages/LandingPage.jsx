import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '@/context/RoomContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Code2, Sparkles, Users, Zap, Copy, ArrowRight, Mail, KeyRound, LogOut, User, Terminal, Globe, Shield, RefreshCw } from 'lucide-react';
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
      setAuthStep(3);
    } else {
      setAuthStep(1);
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

  if (authStep === 0) return null;

  return (
    <div className="landing-page min-h-screen bg-[#0d1117] text-white overflow-x-hidden font-sans">
      
      {/* Top Navigation / Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-[#0d1117]/70 border-b border-indigo-500/10 transition-all">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Code2 size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Collab</span>
          </span>
        </div>

        {authStep === 3 && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 mr-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-zinc-300">{localStorage.getItem('name') || email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="border-violet-500/50 text-violet-300 hover:text-white hover:bg-violet-500/20 transition-all rounded-lg">
              Dashboard
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all rounded-lg">
              <LogOut size={14} className="mr-2" /> Logout
            </Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 z-10">
        
        {/* Background Effects specifically for Hero */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Hero Text Content */}
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
            <Sparkles size={14} /> The Future of Development is Collaborative
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-white">
            Code effortlessly <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400">
              with your team
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto lg:mx-0">
            A lightning-fast, real-time cooperative code editor powered by modern web technologies. Experience multiplayer coding, instant execution, and AI-driven debugging all in your browser.
          </p>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-12">
            <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <Globe size={16} className="text-blue-400" /> Web Based
            </div>
            <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <Zap size={16} className="text-yellow-400" /> Zero Setup
            </div>
            <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <Terminal size={16} className="text-green-400" /> Multi-Language
            </div>
          </div>
        </div>

        {/* Auth / Join Form Box */}
        <div className="w-full max-w-md z-10 shrink-0">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
              
              {authStep === 1 && (
                <form onSubmit={handleAuthSubmit}>
                  <div className="flex justify-center gap-6 mb-8 border-b border-zinc-800 pb-4">
                    <button type="button" onClick={() => setAuthMode('login')} className={`text-lg font-semibold transition-colors pb-1 ${authMode === 'login' ? 'text-white border-b-2 border-violet-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      Log In
                    </button>
                    <button type="button" onClick={() => setAuthMode('signup')} className={`text-lg font-semibold transition-colors pb-1 ${authMode === 'signup' ? 'text-white border-b-2 border-violet-500' : 'text-zinc-500 hover:text-zinc-300'}`}>
                      Sign Up
                    </button>
                  </div>
                  
                  {authMode === 'signup' && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 bg-zinc-900/50 border-zinc-800 h-12 focus-visible:ring-violet-500 text-white rounded-xl" required />
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-zinc-900/50 border-zinc-800 h-12 focus-visible:ring-violet-500 text-white rounded-xl" required />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-zinc-900/50 border-zinc-800 h-12 focus-visible:ring-violet-500 text-white rounded-xl" required />
                    </div>
                  </div>

                  <Button type="submit" disabled={isAuthLoading} className="w-full h-12 bg-white hover:bg-zinc-200 text-zinc-900 font-semibold rounded-xl text-md transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    {isAuthLoading ? <RefreshCw className="animate-spin mr-2" size={18} /> : null}
                    {isAuthLoading ? 'Authenticating...' : (authMode === 'login' ? 'Access Workspace' : 'Create Account')}
                  </Button>
                  
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <div className="h-px bg-zinc-800 flex-1"></div>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest">or</span>
                    <div className="h-px bg-zinc-800 flex-1"></div>
                  </div>

                  <Button type="button" variant="ghost" onClick={() => { setEmail('Guest User'); setAuthStep(3); }} className="w-full mt-6 h-12 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-all border border-zinc-800/50">
                    Continue as Guest <ArrowRight size={16} className="ml-2" />
                  </Button>
                </form>
              )}

              {authStep === 3 && (
                <form onSubmit={handleJoinRoom} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-violet-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-500/30">
                      <Users size={28} className="text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Join a Session</h2>
                    <p className="text-zinc-400 text-sm mt-2">Enter your display name and a room ID</p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Display Name</label>
                    <Input id="username" type="text" placeholder="Enter your name" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-zinc-900/50 border-zinc-800 h-12 focus-visible:ring-violet-500 text-white rounded-xl" autoComplete="off" />
                  </div>
                  
                  <div className="mb-6">
                    <label className="text-sm font-medium text-zinc-400 mb-1.5 block">Room ID</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input id="roomId" type="text" placeholder="e.g. abc-1234" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="bg-zinc-900/50 border-zinc-800 h-12 focus-visible:ring-violet-500 text-white rounded-xl font-mono" autoComplete="off" />
                        {roomId && (
                          <button type="button" onClick={handleCopyId} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors">
                            <Copy size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={handleGenerateId} className="mt-3 text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1.5 group transition-colors">
                      <Sparkles size={14} className="group-hover:rotate-12 transition-transform" /> Generate Random ID
                    </button>
                  </div>
                  
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl text-md transition-all shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]">
                    Enter Workspace <ArrowRight size={18} className="ml-2" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase Section */}
      <section className="border-t border-zinc-800 bg-[#0a0d14] py-24 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Everything you need to build faster</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">CodeCollab bridges the gap between solitary coding and pair programming, providing an elite toolkit for modern developers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-3xl hover:bg-zinc-900/80 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Multiplayer Editing</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">Experience Google Docs-style collaboration for code. See cursor movements, selections, and live edits in milliseconds.</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-3xl hover:bg-zinc-900/80 transition-colors group">
              <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-violet-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure execution</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">Run your code instantly in isolated sandboxes supporting over 40 programming languages without any configuration.</p>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-8 rounded-3xl hover:bg-zinc-900/80 transition-colors group">
              <div className="w-12 h-12 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="text-fuchsia-400" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Debugger</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">Stuck on an error? Our Gemini-powered AI assistant analyzes your code context to provide instant solutions and explanations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Mockup Graphic */}
      <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
        <div className="rounded-2xl border border-zinc-800 bg-[#161b22] shadow-2xl overflow-hidden aspect-video relative flex flex-col group">
          <div className="h-10 bg-[#0d1117] border-b border-zinc-800 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="mx-auto bg-zinc-900 text-zinc-500 text-xs px-24 py-1 rounded-md font-mono hidden md:block">
              CodeCollab - index.js
            </div>
          </div>
          <div className="flex-1 p-6 font-mono text-sm leading-relaxed overflow-hidden bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
            <div className="text-violet-400">import <span className="text-white">{"{ "}<span className="text-blue-300">collaborate</span>{" }"}</span> from <span className="text-green-300">'codecollab'</span>;</div>
            <br />
            <div className="text-blue-400">const <span className="text-white">project</span> = <span className="text-blue-300">collaborate</span>({'{'}</div>
            <div className="pl-4">language: <span className="text-green-300">'javascript'</span>,</div>
            <div className="pl-4">members: [<span className="text-green-300">'Alice'</span>, <span className="text-green-300">'Bob'</span>],</div>
            <div className="pl-4">features: [<span className="text-green-300">'realtime'</span>, <span className="text-green-300">'execution'</span>, <span className="text-green-300">'ai-debug'</span>]</div>
            <div>{'}'});</div>
            <br />
            <div className="text-zinc-500">// Join the revolution of pair programming</div>
            <div className="text-yellow-300">project<span className="text-white">.</span>start<span className="text-white">()</span>;</div>
            
            {/* Blinking Cursor */}
            <div className="w-2 h-4 bg-white animate-pulse mt-1 inline-block"></div>
          </div>
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-12 text-center text-zinc-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Code2 size={20} className="text-violet-500" />
          <span className="font-bold text-zinc-300 tracking-wide text-lg">CodeCollab</span>
        </div>
        <p>© 2026 CodeCollab Platform. Empowering real-time development.</p>
      </footer>
    </div>
  );
}
