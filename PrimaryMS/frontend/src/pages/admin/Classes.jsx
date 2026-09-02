import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { classService } from '../../services/classService.js'
import { teacherService } from '../../services/teacherService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import Pagination from '../../components/common/Pagination.jsx'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filters
  const [search, setSearch] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)
  const [viewClass, setViewClass] = useState(null)
  const [deleteClass, setDeleteClass] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    grade_level: 'Grade 1',
    teacher_id: '',
    academic_year: '2026-2027',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [classList, teacherList] = await Promise.all([
        classService.getAll(),
        teacherService.getAll(),
      ])
      setClasses(classList)
      setTeachers(teacherList)
      setCurrentPage(1)
      setError('')
    } catch (err) {
      console.error('Failed to load classes:', err)
      setError('Failed to fetch classes from server.')
    } finally {
      setLoading(false)
    }
  }

  const loadClassesWithFilter = async () => {
    try {
      setLoading(true)
      const params = {}
      if (teacherFilter) params.teacher_id = teacherFilter
      const data = await classService.getAll(params)
      
      let filtered = data
      if (search) {
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.grade_level?.toLowerCase().includes(search.toLowerCase())
        )
      }
      setClasses(filtered)
      setCurrentPage(1)
      setError('')
    } catch (err) {
      console.error('Failed to filter classes:', err)
      setError('Failed to fetch classes.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadClassesWithFilter()
  }

  const openAddModal = () => {
    setSelectedClass(null)
    setForm({ name: '', grade_level: 'Grade 1', teacher_id: '', academic_year: '2026-2027' })
    setIsFormOpen(true)
  }

  const openEditModal = (c) => {
    setSelectedClass(c)
    setForm({
      name: c.name || '',
      grade_level: c.grade_level || 'Grade 1',
      teacher_id: c.teacher_id || '',
      academic_year: c.academic_year || '2026-2027',
    })
    setIsFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const payload = {
        ...form,
        teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null,
      }
      if (selectedClass?.id) {
        await classService.update(selectedClass.id, payload)
      } else {
        await classService.create(payload)
      }
      setIsFormOpen(false)
      setSelectedClass(null)
      loadData()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save class.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteClass) return
    try {
      setActionLoading(true)
      await classService.remove(deleteClass.id)
      setDeleteClass(null)
      loadData()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.response?.data?.detail || 'Failed to delete class.')
    } finally {
      setActionLoading(false)
    }
  }

  // Pagination calculation
  const offset = (currentPage - 1) * pageSize
  const paginatedClasses = classes.slice(offset, offset + pageSize)

  return (
    <div className="page-container">
      <style>{`
        .page-container { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
        .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .page-sub { color: var(--text-muted); font-size: 0.85rem; margin-top: 2px; }
        .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); align-items: center; }
        .search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 6px 12px; flex: 1; min-width: 200px; }
        .search-box input { background: none; border: none; color: var(--text-primary); outline: none; font-size: 0.88rem; width: 100%; }
        .filter-select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); font-size: 0.88rem; outline: none; }
        
        .table-wrapper { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-color); background: var(--bg-surface); }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .data-table thead { background: var(--bg-elevated); }
        .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
        .data-table th { font-weight: 600; color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-table tbody tr:hover { background: var(--bg-elevated); }
        .data-table tbody tr:last-child td { border-bottom: none; }
        
        .item-name-cell { display: flex; align-items: center; gap: 10px; }
        .item-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #06b6d4); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
        .table-actions { display: flex; gap: 6px; }
        .table-empty { text-align: center; color: var(--text-muted); padding: 40px !important; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.9rem; }
        .detail-item strong { display: block; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .class-form { display: flex; flex-direction: column; gap: 14px; }
        .class-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .class-form input, .class-form select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Classrooms & Homerooms</h1>
          <p className="page-sub">Manage academic classes, grade levels, and assigned homeroom teachers</p>
        </div>
        <Button onClick={openAddModal}>
          <FiPlus /> Add Class
        </Button>
      </div>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <div className="search-box">
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search classes by name or grade..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <select 
          className="filter-select" 
          value={teacherFilter} 
          onChange={(e) => setTeacherFilter(e.target.value)}
        >
          <option value="">All Teachers</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <Button type="submit" variant="secondary" size="sm">
          <FiFilter /> Filter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); setTeacherFilter(''); loadData(); }}>
          <FiRefreshCw /> Reset
        </Button>
      </form>

      {/* Table Content */}
      {loading ? (
        <Loading text="Loading classes from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Class Name</th>
                  <th>Grade Level</th>
                  <th>Homeroom Teacher</th>
                  <th>Academic Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">No classes found.</td>
                  </tr>
                ) : (
                  paginatedClasses.map((c, i) => (
                    <tr key={c.id}>
                      <td>{offset + i + 1}</td>
                      <td>
                        <div className="item-name-cell">
                          <div className="item-avatar">{c.name?.[0] || 'C'}</div>
                          <div>
                            <strong>{c.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Class ID #{c.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
                          {c.grade_level || 'Grade Level'}
                        </span>
                      </td>
                      <td>
                        {c.teacher?.name ? (
                          <strong>{c.teacher.name}</strong>
                        ) : (
                          <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{c.academic_year || '2026-2027'}</td>
                      <td>
                        <div className="table-actions">
                          <Button variant="ghost" size="sm" onClick={() => setViewClass(c)} title="View"><FiEye /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(c)} title="Edit"><FiEdit2 /></Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteClass(c)} title="Delete"><FiTrash2 /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={classes.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setSelectedClass(null) }} 
        title={selectedClass ? 'Edit Class' : 'Create New Class'}
      >
        <form className="class-form" onSubmit={handleSave}>
          <label>
            Class Name *
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Grade 1A" 
              required 
            />
          </label>
          <label>
            Grade Level
            <input 
              value={form.grade_level} 
              onChange={(e) => setForm({ ...form, grade_level: e.target.value })} 
              placeholder="e.g. Grade 1, Kindergarten" 
            />
          </label>
          <label>
            Homeroom Teacher
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
            Academic Year
            <input 
              value={form.academic_year} 
              onChange={(e) => setForm({ ...form, academic_year: e.target.value })} 
              placeholder="e.g. 2026-2027" 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => { setIsFormOpen(false); setSelectedClass(null) }}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>{selectedClass ? 'Update Class' : 'Create Class'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal 
        isOpen={Boolean(viewClass)} 
        onClose={() => setViewClass(null)} 
        title="Classroom Details"
      >
        {viewClass && (
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Class Name</strong>
              <span>{viewClass.name}</span>
            </div>
            <div className="detail-item">
              <strong>Grade Level</strong>
              <span>{viewClass.grade_level || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Homeroom Teacher</strong>
              <span>{viewClass.teacher?.name || 'Unassigned'}</span>
            </div>
            <div className="detail-item">
              <strong>Academic Year</strong>
              <span>{viewClass.academic_year || '2026-2027'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteClass)} 
        onClose={() => setDeleteClass(null)} 
        title="Confirm Delete"
      >
        {deleteClass && (
          <div>
            <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete class <strong>{deleteClass.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteClass(null)}>Cancel</Button>
              <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Delete Class</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
