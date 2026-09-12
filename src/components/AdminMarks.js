import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import API from '../api';

const EMPTY_MARK = {
  student_id: '', subject: '', exam_type: 'Monthly Test',
  term: '', total_marks: 100, obtained_marks: '', remarks: '', exam_date: ''
};

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Physics', 'Drawing', 'Sanskrit', 'GK', 'History', 'Geography', 'Political Science', 'Other'];
const EXAM_TYPES = ['Monthly Test', 'Mid-Term', 'Final Exam', 'Unit Test', 'Practice Test'];

export default function AdminMarks() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMark, setEditMark] = useState(null);
  const [form, setForm] = useState(EMPTY_MARK);
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await API.get('/students/');
      setStudents(res.data);
    } catch (_) {}
  }, []);

  const fetchMarks = useCallback(async (studentId) => {
    setLoading(true);
    try {
      const res = await API.get(`/marks/student/${studentId}`);
      setMarks(res.data.marks);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleSelectStudent = (s) => {
    setSelectedStudent(s);
    fetchMarks(s.id);
  };

  const openAdd = () => {
    setForm({ ...EMPTY_MARK, student_id: selectedStudent?.id || '' });
    setEditMark(null);
    setShowModal(true);
  };

  const openEdit = (m) => {
    setForm({ ...m });
    setEditMark(m);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMark) {
        await API.put(`/marks/${editMark.id}`, form);
        toast.success('Marks updated!');
      } else {
        await API.post('/marks/', form);
        toast.success('Marks added!');
      }
      setShowModal(false);
      fetchMarks(selectedStudent.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (m) => {
    if (!window.confirm('Delete this mark entry?')) return;
    try {
      await API.delete(`/marks/${m.id}`);
      toast.success('Mark deleted');
      fetchMarks(selectedStudent.id);
    } catch (_) { toast.error('Failed'); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Compute grade letter + colour from obtained_marks & percentage — same rule as student dashboard:
  //   obtained_marks < 20  → F (red)
  //   obtained_marks >= 20 → grade by %, minimum D (never F, always green-family colour)
  const computeGrade = (obtainedMarks, percentage) => {
    const om = Number(obtainedMarks);
    if (om < 20) return { g: 'F', c: '#ef4444' };
    const pct = Number(percentage);
    if (pct >= 90) return { g: 'A+', c: '#10b981' };
    if (pct >= 80) return { g: 'A',  c: '#10b981' };
    if (pct >= 70) return { g: 'B+', c: '#06b6d4' };
    if (pct >= 60) return { g: 'B',  c: '#06b6d4' };
    if (pct >= 50) return { g: 'C',  c: '#f59e0b' };
    return { g: 'D', c: '#f97316' };
  };

  // Returns PASS/FAIL based on obtained_marks threshold of 20
  const getResult = (obtainedMarks) => Number(obtainedMarks) >= 20 ? 'PASS' : 'FAIL';

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">📝 Marks Management</div>
          <div className="page-subtitle">Add and manage student marks</div>
        </div>
        {selectedStudent && (
          <button className="btn btn-primary" onClick={openAdd}>➕ Add Marks</button>
        )}
      </div>

      <div className="marks-layout">
        {/* Student List */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 15 }}>Select Student</div>
            <input
              style={inpStyle} placeholder="Search students..."
              value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
            />
          </div>
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {filtered.map(s => (
              <div
                key={s.id}
                onClick={() => handleSelectStudent(s)}
                style={{
                  ...studentItem,
                  ...(selectedStudent?.id === s.id ? studentItemActive : {}),
                }}
              >
                <div style={{ width: 36, height: 36, background: selectedStudent?.id === s.id ? '#6366f1' : '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.roll_number} · {s.class_name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marks Panel */}
        <div>
          {!selectedStudent ? (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👈</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Select a Student</div>
              <div style={{ color: '#94a3b8', fontSize: 14 }}>Choose a student from the left panel to view and manage their marks</div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedStudent.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13 }}>{selectedStudent.roll_number} · {selectedStudent.class_name} · {selectedStudent.batch}</div>
                </div>
                <button className="btn btn-primary" onClick={openAdd} style={{ padding: '8px 16px', fontSize: 13 }}>➕ Add Marks</button>
              </div>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>⏳ Loading...</div>
              ) : (
                <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Subject</th><th>Exam Type</th><th>Marks</th><th>%</th><th>Grade</th><th>Result</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {marks.length === 0 && (
                      <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No marks added yet</td></tr>
                    )}
                    {marks.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.subject}</td>
                        <td><span className="badge badge-primary">{m.exam_type}</span></td>
                        <td>{m.obtained_marks} / {m.total_marks}</td>
                        <td>{m.percentage}%</td>
                        <td><span style={{ fontWeight: 700, color: computeGrade(m.obtained_marks, m.percentage).c }}>{computeGrade(m.obtained_marks, m.percentage).g}</span></td>
                        <td><span style={{ fontWeight: 700, color: getResult(m.obtained_marks) === 'PASS' ? '#10b981' : '#ef4444' }}>{getResult(m.obtained_marks)}</span></td>
                        <td style={{ color: '#94a3b8', fontSize: 12 }}>{m.exam_date || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editMark ? '✏️ Edit Marks' : '➕ Add Marks'}</div>
              <button style={closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Subject *</label>
                  <select value={form.subject} onChange={e => f('subject', e.target.value)} required>
                    <option value="">Select subject</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Exam Type *</label>
                  <select value={form.exam_type} onChange={e => f('exam_type', e.target.value)} required>
                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Total Marks *</label>
                  <input type="number" value={form.total_marks} onChange={e => f('total_marks', e.target.value)} required min="1" />
                </div>
                <div className="form-group">
                  <label>Obtained Marks *</label>
                  <input type="number" value={form.obtained_marks} onChange={e => f('obtained_marks', e.target.value)} required min="0" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Term</label>
                  <input value={form.term} onChange={e => f('term', e.target.value)} placeholder="Term 1, Term 2..." />
                </div>
                <div className="form-group">
                  <label>Exam Date</label>
                  <input type="date" value={form.exam_date} onChange={e => f('exam_date', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <input value={form.remarks} onChange={e => f('remarks', e.target.value)} placeholder="Good performance..." />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editMark ? '💾 Update' : '➕ Add Marks'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inpStyle = {
  width: '100%', padding: '9px 12px',
  background: '#334155', border: '1px solid #475569',
  borderRadius: 8, color: '#e2e8f0', fontSize: 13,
  fontFamily: 'Poppins, sans-serif',
};

const studentItem = {
  display: 'flex', alignItems: 'center', gap: 12,
  padding: '12px 20px', cursor: 'pointer',
  borderBottom: '1px solid rgba(51,65,85,0.5)',
  transition: 'background 0.15s',
};

const studentItemActive = {
  background: 'rgba(99,102,241,0.1)',
  borderLeft: '3px solid #6366f1',
};

const closeBtn = {
  background: 'transparent', border: 'none',
  color: '#94a3b8', cursor: 'pointer', fontSize: 18,
};
