import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { CheckSquare } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-200 mb-6">
            <CheckSquare size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2 font-medium">Join your team today</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'Member'})}
                  className={`py-2.5 rounded-xl border-2 transition-all font-semibold ${
                    formData.role === 'Member' 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'Admin'})}
                  className={`py-2.5 rounded-xl border-2 transition-all font-semibold ${
                    formData.role === 'Admin' 
                    ? 'border-primary-600 bg-primary-50 text-primary-700' 
                    : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full !mt-8" disabled={loading}>
              {loading ? 'Creating Account...' : 'Get Started'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
