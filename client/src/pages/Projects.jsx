import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button, Modal, Input, Spinner, Badge } from '../components/UI';
import { Plus, Briefcase, Users, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [view, setView] = useState('mine'); // 'mine' or 'all'
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mineRes, allRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects?all=true')
      ]);
      setProjects(mineRes.data);
      setAllProjects(allRes.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created successfully');
      setIsModalOpen(false);
      setNewProject({ title: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleJoinProject = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/projects/${id}/join`);
      toast.success('Joined project successfully');
      fetchData();
      setView('mine');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join project');
    }
  };

  const handleDeleteProject = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const currentProjects = view === 'mine' ? projects : allProjects;

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 font-medium">Manage and monitor your team projects</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus size={20} />
          <span>Create Project</span>
        </Button>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setView('mine')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            view === 'mine' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          My Projects
          {view === 'mine' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setView('all')}
          className={`px-6 py-3 font-bold text-sm transition-all relative ${
            view === 'all' ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Browse All
          {view === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />}
        </button>
      </div>

      {currentProjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No projects found</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            {view === 'mine' ? "You haven't joined any projects yet. Browse all projects to get started." : "No projects have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {currentProjects.map((project) => {
            const isMember = project.members?.some(m => m.user === user?._id || m.user?._id === user?._id);
            const isAdmin = project.members?.find(m => (m.user === user?._id || m.user?._id === user?._id) && m.role === 'Admin');

            return (
              <div 
                key={project._id} 
                onClick={() => isMember && navigate(`/projects/${project._id}`)}
                className={`group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all relative overflow-hidden ${
                  isMember ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : 'opacity-80'
                }`}
              >
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDeleteProject(project._id, e)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${
                  isMember ? 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Briefcase size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{project.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{project.description}</p>
                
                <div className="flex flex-col gap-4 mt-auto">
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Users size={16} />
                        <span className="text-xs font-bold">{project.members?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={16} />
                        <span className="text-xs font-bold">{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {isMember ? (
                      <div className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={20} />
                      </div>
                    ) : (
                      <button 
                        onClick={(e) => handleJoinProject(project._id, e)}
                        className="text-xs font-bold bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-primary-600 transition-colors"
                      >
                        Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Website Redesign"
            value={newProject.title}
            onChange={(e) => setNewProject({...newProject, title: e.target.value})}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all min-h-[100px]"
              placeholder="What is this project about?"
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
