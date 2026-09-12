import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import AdminStudents from '../components/AdminStudents';
import AdminMarks from '../components/AdminMarks';
import AdminOverview from '../components/AdminOverview';
import API from '../api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [stats, setStats] = useState({ total: 0, blacklisted: 0, classes: 0, batches: 0 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await API.get('/students/');
      const students = res.data;
      const batches = [...new Set(students.map(s => s.batch))];
      const classes = [...new Set(students.map(s => s.class_name))];
      setStats({
        total: students.length,
        blacklisted: students.filter(s => s.is_blacklisted).length,
        classes: classes.length,
        batches: batches.length,
      });
    } catch (_) {}
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    setTimeout(() => { logout(); navigate('/'); }, 1000);
  };

  const navItems = [
    { path: '/admin', label: 'Overview', icon: '📊', end: true },
    { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
    { path: '/admin/marks', label: 'Marks', icon: '📝' },
  ];

  return (
    <div style={S.layout}>

      {/* ── Sidebar overlay on mobile ── */}
      {isMobile && sidebarOpen && (
        <div style={S.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        ...S.sidebar,
        ...(isMobile ? {
          position: 'fixed', top: 0, left: 0, zIndex: 200,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          width: 260,
        } : {
          width: sidebarOpen ? 260 : 72,
          position: 'sticky', top: 0, height: '100vh',
        }),
      }}>
        <div style={S.sidebarHeader}>
          <div style={S.logoBox}><img src="/Logo.png" alt="RK" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} /></div>
          {(!isMobile ? sidebarOpen : true) && (
            <div>
              <div style={S.brandName}>RK Coaching</div>
              <div style={S.brandSub}>Admin Panel</div>
            </div>
          )}
          <button style={S.collapseBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={S.nav}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                ...S.navItem,
                ...(isActive ? S.navItemActive : {}),
              })}
            >
              <span style={S.navIcon}>{item.icon}</span>
              {(isMobile || sidebarOpen) && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={S.sidebarFooter}>
          <div style={S.userInfo}>
            <div style={S.avatar}>A</div>
            {(isMobile || sidebarOpen) && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.name}</div>
              </div>
            )}
          </div>
          <button style={S.logoutBtn} onClick={handleLogout} title="Logout">
            🚪{(isMobile || sidebarOpen) && ' Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={S.mainWrap}>

        {/* ── Mobile top bar ── */}
        {isMobile && (
          <header style={S.mobileTopBar}>
            <button style={S.hamburger} onClick={() => setSidebarOpen(true)}>☰</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={S.logoBox}><img src="/Logo.png" alt="RK" style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 4 }} /></div>
              <span style={{ fontSize: 15, fontWeight: 700 }}>RK Coaching</span>
            </div>
            <button style={S.mobileLogout} onClick={handleLogout}>🚪</button>
          </header>
        )}

        <main style={{ ...S.main, paddingTop: isMobile ? 72 : undefined }}>
          <Routes>
            <Route index element={<AdminOverview stats={stats} onRefresh={fetchStats} />} />
            <Route path="students" element={<AdminStudents onStudentsChange={fetchStats} />} />
            <Route path="marks" element={<AdminMarks />} />
          </Routes>
        </main>

        {/* ── Mobile bottom nav ── */}
        {isMobile && (
          <nav style={S.bottomNav}>
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  ...S.bottomNavItem,
                  ...(isActive ? S.bottomNavItemActive : {}),
                })}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 10, marginTop: 2 }}>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

const S = {
  layout: { display: 'flex', minHeight: '100vh', background: '#0f172a' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 199, backdropFilter: 'blur(2px)',
  },
  sidebar: {
    background: '#1e293b',
    borderRight: '1px solid #334155',
    display: 'flex', flexDirection: 'column',
    transition: 'transform 0.25s ease, width 0.25s ease',
    overflow: 'hidden', flexShrink: 0,
  },
  sidebarHeader: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 14px 18px',
    borderBottom: '1px solid #334155',
  },
  logoBox: {
    width: 36, height: 36, flexShrink: 0,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  brandName: { fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' },
  brandSub: { fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' },
  collapseBtn: {
    marginLeft: 'auto', background: 'transparent', border: 'none',
    color: '#94a3b8', cursor: 'pointer', fontSize: 11, flexShrink: 0, padding: 4,
  },
  nav: { flex: 1, padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 12px', borderRadius: 10,
    color: '#94a3b8', textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  navItemActive: { background: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  navIcon: { fontSize: 18, flexShrink: 0 },
  sidebarFooter: { padding: '12px 8px', borderTop: '1px solid #334155' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 6 },
  avatar: {
    width: 34, height: 34, flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff',
  },
  logoutBtn: {
    width: '100%', padding: '9px 12px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 10, color: '#ef4444', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, fontFamily: 'Poppins, sans-serif',
    textAlign: 'left', transition: 'all 0.15s',
  },
  mainWrap: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  mobileTopBar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    background: '#1e293b', borderBottom: '1px solid #334155',
    height: 56, display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '0 16px',
  },
  hamburger: {
    background: 'transparent', border: 'none', color: '#e2e8f0',
    fontSize: 22, cursor: 'pointer', padding: 4,
  },
  mobileLogout: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 18,
    padding: '6px 10px',
  },
  main: { flex: 1, padding: '20px 16px', overflow: 'auto', paddingBottom: 80 },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
    background: '#1e293b', borderTop: '1px solid #334155',
    display: 'flex', height: 62,
  },
  bottomNavItem: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    color: '#94a3b8', textDecoration: 'none', fontSize: 11,
    transition: 'color 0.15s',
  },
  bottomNavItemActive: { color: '#818cf8' },
};
