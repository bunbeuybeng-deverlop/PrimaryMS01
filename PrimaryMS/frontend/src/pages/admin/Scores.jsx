import { useState, useEffect } from 'react'
import { FiPlus, FiBarChart2, FiFilter, FiTrash2, FiAward, FiBook, FiEdit } from 'react-icons/fi'
import { scoreService } from '../../services/scoreService.js'
import { studentService } from '../../services/studentService.js'
import { subjectService } from '../../services/subjectService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'

export default function AdminScores() {
  const [scores, setScores] = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [studentFilter, setStudentFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [examTypeFilter, setExamTypeFilter] = useState('')

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    student_id: '',
    subject_id: '',
    exam_type: 'quiz',
    score: 85,
    max_score: 100,
    date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    loadDependencies()
    loadScores()
  }, [])

  const loadDependencies = async () => {
    try {
      const [stu, sub] = await Promise.all([
        studentService.getAll(),
        subjectService.getAll(),
      ])
      setStudents(stu)
      setSubjects(sub)
    } catch (err) {
      console.error('Failed to load dependencies:', err)
    }
  }

  const loadScores = async () => {
    try {
      setLoading(true)
      const params = {}
      if (studentFilter) params.student_id = studentFilter
      if (subjectFilter) params.subject_id = subjectFilter
      if (examTypeFilter) params.exam_type = examTypeFilter

      const data = await scoreService.getAll(params)
      setScores(data)
      setError('')
    } catch (err) {
      console.error('Failed to load scores:', err)
      setError('Failed to fetch score records.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const payload = {
        student_id: parseInt(form.student_id),
        subject_id: parseInt(form.subject_id),
        exam_type: form.exam_type,
        score: parseFloat(form.score),
        max_score: parseFloat(form.max_score || 100),
        date: form.date,
      }
      if (editId) {
        await scoreService.update(editId, payload)
      } else {
        await scoreService.create(payload)
      }
      setIsFormOpen(false)
      loadScores()
    } catch (err) {
      console.error('Score save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save score.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setActionLoading(true)
      await scoreService.remove(deleteId)
      setDeleteId(null)
      loadScores()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete score record.')
    } finally {
      setActionLoading(false)
    }
  }

  const getScoreColor = (pct) => {
    if (pct >= 85) return 'var(--color-success)'
    if (pct >= 70) return '#38bdf8'
    if (pct >= 50) return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  return (
    <div className="page-container">
      <style>{`
        .page-container { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
        .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .page-sub { color: var(--text-muted); font-size: 0.85rem; margin-top: 2px; }
        .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); align-items: center; }
        .filter-select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); font-size: 0.88rem; outline: none; }
        .score-table-wrapper { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
        .score-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .score-table th { background: var(--bg-elevated); color: var(--text-secondary); text-align: left; padding: 12px 16px; font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .score-table td { padding: 14px 16px; border-top: 1px solid var(--border-color); color: var(--text-primary); }
        .score-table tr:hover { background: rgba(255, 255, 255, 0.02); }
        .score-pill { font-weight: 700; font-size: 0.95rem; }
        .exam-badge { text-transform: capitalize; background: rgba(139, 92, 246, 0.15); color: #c4b5fd; padding: 2px 8px; border-radius: 999px; font-size: 0.78rem; }
        .score-form { display: flex; flex-direction: column; gap: 14px; }
        .score-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .score-form input, .score-form select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Exam & Academic Scores</h1>
          <p className="page-sub">Manage student test scores, quizzes, midterms, and finals across all subjects</p>
        </div>
        <Button onClick={() => {
          setEditId(null)
          setForm({
            student_id: '',
            subject_id: '',
            exam_type: 'quiz',
            score: 85,
            max_score: 100,
            date: new Date().toISOString().split('T')[0],
          })
          setIsFormOpen(true)
        }}>
          <FiPlus /> Record Score
        </Button>
      </div>

      <div className="filter-bar">
        <select 
          className="filter-select" 
          value={studentFilter} 
          onChange={(e) => setStudentFilter(e.target.value)}
        >
          <option value="">All Students</option>
          {students.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={subjectFilter} 
          onChange={(e) => setSubjectFilter(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={examTypeFilter} 
          onChange={(e) => setExamTypeFilter(e.target.value)}
        >
          <option value="">All Assessment Types</option>
          <option value="quiz">Quiz</option>
          <option value="midterm">Midterm</option>
          <option value="final">Final Exam</option>
          <option value="assignment">Assignment</option>
        </select>

        <Button size="sm" variant="secondary" onClick={loadScores}>
          <FiFilter /> Filter
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setStudentFilter(''); setSubjectFilter(''); setExamTypeFilter(''); loadScores(); }}>
          Reset
        </Button>
      </div>

      {loading ? (
        <Loading text="Loading academic score records from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <div className="score-table-wrapper">
          <table className="score-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Assessment Type</th>
                <th>Date</th>
                <th>Score</th>
                <th>Percentage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No score records found matching current criteria.
                  </td>
                </tr>
              ) : (
                scores.map((sc, i) => {
                  const pct = Math.round((sc.score / (sc.max_score || 100)) * 100)
                  return (
                    <tr key={sc.id}>
                      <td>{i + 1}</td>
                      <td><strong>{sc.student?.name || `Student #${sc.student_id}`}</strong></td>
                      <td>{sc.subject?.name || `Subject #${sc.subject_id}`}</td>
                      <td><span className="exam-badge">{sc.exam_type}</span></td>
                      <td>{sc.date}</td>
                      <td>
                        <span className="score-pill" style={{ color: getScoreColor(pct) }}>
                          {sc.score} / {sc.max_score}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: getScoreColor(pct) }}></div>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <Button variant="secondary" size="sm" onClick={() => {
                            setEditId(sc.id)
                            setForm({
                              student_id: sc.student_id,
                              subject_id: sc.subject_id,
                              exam_type: sc.exam_type,
                              score: sc.score,
                              max_score: sc.max_score,
                              date: sc.date,
                            })
                            setIsFormOpen(true)
                          }} title="Edit"><FiEdit /></Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(sc.id)} title="Delete"><FiTrash2 /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Record / Edit Score Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editId ? "Edit Student Score" : "Record Student Score"}
      >
        <form className="score-form" onSubmit={handleSave}>
          <label>
            Student *
            <select 
              value={form.student_id} 
              onChange={(e) => setForm({ ...form, student_id: e.target.value })} 
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.homeroom_class?.name || 'Class'})</option>
              ))}
            </select>
          </label>

          <label>
            Subject *
            <select 
              value={form.subject_id} 
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })} 
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code || 'Curriculum'})</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Assessment Type *
              <select 
                value={form.exam_type} 
                onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
              >
                <option value="quiz">Quiz</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final Exam</option>
                <option value="assignment">Assignment</option>
              </select>
            </label>
            <label>
              Assessment Date *
              <input 
                type="date" 
                value={form.date} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
                required 
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Score Obtained *
              <input 
                type="number" 
                step="0.5" 
                min="0" 
                value={form.score} 
                onChange={(e) => setForm({ ...form, score: e.target.value })} 
                required 
              />
            </label>
            <label>
              Maximum Score *
              <input 
                type="number" 
                step="1" 
                min="1" 
                value={form.max_score} 
                onChange={(e) => setForm({ ...form, max_score: e.target.value })} 
                required 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>Save Score</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        title="Delete Score Record"
      >
        <div>
          <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete this score record?
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
