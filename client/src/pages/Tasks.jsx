import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Badge, Spinner } from '../components/UI';
import { Search, Filter, Calendar, Users, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const { user } = useAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks');
        setTasks(data);
      } catch (error) {
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(task => {
    return (filter.status ? task.status === filter.status : true) &&
           (filter.priority ? task.priority === filter.priority : true);
  });

  const getPriorityVariant = (p) => {
    if (p === 'High') return 'red';
    if (p === 'Medium') return 'yellow';
    return 'green';
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Tasks</h1>
          <p className="text-slate-500 font-medium">Review and filter all project tasks</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select 
            className="bg-white border border-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            value={filter.status}
            onChange={e => setFilter({...filter, status: e.target.value})}
          >
            <option value="">All Status</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select 
            className="bg-white border border-slate-200 text-sm font-semibold px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 transition-all cursor-pointer"
            value={filter.priority}
            onChange={e => setFilter({...filter, priority: e.target.value})}
          >
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Task Info</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-slate-500 font-medium">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-800 group-hover:text-primary-600 transition-colors">{task.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Briefcase size={14} />
                        <span>{task.project?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Users size={14} />
                        <span>{task.assignedTo?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                        <Calendar size={14} />
                        <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500 font-bold' : ''}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant={task.status === 'Done' ? 'green' : task.status === 'In Progress' ? 'blue' : 'gray'}>
                        {task.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
