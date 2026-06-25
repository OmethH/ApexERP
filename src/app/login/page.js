'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Dumbbell, Mail, Lock, AlertCircle, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <Dumbbell size={32} color="white" />
            </div>
            <h1>POWER <span>WORLD</span></h1>
            <p>Management System</p>
          </div>

          {/* Login Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-tertiary)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="demo-accounts">
            <h3>Quick Demo Access</h3>
            <button
              className="demo-account-btn"
              onClick={() => handleDemoLogin('admin@powerworld.com', 'admin123')}
            >
              <div>
                <div className="role">👑 Admin</div>
                <div className="email">admin@powerworld.com</div>
              </div>
              <ChevronRight size={16} color="var(--text-tertiary)" />
            </button>
            <button
              className="demo-account-btn"
              onClick={() => handleDemoLogin('manager@powerworld.com', 'manager123')}
            >
              <div>
                <div className="role">🏢 Branch Manager</div>
                <div className="email">manager@powerworld.com</div>
              </div>
              <ChevronRight size={16} color="var(--text-tertiary)" />
            </button>
            <button
              className="demo-account-btn"
              onClick={() => handleDemoLogin('staff@powerworld.com', 'staff123')}
            >
              <div>
                <div className="role">💪 Staff</div>
                <div className="email">staff@powerworld.com</div>
              </div>
              <ChevronRight size={16} color="var(--text-tertiary)" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
