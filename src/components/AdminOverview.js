import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminOverview({ stats, onRefresh }) {
  const navigate = useNavigate();

  const cards = [
    { label: 'Total Students', value: stats.total, icon: '👨‍🎓', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Blacklisted', value: stats.blacklisted, icon: '🚫', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: 'Classes', value: stats.classes, icon: '🏫', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    { label: 'Batches', value: stats.batches, icon: '📚', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ];

  const quickActions = [
    { label: 'Add New Student', icon: '➕', path: '/admin/students', color: '#6366f1' },
    { label: 'Enter Marks', icon: '📝', path: '/admin/marks', color: '#10b981' },
    { label: 'View All Students', icon: '👥', path: '/admin/students', color: '#06b6d4' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📊 Dashboard Overview</div>
          <div className="page-subtitle">Welcome to RK Coaching Admin Panel</div>
        </div>
        <button className="btn btn-secondary" onClick={onRefresh}>🔄 Refresh</button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {cards.map(c => (
          <div className="stat-card" key={c.label}>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
              {c.icon}
            </div>
            <div>
              <div className="stat-value" style={{ color: c.color }}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {quickActions.map(a => (
            <button
              key={a.label}
              className="btn"
              style={{ background: `${a.color}20`, color: a.color, border: `1px solid ${a.color}30` }}
              onClick={() => navigate(a.path)}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 700 }}>ℹ️ System Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Platform', 'RK Coaching Result System'],
            ['Version', 'v1.0.0'],
            ['Backend', 'Python / Flask'],
            ['Frontend', 'React.js'],
            ['Database', 'SQLite'],
            ['Auth', 'JWT Tokens'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 8, fontSize: 14 }}>
              <span style={{ color: '#94a3b8', minWidth: 90 }}>{k}:</span>
              <span style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
