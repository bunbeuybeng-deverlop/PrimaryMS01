import { useState, useEffect } from 'react'
import { FiPlus, FiBook, FiUser, FiCode, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { subjectService } from '../../services/subjectService.js'
import { teacherService } from '../../services/teacherService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [deleteSubject, setDeleteSubject] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    teacher_id: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [subjectList, teacherList] = await Promise.all([
        subjectService.getAll(),
        teacherService.getAll(),
      ])
      setSubjects(subjectList)
      setTeachers(teacherList)
      setError('')
    } catch (err) {
      console.error('Failed to load subjects:', err)
      setError('Failed to fetch subjects from server.')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setSelectedSubject(null)
    setForm({ name: '', code: '', description: '', teacher_id: '' })
    setIsFormOpen(true)
  }

  const openEditModal = (s) => {
    setSelectedSubject(s)
    setForm({
      name: s.name || '',
      code: s.code || '',
      description: s.description || '',
      teacher_id: s.teacher_id || '',
    })
    setIsFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const payload = {
        ...form,
        code: form.code || null,
        description: form.description || null,
        teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null,
      }
      if (selectedSubject?.id) {
        await subjectService.update(selectedSubject.id, payload)
      } else {
        await subjectService.create(payload)
      }
      setIsFormOpen(false)
      setSelectedSubject(null)
      loadData()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save subject.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteSubject) return
    try {
      setActionLoading(true)
      await subjectService.remove(deleteSubject.id)
      setDeleteSubject(null)
      loadData()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.response?.data?.detail || 'Failed to delete subject.')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="page-container">
      <style>{`
        .page-container { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
        .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .page-sub { color: var(--text-muted); font-size: 0.85rem; margin-top: 2px; }
        .subject-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .subject-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 22px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; transition: transform var(--transition), box-shadow var(--transition); }
        .subject-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: rgba(139, 92, 246, 0.4); }
        .subject-card__header { display: flex; justify-content: space-between; align-items: flex-start; }
        .subject-card__name { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
        .subject-code { font-size: 0.78rem; font-family: monospace; color: #c4b5fd; background: rgba(139, 92, 246, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 600; }
        .subject-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; }
        .subject-teacher { display: flex; align-items: center; gap: 8px; font-size: 0.88rem; color: var(--text-secondary); margin-top: 8px; }
        .subject-card__footer { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border-color); padding-top: 12px; }
        .subject-form { display: flex; flex-direction: column; gap: 14px; }
        .subject-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .subject-form input, .subject-form select, .subject-form textarea { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum Subjects</h1>
          <p className="page-sub">Manage academic courses, curriculum codes, and instructor allocations</p>
        </div>
        <Button onClick={openAddModal}>
          <FiPlus /> Add Subject
        </Button>
      </div>

      {loading ? (
        <Loading text="Loading subjects from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <div className="subject-grid">
          {subjects.map(s => (
            <div key={s.id} className="subject-card">
              <div>
                <div className="subject-card__header">
                  <div>
                    <h3 className="subject-card__name">{s.name}</h3>
                    {s.code && <span className="subject-code">{s.code}</span>}
                  </div>
                  <div style={{ background: 'rgba(139, 92, 246, 0.12)', padding: '10px', borderRadius: '10px', color: '#8b5cf6' }}>
                    <FiBook size={20} />
                  </div>
                </div>

                <p className="subject-desc" style={{ marginTop: '12px' }}>
                  {s.description || 'Primary school academic subject module.'}
                </p>

                <div className="subject-teacher">
                  <FiUser style={{ color: 'var(--text-muted)' }} />
                  <span>Lead Instructor: <strong>{s.teacher?.name || 'Unassigned'}</strong></span>
                </div>
              </div>

              <div className="subject-card__footer">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(s)} title="Edit"><FiEdit2 /></Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteSubject(s)} title="Delete"><FiTrash2 /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={selectedSubject ? 'Edit Subject' : 'Add New Subject'}
      >
        <form className="subject-form" onSubmit={handleSave}>
          <label>
            Subject Name *
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Mathematics" 
              required 
            />
          </label>
          <label>
            Subject Code
            <input 
              value={form.code} 
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} 
              placeholder="e.g. MATH" 
            />
          </label>
          <label>
            Assigned Teacher
            <select 
              value={form.teacher_id} 
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea 
              rows={3} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="Subject curriculum and grade level details..." 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>{selectedSubject ? 'Update Subject' : 'Save Subject'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteSubject)} 
        onClose={() => setDeleteSubject(null)} 
        title="Delete Subject"
      >
        {deleteSubject && (
          <div>
            <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
              Are you sure you want to remove <strong>{deleteSubject.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteSubject(null)}>Cancel</Button>
              <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
