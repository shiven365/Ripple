import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { Logo } from '../components/ui/Logo';
import { Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const { username, email, password } = formData;
      await registerApi({ username, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary p-4 relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-light/20 blur-[100px] rounded-full mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-dark/20 blur-[100px] rounded-full mix-blend-multiply animate-[pulse_3s_ease-in-out_infinite]" />
      
      <div className="w-full max-w-md bg-bg-primary/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-border-subtle relative z-10">
        <div className="text-center mb-10">
          <Logo size="lg" />
          <p className="text-text-secondary mt-4">Join the wave.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm mb-6 border border-red-500/20">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full p-4 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-base transition-colors"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-4 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-base transition-colors"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full p-4 bg-bg-secondary border border-border-subtle rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-brand-base transition-colors pr-12"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-light via-brand-base to-brand-dark text-white p-4 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-base hover:text-brand-dark transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
