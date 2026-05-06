import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Button, Modal, Input, Spinner, Badge } from '../components/UI';
import { Plus, Users, Calendar, Trash2, UserPlus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '', project: id 
  });
  const { isAdmin, user: currentUser } = useAuth();

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/projects`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      const currentProject = projRes.data.find(p => p._id === id);
      setProject(currentProject);
      setTasks(taskRes.data);
      
      const memberInfo = currentProject.members.find(m => (m.user?._id || m.user) === currentUser?._id);
      const isProjectAdmin = memberInfo?.role === 'Admin';
      
      if (isProjectAdmin) {
        const userRes = await api.get('/auth/users').catch(() => ({ data: [] }));
        setUsers(userRes.data);
      }
    } catch (error) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const memberInfo = project?.members?.find(m => (m.user?._id || m.user) === currentUser?._id);
  const isProjAdmin = memberInfo?.role === 'Admin';

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', newTask);
      toast.success('Task created');
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', assignedTo: '', dueDate: '', project: id });
      fetchData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getPriorityVariant = (p) => {
    if (p === 'High') return 'red';
    if (p === 'Medium') return 'yellow';
    return 'green';
  };

  const getStatusVariant = (s, dueDate) => {
    if (s === 'Done') return 'green';
    if (new Date(dueDate) < new Date()) return 'red';
    if (s === 'In Progress') return 'blue';
    return 'gray';
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!project) return <div className="text-center py-20 font-bold text-slate-500">Project not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-extrabold text-slate-900">{project.title}</h1>
              <Badge variant={isProjAdmin ? 'red' : 'blue'}>{isProjAdmin ? 'Admin' : 'Member'}</Badge>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg mb-8">{project.description}</p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <Calendar size={18} />
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-semibold">
                <Users size={18} />
                <span>{project.members?.length} Members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
            {isProjAdmin && (
              <Button onClick={() => setIsTaskModalOpen(true)} className="flex items-center gap-2">
                <Plus size={18} />
                <span>New Task</span>
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">No tasks assigned to this project yet.</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary-200 transition-colors group">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-900">{task.title}</h4>
                      <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Users size={12} /> {task.assignedTo?.name}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={getStatusVariant(task.status, task.dueDate)}>
                      {new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'Overdue' : task.status}
                    </Badge>
                    
                    <select 
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                      disabled={!isProjAdmin && task.assignedTo?._id !== currentUser?._id}
                      className="bg-slate-50 border border-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800">Team Members</h3>
              {isProjAdmin && (
                <button onClick={() => setIsMemberModalOpen(true)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <UserPlus size={20} />
                </button>
              )}
            </div>
            <div className="space-y-4">
              {project.members?.map((member) => (
                <div key={member.user?._id || member.user} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {member.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{member.user?.name || 'User'}</p>
                      <p className="text-xs text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                  {isProjAdmin && (member.user?._id || member.user) !== project.createdBy && (
                    <button className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input 
            label="Task Title" 
            value={newTask.title} 
            onChange={e => setNewTask({...newTask, title: e.target.value})} 
            required 
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Description</label>
            <textarea 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all min-h-[80px]"
              value={newTask.description} 
              onChange={e => setNewTask({...newTask, description: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Priority</label>
              <select 
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all"
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <Input 
              label="Due Date" 
              type="date" 
              value={newTask.dueDate} 
              onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Assign To</label>
            <select 
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary-500 transition-all"
              value={newTask.assignedTo}
              onChange={e => setNewTask({...newTask, assignedTo: e.target.value})}
              required
            >
              <option value="">Select Member</option>
              {project.members?.map(m => (
                <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                  {m.user?.name || 'Unknown User'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
