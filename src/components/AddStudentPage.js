import React from 'react';

const CLASSES = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7',
  'Class 8','Class 9','Class 10','Class 11','Class 12'];
const SECTIONS = ['A','B','C','D','E'];

export default function AddStudentPage({ form, setField, isEdit, submitting, onSubmit, onCancel }) {
  const f = (k) => (e) => setField(k, e.target.value);

  return (
    <div>
      {/* ── Page header ── */}
      <div style={S.pageHeader}>
        <button style={S.backBtn} onClick={onCancel}>
          ← Back to Students
        </button>
        <div style={S.headerRight}>
          <div>
            <div className="page-title">
              {isEdit ? '✏️ Edit Student' : '➕ Add New Student'}
            </div>
            <div className="page-subtitle">
              {isEdit ? 'Update student information' : 'Fill in the details to enroll a new student'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="add-student-grid">

          {/* ── LEFT COLUMN ── */}
          <div style={S.col}>

            {/* Personal Info */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={S.sectionHead}>
                <div style={S.sectionIcon}>👤</div>
                <div style={S.sectionTitle}>Personal Information</div>
              </div>

              <div className="form-group">
                <label>Full Name <span style={S.req}>*</span></label>
                <input
                  value={form.name}
                  onChange={f('name')}
                  placeholder="e.g. Rahul Kumar"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Father's / Guardian's Name</label>
                <input
                  value={form.father_name}
                  onChange={f('father_name')}
                  placeholder="e.g. Suresh Kumar"
                />
              </div>

              <div style={S.row2}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={f('phone')}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={f('email')}
                    placeholder="student@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={f('address')}
                  placeholder="Village / City, District, State"
                />
              </div>
            </div>

            {/* Account */}
            <div className="card">
              <div style={S.sectionHead}>
                <div style={S.sectionIcon}>🔐</div>
                <div style={S.sectionTitle}>Login Credentials</div>
              </div>

              <div style={S.row2}>
                <div className="form-group">
                  <label>User ID <span style={S.req}>*</span></label>
                  <input
                    value={form.user_id}
                    onChange={f('user_id')}
                    placeholder="e.g. STU005"
                    required
                    disabled={isEdit}
                    style={isEdit ? S.disabledInput : {}}
                  />
                  {isEdit && <span style={S.hint}>Cannot change User ID</span>}
                </div>
                <div className="form-group">
                  <label>Roll Number <span style={S.req}>*</span></label>
                  <input
                    value={form.roll_number}
                    onChange={f('roll_number')}
                    placeholder="e.g. RK2024005"
                    required
                    disabled={isEdit}
                    style={isEdit ? S.disabledInput : {}}
                  />
                  {isEdit && <span style={S.hint}>Cannot change Roll Number</span>}
                </div>
              </div>

              <div className="form-group">
                <label>
                  Password {isEdit ? <span style={S.hint2}>(leave blank to keep existing)</span> : <span style={S.req}>*</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={f('password')}
                  placeholder={isEdit ? 'Leave blank to keep current password' : 'Set login password'}
                  required={!isEdit}
                />
              </div>

              {/* Credential preview */}
              {(form.user_id || form.roll_number) && (
                <div style={S.previewBox}>
                  <div style={S.previewTitle}>🔑 Login Preview</div>
                  <div style={S.previewRow}>
                    <span style={S.previewLabel}>Can login with:</span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {form.roll_number && <span style={S.previewTag}>{form.roll_number}</span>}
                      {form.user_id && <span style={S.previewTag}>{form.user_id}</span>}
                      {form.name && <span style={S.previewTag}>{form.name.split(' ')[0]}</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={S.col}>

            {/* Academic Info */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={S.sectionHead}>
                <div style={S.sectionIcon}>🏫</div>
                <div style={S.sectionTitle}>Academic Information</div>
              </div>

              <div className="form-group">
                <label>Class <span style={S.req}>*</span></label>
                <select value={form.class_name} onChange={f('class_name')} required>
                  <option value="">— Select Class —</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>

              {form.class_name === 'Other' && (
                <div className="form-group">
                  <label>Specify Class <span style={S.req}>*</span></label>
                  <input
                    value={form.class_name === 'Other' ? '' : form.class_name}
                    onChange={f('class_name')}
                    placeholder="Enter class name"
                    required
                  />
                </div>
              )}

              <div style={S.row2}>
                <div className="form-group">
                  <label>Section</label>
                  <select value={form.section} onChange={f('section')}>
                    <option value="">— None —</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Batch <span style={S.req}>*</span></label>
                  <input
                    value={form.batch}
                    onChange={f('batch')}
                    placeholder="e.g. Batch 2024"
                    required
                    list="batch-list"
                  />
                  <datalist id="batch-list">
                    {['Batch 2023','Batch 2024','Batch 2025','Batch 2026'].map(b =>
                      <option key={b} value={b} />
                    )}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Summary preview */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={S.sectionHead}>
                <div style={S.sectionIcon}>📋</div>
                <div style={S.sectionTitle}>Student Preview</div>
              </div>
              <div style={S.summaryGrid}>
                {[
                  ['Name',       form.name       || '—'],
                  ['Roll No.',   form.roll_number || '—'],
                  ['User ID',    form.user_id     || '—'],
                  ['Class',      form.class_name  || '—'],
                  ['Section',    form.section     || '—'],
                  ['Batch',      form.batch       || '—'],
                  ['Phone',      form.phone       || '—'],
                  ['Father',     form.father_name || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={S.summaryItem}>
                    <span style={S.summaryLabel}>{label}</span>
                    <span style={S.summaryVal}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={S.actions}>
              <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
                ✕ Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ flex: 2 }}
              >
                {submitting
                  ? '⏳ Saving...'
                  : isEdit ? '💾 Update Student' : '✅ Add Student'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

const S = {
  pageHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    background: 'transparent',
    border: '1px solid #334155',
    color: '#94a3b8',
    borderRadius: 8,
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'Poppins, sans-serif',
    width: 'fit-content',
    marginBottom: 4,
    transition: 'all 0.15s',
  },
  headerRight: { display: 'flex', alignItems: 'flex-start', gap: 12 },
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: '1px solid #334155',
  },
  sectionIcon: {
    width: 34, height: 34,
    background: 'rgba(99,102,241,0.15)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: 700 },
  req: { color: '#ef4444', marginLeft: 2 },
  hint: { fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' },
  hint2: { fontSize: 11, color: '#94a3b8', fontWeight: 400, marginLeft: 4 },
  disabledInput: { opacity: 0.5, cursor: 'not-allowed' },
  previewBox: {
    background: 'rgba(99,102,241,0.08)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 10,
    padding: '12px 14px',
    marginTop: 4,
  },
  previewTitle: { fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  previewRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  previewLabel: { fontSize: 12, color: '#94a3b8' },
  previewTag: {
    background: 'rgba(99,102,241,0.2)',
    color: '#818cf8',
    borderRadius: 6,
    padding: '3px 10px',
    fontSize: 12,
    fontWeight: 600,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 16px',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  summaryLabel: { fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' },
  summaryVal: { fontSize: 13, fontWeight: 600 },
  actions: {
    display: 'flex',
    gap: 10,
  },
};

