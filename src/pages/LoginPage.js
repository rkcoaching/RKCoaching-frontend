import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import API from '../api';

export default function LoginPage() {
  const [mode, setMode] = useState('admin'); // 'admin' | 'student'
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [studentForm, setStudentForm] = useState({
    identifier: '', password: '', batch: '', class_name: ''
  });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/admin/login', adminForm);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/student/login', studentForm);
      login(res.data.token, res.data.user);
      toast.success(`Welcome, ${res.data.user.name}!`);
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <img src="/Logo.png" alt="RK Coaching" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
          </div>
          <h1 style={styles.title}>RK Coaching</h1>
          <p style={styles.subtitle}>Barsoi Station Raghunathpur, Gandhinagar</p>
        </div>

        {/* Tab Switch */}
        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tab, ...(mode === 'admin' ? styles.tabActive : {}) }}
            onClick={() => setMode('admin')}
          >
            🔐 Admin Login
          </button>
          <button
            style={{ ...styles.tab, ...(mode === 'student' ? styles.tabActive : {}) }}
            onClick={() => setMode('student')}
          >
            👨‍🎓 Student Login
          </button>
        </div>

        {/* Admin Form */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} style={styles.form}>
            <div style={styles.formInfo}>
              <span style={styles.infoIcon}>ℹ️</span>
              <span>Welcome To Admin Panel</span>
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text" placeholder="Enter admin username"
                value={adminForm.username}
                onChange={e => setAdminForm({ ...adminForm, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" placeholder="Enter password"
                value={adminForm.password}
                onChange={e => setAdminForm({ ...adminForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={styles.submitBtn} disabled={loading}>
              {loading ? '⏳ Signing in...' : '🔐 Sign In as Admin'}
            </button>
          </form>
        )}

        {/* Student Form */}
        {mode === 'student' && (
          <form onSubmit={handleStudentLogin} style={styles.form}>
            <div style={styles.formInfo}>
              <span style={styles.infoIcon}>ℹ️</span>
              <span>Login with Roll No., User ID, or Name</span>
            </div>
            <div className="form-group">
              <label>Roll Number / User ID / Name</label>
              <input
                type="text" placeholder="e.g. RK2024001 or STU001 or Rahul"
                value={studentForm.identifier}
                onChange={e => setStudentForm({ ...studentForm, identifier: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" placeholder="Enter your password"
                value={studentForm.password}
                onChange={e => setStudentForm({ ...studentForm, password: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Batch (optional)</label>
                <input
                  type="text" placeholder="e.g. Batch 2024"
                  value={studentForm.batch}
                  onChange={e => setStudentForm({ ...studentForm, batch: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Class (optional)</label>
                <input
                  type="text" placeholder="e.g. Class 10"
                  value={studentForm.class_name}
                  onChange={e => setStudentForm({ ...studentForm, class_name: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={styles.submitBtn} disabled={loading}>
              {loading ? '⏳ Signing in...' : '👨‍🎓 View My Results'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', top: '-100px', right: '-100px',
    width: 400, height: 400,
    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: '-100px', left: '-100px',
    width: 400, height: 400,
    background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  container: {
    background: 'rgba(30,41,59,0.9)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 24,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 480,
    position: 'relative',
    zIndex: 1,
  },
  header: { textAlign: 'center', marginBottom: 28 },
  logo: {
    width: 72, height: 72,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
    overflow: 'hidden',
  },
  title: { fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8' },
  tabContainer: {
    display: 'flex', gap: 8,
    background: '#0f172a',
    padding: 6,
    borderRadius: 14,
    marginBottom: 24,
  },
  tab: {
    flex: 1, padding: '10px 0',
    background: 'transparent',
    border: 'none',
    borderRadius: 10,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Poppins, sans-serif',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
  },
  form: {},
  formInfo: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 13, color: '#94a3b8',
    marginBottom: 20,
  },
  infoIcon: { fontSize: 16 },
  submitBtn: {
    width: '100%', justifyContent: 'center',
    padding: '13px 0', fontSize: 15,
    marginTop: 4,
  },
};
