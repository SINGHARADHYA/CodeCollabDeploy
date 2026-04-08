import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Folder, Trash2, Clock, Play } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE, getFileIcon } from '@/lib/constants';

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch(`${API_BASE}/workspaces`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setWorkspaces(data);
    } catch (error) {
      toast.error('Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      const res = await fetch(`${API_BASE}/workspaces/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      toast.success('Workspace deleted');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleOpenWorkspace = (workspace) => {
    toast.info("Saved Workspace Loader coming next! For now, keep your eyes out for the save button.");
  };

  if (isLoading) return <div className="min-h-screen bg-zinc-950 p-8 text-center text-white">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">My Workspaces</h1>
            <p className="text-zinc-400 mt-1">Logged in as {email}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-zinc-800 text-zinc-300" onClick={() => navigate('/')}>
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </Button>
          </div>
        </header>

        {workspaces.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-lg border border-zinc-800 shadow-xl">
            <Folder size={48} className="mx-auto text-violet-500/50 mb-4" />
            <h3 className="text-xl font-medium text-zinc-200">No saved workspaces yet</h3>
            <p className="text-zinc-500 mt-2">Save your work directly from the CodeCollab editor to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map(workspace => (
              <div key={workspace.id} className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 transition-all shadow-lg hover:shadow-violet-500/10 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold truncate pr-4 text-zinc-200 group-hover:text-violet-300 transition-colors">{workspace.name}</h3>
                  <button onClick={() => handleDelete(workspace.id)} className="text-zinc-500 hover:text-red-400 transition-colors p-1" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="text-xs text-zinc-500 mb-6 flex items-center gap-2">
                  <Clock size={12} /> 
                  Saved on {new Date(workspace.updated_at).toLocaleDateString()}
                </div>

                <div className="mb-6 flex-1">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Files ({workspace.files?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                    {workspace.files?.slice(0,3).map(f => (
                      <span key={f.id} className="px-2 py-1 bg-zinc-800/80 border border-zinc-700/50 rounded text-xs flex items-center gap-1.5 text-zinc-300">
                        <span>{getFileIcon(f.name)}</span> {f.name}
                      </span>
                    ))}
                    {workspace.files?.length > 3 && <span className="text-xs text-zinc-400 bg-zinc-800/80 border border-zinc-700/50 px-2 py-1 rounded">+{workspace.files.length - 3}</span>}
                  </div>
                </div>

                <Button 
                  className="w-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                  onClick={() => handleOpenWorkspace(workspace)}
                >
                  <Play size={14} className="mr-2" /> Open Workspace
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
