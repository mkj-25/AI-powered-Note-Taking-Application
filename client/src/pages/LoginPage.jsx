import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/useAuthStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

function LoginPage() {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuthStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) return toast.error('Name is required');
        await register(form.name, form.email, form.password);
      }
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: '400px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), #A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }} className="gradient-text">
            Notra
          </span>
        </div>

        {/* Header */}
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {mode === 'login' ? 'Sign in to your workspace' : 'Start your second brain today'}
        </p>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '24px',
        }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '7px', border: 'none', cursor: 'pointer',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: mode === m ? 500 : 400,
                transition: 'all 0.15s', fontFamily: 'inherit',
              }}
            >
              {m === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'register' && (
            <Input
              label="Name"
              placeholder="Your name"
              value={form.name}
              onChange={set('name')}
              icon={User}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            icon={Mail}
            required
          />
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            icon={Lock}
            iconRight={showPass ? EyeOff : Eye}
            required
          />

          <Button
            id="auth-submit"
            type="submit"
            loading={isLoading}
            iconRight={ArrowRight}
            style={{ marginTop: '6px', width: '100%', height: '42px', fontSize: '14px' }}
          >
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>

        {/* Footer */}
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>
          By continuing, you agree to our{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Terms</span> &{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
