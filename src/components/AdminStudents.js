import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../api';
import AddStudentPage from './AddStudentPage';

const EMPTY_FORM = {
  user_id: '', roll_number: '', name: '', father_name: '',
  batch: '', class_name: '', section: '', email: '', phone: '', address: '', password: ''
};

export default function AdminStudents({ onStudentsChange }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);

  // Page view: 'list' | 'add' | 'edit'
  const [view, setView] = useState('list');
  const [editStudent, setEditStudent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistTarget, setBlacklistTarget] = useState(null);
  const [blacklistReason, setBlacklistReason] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filterBatch) params.batch = filterBatch;
      if (filterClass) params.class_name = filterClass;
      const res = await API.get('/students/', { params });
      setStudents(res.data);
      if (onStudentsChange) onStudentsChange();
    } catch (_) { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  }, [search, filterBatch, filterClass, onStudentsChange]);

  const fetchMeta = useCallback(async () => {
    try {
      const [b, c] = await Promise.all([
        API.get('/students/batches'),
        API.get('/students/classes')
      ]);
      setBatches(b.data);
      setClasses(c.data);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchMeta();
  }, [fetchStudents, fetchMeta]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditStudent(null);
    setView('add');
  };

  const openEdit = (s) => {
    setForm({ ...s, password: '' });
    setEditStudent(s);
    setView('edit');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editStudent) {
        await API.put(`/students/${editStudent.id}`, form);
        toast.success('✅ Student updated successfully!');
      } else {
        await API.post('/students/', form);
        toast.success('✅ Student added successfully!');
      }
      setView('list');
      fetchStudents();
      fetchMeta();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete student "${s.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/students/${s.id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (_) { toast.error('Delete failed'); }
  };

  const openBlacklist = (s) => {
    setBlacklistTarget(s);
    setBlacklistReason('');
    setShowBlacklistModal(true);
  };

  const handleBlacklist = async () => {
    try {
      const res = await API.post(`/students/${blacklistTarget.id}/blacklist`, { reason: blacklistReason });
      toast.success(res.data.message);
      setShowBlacklistModal(false);
      fetchStudents();
    } catch (_) { toast.error('Failed'); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Show Add / Edit page ──────────────────────────────
  if (view === 'add' || view === 'edit') {
    return (
      <AddStudentPage
        form={form}
        setField={f}
        isEdit={view === 'edit'}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setView('list')}
      />
    );
  }

  // ── Student List ──────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">👨‍🎓 Students</div>
          <div className="page-subtitle">Manage all enrolled students</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>➕ Add Student</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Search</div>
          <input style={inpStyle} placeholder="Name, Roll No, User ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStudents()}
          />
        </div>
        <div style={{ flex: '0 1 150px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Batch</div>
          <select style={inpStyle} value={filterBatch} onChange={e => setFilterBatch(e.target.value)}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 1 150px' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Class</div>
          <select style={inpStyle} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={fetchStudents}>🔍 Filter</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>All Students</span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{students.length} records</span>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>⏳ Loading...</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="mobile-only" style={{ padding: 12 }}>
              {students.length === 0 && (
                <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No students found</div>
              )}
              <div className="student-card-list">
                {students.map(s => (
                  <div className="student-card" key={s.id}>
                    <div className="student-card-row">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                        {s.father_name && <div style={{ fontSize: 11, color: '#94a3b8' }}>Father: {s.father_name}</div>}
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                          <span style={idBadge}>{s.user_id}</span>
                          <span className="badge badge-info">{s.roll_number}</span>
                          <span className="badge badge-primary">{s.class_name}{s.section ? ` (${s.section})` : ''}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>{s.batch}</div>
                        {s.phone && <div style={{ fontSize: 12, marginTop: 2 }}>📞 {s.phone}</div>}
                      </div>
                      <div>
                        {s.is_blacklisted
                          ? <span className="badge badge-danger">🚫 Blacklisted</span>
                          : <span className="badge badge-success">✅ Active</span>}
                      </div>
                    </div>
                    <div className="student-card-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                      <button className={`btn btn-sm ${s.is_blacklisted ? 'btn-success' : 'btn-warning'}`} onClick={() => openBlacklist(s)}>
                        {s.is_blacklisted ? '✅ Unblock' : '🚫 Block'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            <div className="desktop-only">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User ID</th><th>Roll No.</th><th>Name</th><th>Class</th>
                      <th>Batch</th><th>Contact</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No students found</td></tr>
                    )}
                    {students.map(s => (
                      <tr key={s.id}>
                        <td><span style={idBadge}>{s.user_id}</span></td>
                        <td style={{ fontWeight: 600 }}>{s.roll_number}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          {s.father_name && <div style={{ fontSize: 12, color: '#94a3b8' }}>F: {s.father_name}</div>}
                        </td>
                        <td>{s.class_name}</td>
                        <td>{s.batch}</td>
                        <td>
                          {s.phone && <div style={{ fontSize: 13 }}>📞 {s.phone}</div>}
                          {s.email && <div style={{ fontSize: 12, color: '#94a3b8' }}>✉ {s.email}</div>}
                        </td>
                        <td>
                          {s.is_blacklisted
                            ? <span className="badge badge-danger">🚫 Blacklisted</span>
                            : <span className="badge badge-success">✅ Active</span>}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>✏️ Edit</button>
                            <button className={`btn btn-sm ${s.is_blacklisted ? 'btn-success' : 'btn-warning'}`} onClick={() => openBlacklist(s)}>
                              {s.is_blacklisted ? '✅' : '🚫'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Blacklist Modal */}
      {showBlacklistModal && blacklistTarget && (
        <div className="modal-overlay" onClick={() => setShowBlacklistModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {blacklistTarget.is_blacklisted ? '✅ Remove Blacklist' : '🚫 Blacklist Student'}
              </div>
              <button style={closeBtn} onClick={() => setShowBlacklistModal(false)}>✕</button>
            </div>
            <p style={{ color: '#94a3b8', marginBottom: 20, fontSize: 14 }}>
              {blacklistTarget.is_blacklisted
                ? `Remove blacklist from "${blacklistTarget.name}"? They will be able to login again.`
                : `Blacklist "${blacklistTarget.name}"? They won't be able to login.`}
            </p>
            {!blacklistTarget.is_blacklisted && (
              <div className="form-group">
                <label>Reason (optional)</label>
                <input value={blacklistReason} onChange={e => setBlacklistReason(e.target.value)}
                  placeholder="Fee pending, misconduct..." />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowBlacklistModal(false)}>Cancel</button>
              <button
                className={`btn ${blacklistTarget.is_blacklisted ? 'btn-success' : 'btn-danger'}`}
                onClick={handleBlacklist}
              >
                {blacklistTarget.is_blacklisted ? '✅ Unblacklist' : '🚫 Blacklist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inpStyle = {
  width: '100%', padding: '10px 14px',
  background: '#334155', border: '1px solid #475569',
  borderRadius: 10, color: '#e2e8f0', fontSize: 14,
  fontFamily: 'Poppins, sans-serif',
};

const idBadge = {
  background: 'rgba(99,102,241,0.15)', color: '#818cf8',
  padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
};

const closeBtn = {
  background: 'transparent', border: 'none',
  color: '#94a3b8', cursor: 'pointer', fontSize: 18,
};
