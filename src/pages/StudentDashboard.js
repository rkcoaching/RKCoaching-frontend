import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useAuth } from '../AuthContext';
import API from '../api';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterExam, setFilterExam] = useState('');

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterExam ? { exam_type: filterExam } : {};
      const res = await API.get(`/marks/student/${user.id}`, { params });
      setData(res.data);
    } catch {
      toast.error('Failed to load results');
    } finally { setLoading(false); }
  }, [user.id, filterExam]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    setTimeout(() => { logout(); navigate('/'); }, 1000);
  };
  const handlePrint  = () => window.print();

  const EXAM_TYPES = ['Monthly Test', 'Mid-Term', 'Final Exam', 'Unit Test', 'Practice Test'];

  // Grade rule:
  //   obtained_marks < 20  → F (Fail), regardless of percentage
  //   obtained_marks >= 20 → grade by percentage, minimum D (never F)
  const getGrade = (pct, obtainedMarks) => {
    if (obtainedMarks !== undefined && Number(obtainedMarks) < 20)
      return { g: 'F', c: '#ef4444' };
    if (pct >= 90) return { g: 'A+', c: '#10b981' };
    if (pct >= 80) return { g: 'A',  c: '#10b981' };
    if (pct >= 70) return { g: 'B+', c: '#06b6d4' };
    if (pct >= 60) return { g: 'B',  c: '#06b6d4' };
    if (pct >= 50) return { g: 'C',  c: '#f59e0b' };
    // obtained_marks >= 20 means student passed → minimum grade is D
    return { g: 'D', c: '#f97316' };
  };

  const getGradeLabel = (g) => {
    const map = {
      'A+': 'Outstanding', 'A': 'Excellent', 'B+': 'Very Good',
      'B': 'Good', 'C': 'Average', 'D': 'Below Average', 'F': 'Fail'
    };
    return map[g] || '';
  };

  // Chart data — uses correct snake_case fields from API
  const barData = data?.marks?.map(m => ({
    subject:  m.subject.substring(0, 6),
    obtained: m.obtained_marks,
    total:    m.total_marks,
    pct:      m.percentage,
  })) || [];

  const radarData = data?.marks?.map(m => ({
    subject: m.subject.substring(0, 8),
    value:   m.percentage,
  })) || [];

  const overallPct   = data?.summary?.overall_percentage || 0;
  const { g: overallGrade, c: gradeColor } = getGrade(overallPct);
  const hasMarks     = Array.isArray(data?.marks) && data.marks.length > 0;
  // PASS only when EVERY subject has obtained_marks >= 20; FAIL if ANY subject is < 20
  const finalResult = (() => {
    if (!hasMarks) return null;
    const allPass = data.marks.every(m => parseFloat(m.obtained_marks) >= 20);
    return allPass ? 'PASS' : 'FAIL';
  })();
  const printDate    = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  /* ─────────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          PRINT AREA — Bihar Board style result card (hidden on screen)
          ════════════════════════════════════════════════════════════════ */}
      <div className="print-only">
        {data && (
          <div className="print-page">

            {/* ── Top border strip ── */}
            <div className="p-top-strip" />

            {/* ── Institute Header ── */}
            <div className="p-header">
              <div className="p-logo"><img src="/Logo.png" alt="RK Coaching" /></div>
              <div className="p-inst">
                <div className="p-inst-name">R.K COACHING CENTER</div>
                <div className="p-inst-addr">Barsoi Station, Raghunathpur, Gandhinagar — Bihar — PIN 854317</div>
                <div className="p-inst-phone p-bold">📞 Contact: 7782917609,6206060326</div>

              </div>
            </div>

            {/* ── Result Card title strip ── */}
            <div className="p-title-strip">
              STUDENT RESULT CARD
              {/* {filterExam ? ` — ${filterExam}` : ' — ALL EXAMINATIONS'} */}
            </div>

            {/* ── Student Details Box ── */}
            <div className="p-student-box">
              <div className="p-student-row">
                <div className="p-field">
                  <span className="p-label">Student Name</span>
                  <span className="p-val p-name-big">{user?.name || '—'}</span>
                </div>
                <div className="p-field">
                  <span className="p-label">Father's Name</span>
                  <span className="p-val p-bold">{user?.father_name || '—'}</span>
                </div>
              </div>
              <div className="p-student-row p-row-4">
                <div className="p-field">
                  <span className="p-label">Roll Number</span>
                  <span className="p-val p-bold">{user?.roll_number || '—'}</span>
                </div>
                <div className="p-field">
                  <span className="p-label">User ID</span>
                  <span className="p-val p-bold">{user?.user_id || '—'}</span>
                </div>
                <div className="p-field">
                  <span className="p-label">Class</span>
                  <span className="p-val p-bold">{user?.class_name || '—'}</span>
                </div>
                <div className="p-field">
                  <span className="p-label">Section</span>
                  <span className="p-val p-bold">{user?.section || '—'}</span>
                </div>
              </div>
              <div className="p-student-row p-row-3">
                <div className="p-field">
                  <span className="p-label">Batch / Year</span>
                  <span className="p-val">{user?.batch || '—'}</span>
                </div>
                <div className="p-field">
                  <span className="p-label">Phone</span>
                  <span className="p-val">{user?.phone || '—'}</span>
                </div>
                <div className="p-field">
                  <span className="p-label">Email</span>
                  <span className="p-val">{user?.email || '—'}</span>
                </div>
              </div>
              {user?.address && (
                <div className="p-student-row">
                  <div className="p-field p-field-full">
                    <span className="p-label">Address</span>
                    <span className="p-val">{user.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Marks Table ── */}
            <table className="p-table">
              <thead>
                <tr>
                  <th className="p-th-sno">S.No.</th>
                  <th className="p-th-sub">Subject</th>
                  <th>Exam Type</th>
                  <th>Term</th>
                  <th className="p-th-num">Max Marks</th>
                  <th className="p-th-num">Marks Obtained</th>
                  <th className="p-th-num">Percentage</th>
                  <th className="p-th-num">Grade</th>
                  <th>Exam Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {data.marks.map((m, i) => {
                  const { g, c } = getGrade(m.percentage, m.obtained_marks);
                  return (
                    <tr key={m.id} className={i % 2 === 0 ? 'p-tr-even' : ''}>
                      <td className="p-td-center">{i + 1}</td>
                      <td className="p-td-sub">{m.subject}</td>
                      <td>{m.exam_type || '—'}</td>
                      <td>{m.term || '—'}</td>
                      <td className="p-td-center">{m.total_marks}</td>
                      <td className="p-td-center p-td-bold">{m.obtained_marks}</td>
                      <td className="p-td-center">{m.percentage}%</td>
                      <td className="p-td-center p-td-bold" style={{ color: c }}>{g}</td>
                      <td className="p-td-center">{m.exam_date || '—'}</td>
                      <td>{m.remarks || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="p-tr-total">
                  <td colSpan={4} className="p-td-bold">GRAND TOTAL</td>
                  <td className="p-td-center p-td-bold">{data.summary?.total_marks}</td>
                  <td className="p-td-center p-td-bold">{data.summary?.total_obtained}</td>
                  <td className="p-td-center p-td-bold">{overallPct}%</td>
                  <td className="p-td-center p-td-bold">{overallGrade}</td>
                  <td colSpan={2} className="p-td-bold">{getGradeLabel(overallGrade)}</td>
                </tr>
              </tfoot>
            </table>

            {/* ── Result Summary ── */}
            <div className="p-summary">
              <div className="p-sum-item">
                <div className="p-sum-label">Total Marks Obtained</div>
                <div className="p-sum-val">{data.summary?.total_obtained} / {data.summary?.total_marks}</div>
              </div>
              <div className="p-sum-item">
                <div className="p-sum-label">Overall Percentage</div>
                <div className="p-sum-val">{overallPct}%</div>
              </div>
              <div className="p-sum-item">
                <div className="p-sum-label">Overall Grade</div>
                <div className="p-sum-val p-sum-grade">{overallGrade} — {getGradeLabel(overallGrade)}</div>
              </div>
              <div className="p-sum-item">
                <div className="p-sum-label">Result</div>
                <div className={`p-sum-val ${finalResult === 'PASS' ? 'p-sum-pass' : finalResult === 'FAIL' ? 'p-sum-fail' : ''}`}>
                  {finalResult === 'PASS' ? '✓  PASS' : finalResult === 'FAIL' ? '✗  FAIL' : '—'}
                </div>
              </div>
            </div>

            {/* ── Grade Legend ── */}
            <div className="p-legend">
              <span className="p-legend-title">Grade Scale: </span>
              {[['A+','≥90%','Outstanding'],['A','≥80%','Excellent'],['B+','≥70%','Very Good'],
                ['B','≥60%','Good'],['C','≥50%','Average'],['D','≥40%','Below Avg'],['F','<40%','Fail']
              ].map(([gr, rng, lbl]) => (
                <span key={gr} className="p-legend-item">
                  <strong>{gr}</strong>({rng}){lbl}
                </span>
              ))}
            </div>

            {/* ── Issue Date ── */}
            <div className="p-issue-date">Date of Issue: <strong>{printDate}</strong></div>
             
            {/* ── Signatures ── */}
            <div className="p-sig-row">
              <div className="p-sig-box">
                &emsp;
                <div className="p-sig-label">Parent's Signature</div>
              </div>
              <div className="p-sig-box">
                <img src="/Mohar.png" alt="Seal" className="p-sig-img" />
              </div>
              <div className="p-sig-box">
                <img src="/Sign.png" alt="Director Signature" className="p-sig-img" />
                <div className="p-sig-label">Director Signature</div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="p-footer p-bold">
              This is a computer-generated result card. | R.K. Coaching Center, Barsoi, Bihar — PIN 854317
            </div>

            {/* ── Bottom border strip ── */}
            <div className="p-top-strip" />
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          SCREEN UI  (hidden when printing)
          ════════════════════════════════════════════════════════════════ */}
      <div className="screen-only" style={{ minHeight: '100vh', background: '#0f172a' }}>

        {/* ── Header ── */}
        <header style={S.header}>
          <div style={S.headerLeft}>
            <div style={S.logoBox}><img src="/Logo.png" alt="RK" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 4 }} /></div>
            <div>
              <div style={S.brandTitle}>RK Coaching</div>
              <div style={S.brandSub}>Result Portal</div>
            </div>
          </div>
          <div style={S.headerRight}>
            {hasMarks && (
              <button className="btn btn-success btn-sm" onClick={handlePrint}>
                🖨️ Print
              </button>
            )}
            <div style={S.userChip}>
              <div style={S.userAvatar}>{user?.name?.charAt(0)}</div>
              <div className="user-meta-hide" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{user?.name?.split(' ')[0]}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{user?.roll_number}</div>
              </div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>🚪 Logout</button>
          </div>
        </header>

        <div style={S.content}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 16 }}>Loading your results...</div>
            </div>
          ) : (
            <>
              {/* ── Profile card ── */}
              <div style={S.profileCard}>
                <div style={S.profileTop}>
                  <div style={S.profileAvatar}>{user?.name?.charAt(0)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{user?.name}</div>
                    {user?.father_name && (
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                        Father: {user.father_name}
                      </div>
                    )}
                    <div style={S.chipRow}>
                      {[
                        ['📋', 'Roll No.',  user?.roll_number],
                        ['🆔', 'User ID',   user?.user_id],
                        ['🏫', 'Class',     user?.class_name],
                        ['📚', 'Batch',     user?.batch],
                        ['🔤', 'Section',   user?.section || '—'],
                      ].map(([icon, label, val]) => (
                        <div key={label} style={S.chip}>
                          <span style={{ fontSize: 10, color: '#94a3b8' }}>{icon} {label}</span>
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{val || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={S.gradeBig}>
                    <div style={{ ...S.gradeBadge, background: `${gradeColor}20`, color: gradeColor, border: `2px solid ${gradeColor}40` }}>
                      {overallGrade}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>Overall</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: gradeColor, textAlign: 'center' }}>{overallPct}%</div>
                  </div>
                </div>
              </div>

              {/* ── Stats ── */}
              <div className="stats-grid">
                {[
                  { label: 'Subjects',    value: data?.marks?.length || 0,             icon: '📚', color: '#6366f1' },
                  { label: 'Obtained',    value: data?.summary?.total_obtained || 0,   icon: '✅', color: '#10b981' },
                  { label: 'Total',       value: data?.summary?.total_marks || 0,      icon: '📊', color: '#06b6d4' },
                  { label: 'Percentage',  value: `${overallPct}%`,                     icon: '🎯', color: gradeColor },
                ].map(s => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                    <div>
                      <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Filter + Print row ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                <div className="filter-row" style={{ marginBottom: 0 }}>
                  <button className={`btn ${filterExam === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterExam('')}>All</button>
                  {EXAM_TYPES.map(t => (
                    <button key={t} className={`btn ${filterExam === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterExam(t)}>{t}</button>
                  ))}
                </div>
                {hasMarks && (
                  <button className="btn btn-success" onClick={handlePrint} style={{ flexShrink: 0 }}>
                    🖨️ Print Result Card
                  </button>
                )}
              </div>

              {!hasMarks ? (
                <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>No results available yet</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>Results will appear here once added by admin</div>
                </div>
              ) : (
                <>
                  {/* ── Charts ── */}
                  <div className="charts-grid">
                    <div className="card">
                      <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>📊 Marks Chart</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                            formatter={(v, n) => [v, n === 'obtained' ? 'Obtained' : 'Total']}
                          />
                          <Bar dataKey="obtained" radius={[4, 4, 0, 0]}>
                            {barData.map((e, i) => (
                              <Cell key={i} fill={e.pct >= 70 ? '#10b981' : e.pct >= 50 ? '#f59e0b' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {radarData.length >= 3 ? (
                      <div className="card">
                        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>🕸️ Performance Radar</div>
                        <ResponsiveContainer width="100%" height={200}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                            <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, minHeight: 160 }}>
                        <div style={{ fontSize: 28 }}>📈</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>Add 3+ subjects for radar chart</div>
                      </div>
                    )}
                  </div>

                  {/* ── Detailed Results Table ── */}
                  <div className="card" style={{ padding: 0, marginBottom: 20 }}>
                    <div style={{ padding: '16px 18px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>📋 Detailed Results</div>
                      <button className="btn btn-success btn-sm" onClick={handlePrint}>🖨️ Print</button>
                    </div>

                    {/* Mobile cards */}
                    <div className="mobile-only">
                      <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {data.marks.map(m => {
                          const { g, c } = getGrade(m.percentage, m.obtained_marks);
                          return (
                            <div key={m.id} style={{ background: '#0f172a', borderRadius: 12, padding: '14px 16px', border: `1px solid ${c}30` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.subject}</div>
                                  <span className="badge badge-primary" style={{ marginTop: 4 }}>{m.exam_type}</span>
                                  {m.term && <span className="badge badge-info" style={{ marginTop: 4, marginLeft: 4 }}>{m.term}</span>}
                                </div>
                                <div style={{ ...S.gradeCircle, background: `${c}20`, color: c, border: `2px solid ${c}40` }}>{g}</div>
                              </div>
                              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
                                <span><span style={{ color: '#94a3b8' }}>Marks: </span><strong>{m.obtained_marks}/{m.total_marks}</strong></span>
                                <span><span style={{ color: '#94a3b8' }}>%: </span><strong style={{ color: c }}>{m.percentage}%</strong></span>
                                {m.exam_date && <span style={{ color: '#94a3b8', fontSize: 12 }}>📅 {m.exam_date}</span>}
                              </div>
                              <div style={{ height: 5, background: '#334155', borderRadius: 3, marginTop: 10 }}>
                                <div style={{ width: `${Math.min(m.percentage, 100)}%`, height: '100%', background: c, borderRadius: 3 }} />
                              </div>
                              {m.remarks && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>💬 {m.remarks}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Desktop table */}
                    <div className="desktop-only">
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Subject</th>
                              <th>Exam Type</th>
                              <th>Term</th>
                              <th>Marks</th>
                              <th>Percentage</th>
                              <th>Grade</th>
                              <th>Date</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.marks.map((m, i) => {
                              const { g, c } = getGrade(m.percentage, m.obtained_marks);
                              return (
                                <tr key={m.id}>
                                  <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                                  <td style={{ fontWeight: 600 }}>{m.subject}</td>
                                  <td><span className="badge badge-primary">{m.exam_type || '—'}</span></td>
                                  <td style={{ color: '#94a3b8' }}>{m.term || '—'}</td>
                                  <td>
                                    <strong>{m.obtained_marks}</strong>
                                    <span style={{ color: '#94a3b8', fontSize: 12 }}> / {m.total_marks}</span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <div style={{ width: 60, height: 5, background: '#334155', borderRadius: 3 }}>
                                        <div style={{ width: `${Math.min(m.percentage, 100)}%`, height: '100%', background: c, borderRadius: 3 }} />
                                      </div>
                                      <span style={{ fontWeight: 600, color: c, fontSize: 12 }}>{m.percentage}%</span>
                                    </div>
                                  </td>
                                  <td><span style={{ fontWeight: 800, color: c, fontSize: 15 }}>{g}</span></td>
                                  <td style={{ color: '#94a3b8', fontSize: 12 }}>{m.exam_date || '—'}</td>
                                  <td style={{ color: '#94a3b8', fontSize: 12 }}>{m.remarks || '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr style={{ background: 'rgba(99,102,241,0.08)', fontWeight: 700 }}>
                              <td colSpan={4} style={{ padding: '10px 14px', color: '#818cf8' }}>TOTAL</td>
                              <td style={{ padding: '10px 14px' }}>
                                <strong style={{ color: '#10b981' }}>{data.summary?.total_obtained}</strong>
                                <span style={{ color: '#94a3b8', fontSize: 12 }}> / {data.summary?.total_marks}</span>
                              </td>
                              <td style={{ padding: '10px 14px', color: gradeColor, fontWeight: 700 }}>{overallPct}%</td>
                              <td style={{ padding: '10px 14px', color: gradeColor, fontWeight: 800, fontSize: 15 }}>{overallGrade}</td>
                              <td colSpan={2} style={{ padding: '10px 14px', color: '#94a3b8', fontSize: 12 }}>{getGradeLabel(overallGrade)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Screen styles
───────────────────────────────────────────────────────────────────────────── */
const S = {
  header: {
    background: '#1e293b', borderBottom: '1px solid #334155',
    padding: '12px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    position: 'sticky', top: 0, zIndex: 50,
  },
  headerLeft:  { display: 'flex', alignItems: 'center', gap: 10 },
  logoBox: {
    width: 38, height: 38, flexShrink: 0,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  brandTitle:  { fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2 },
  brandSub:    { fontSize: 10, color: '#94a3b8' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  userChip: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#334155', borderRadius: 40, padding: '5px 12px 5px 5px',
  },
  userAvatar: {
    width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  content: { padding: '16px', maxWidth: 1200, margin: '0 auto' },
  profileCard: {
    background: 'linear-gradient(135deg, #1e293b 0%, #1e1b4b 100%)',
    border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16,
    padding: '16px', marginBottom: 16,
  },
  profileTop:   { display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' },
  profileAvatar: {
    width: 56, height: 56, flexShrink: 0,
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)', borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 800, color: '#fff',
  },
  chipRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: {
    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 8, padding: '5px 10px',
    display: 'flex', flexDirection: 'column', gap: 1,
  },
  gradeBig:    { marginLeft: 'auto', flexShrink: 0 },
  gradeBadge: {
    width: 52, height: 52, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, fontWeight: 900, margin: '0 auto',
  },
  gradeCircle: {
    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 900,
  },
};
