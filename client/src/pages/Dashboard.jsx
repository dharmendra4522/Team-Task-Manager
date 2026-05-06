import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Badge, Spinner } from '../components/UI';
import { Briefcase, CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Projects', value: stats?.totalProjects, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Tasks', value: stats?.totalTasks, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Completed', value: stats?.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Overdue', value: stats?.overdueTasks, icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium">Overview of your team's progress</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
          <TrendingUp className="text-primary-600" size={20} />
          <span className="text-sm font-bold text-slate-700">Performance is up 12%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} ${card.color} p-3 rounded-2xl`}>
                <card.icon size={24} />
              </div>
              <Badge variant={card.title === 'Overdue' && card.value > 0 ? 'red' : 'gray'}>
                {card.title === 'Overdue' ? 'Attention' : 'Live'}
              </Badge>
            </div>
            <p className="text-slate-500 font-semibold text-sm">{card.title}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Tasks per Team Member</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-50">
                  <th className="pb-4">Member</th>
                  <th className="pb-4">Progress</th>
                  <th className="pb-4">Stats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats?.tasksByUser?.map((member) => (
                  <tr key={member._id} className="group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                          {member.userName?.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{member.userName}</span>
                      </div>
                    </td>
                    <td className="py-4 w-1/2">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${(member.completed / member.total) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="green">{member.completed} Done</Badge>
                        <Badge variant="gray">{member.pending} Pending</Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-primary-900 p-8 rounded-3xl shadow-xl shadow-primary-200 text-white relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Team Efficiency</h3>
            <p className="text-primary-200 mb-6 font-medium">
              Your team has completed {stats?.completedTasks} out of {stats?.totalTasks} tasks. Keep up the momentum!
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{stats?.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</span>
              </div>
              <span className="font-bold">Total Completion Rate</span>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <TrendingUp size={240} />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Task Distribution by Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(stats?.statsByStatus || {}).map(([status, count]) => (
            <div key={status} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">{status}</span>
                <span className="text-sm font-bold text-slate-500">{count} tasks</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    status === 'Done' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-400'
                  }`}
                  style={{ width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
