import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { teacherService } from '../../services/teacherService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import Pagination from '../../components/common/Pagination.jsx'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [viewTeacher, setViewTeacher] = useState(null)
  const [deleteTeacher, setDeleteTeacher] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'General',
    is_active: true,
  })

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.q = search
      if (statusFilter !== '') params.is_active = statusFilter === 'true'
      const data = await teacherService.getAll(params)
      setTeachers(data)
      setCurrentPage(1)
      setError('')
    } catch (err) {
      console.error('Failed to load teachers:', err)
      setError('Failed to fetch teachers from server.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadTeachers()
  }

  const openAddModal = () => {
    setSelectedTeacher(null)
    setForm({ name: '', email: '', phone: '', specialization: 'General', is_active: true })
    setIsFormOpen(true)
  }

  const openEditModal = (t) => {
    setSelectedTeacher(t)
    setForm({
      name: t.name || '',
      email: t.email || '',
      phone: t.phone || '',
      specialization: t.specialization || 'General',
      is_active: t.is_active ?? true,
    })
    setIsFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      if (selectedTeacher?.id) {
        await teacherService.update(selectedTeacher.id, form)
      } else {
        await teacherService.create(form)
      }
      setIsFormOpen(false)
      setSelectedTeacher(null)
      loadTeachers()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save teacher.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTeacher) return
    try {
      setActionLoading(true)
      await teacherService.remove(deleteTeacher.id)
      setDeleteTeacher(null)
      loadTeachers()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.response?.data?.detail || 'Failed to delete teacher.')
    } finally {
      setActionLoading(false)
    }
  }

  // Pagination calculation
  const offset = (currentPage - 1) * pageSize
  const paginatedTeachers = teachers.slice(offset, offset + pageSize)

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
        .item-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
        .table-actions { display: flex; gap: 6px; }
        .table-empty { text-align: center; color: var(--text-muted); padding: 40px !important; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.9rem; }
        .detail-item strong { display: block; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .teacher-form { display: flex; flex-direction: column; gap: 14px; }
        .teacher-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .teacher-form input, .teacher-form select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty & Teachers</h1>
          <p className="page-sub">Manage school teaching staff, subject assignments, and contact details</p>
        </div>
        <Button onClick={openAddModal}>
          <FiPlus /> Add Teacher
        </Button>
      </div>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <div className="search-box">
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search teachers by name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <select 
          className="filter-select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <Button type="submit" variant="secondary" size="sm">
          <FiFilter /> Filter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); loadTeachers(); }}>
          <FiRefreshCw /> Reset
        </Button>
      </form>

      {/* Table Content */}
      {loading ? (
        <Loading text="Loading teacher faculty from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">No teachers found.</td>
                  </tr>
                ) : (
                  paginatedTeachers.map((t, i) => (
                    <tr key={t.id}>
                      <td>{offset + i + 1}</td>
                      <td>
                        <div className="item-name-cell">
                          <div className="item-avatar">{t.name?.[0] || 'T'}</div>
                          <div>
                            <strong>{t.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Faculty ID #{t.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8' }}>
                          {t.specialization || 'General'}
                        </span>
                      </td>
                      <td>{t.email || '—'}</td>
                      <td>{t.phone || '—'}</td>
                      <td>
                        <span className={`badge badge--${t.is_active ? 'success' : 'danger'}`}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Button variant="ghost" size="sm" onClick={() => setViewTeacher(t)} title="View"><FiEye /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(t)} title="Edit"><FiEdit2 /></Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteTeacher(t)} title="Delete"><FiTrash2 /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={teachers.length}
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
        onClose={() => { setIsFormOpen(false); setSelectedTeacher(null) }} 
        title={selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
      >
        <form className="teacher-form" onSubmit={handleSave}>
          <label>
            Full Name *
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Sarah Jenkins" 
              required 
            />
          </label>
          <label>
            Email Address
            <input 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="e.g. sjenkins@primaryms.dev" 
            />
          </label>
          <label>
            Phone Number
            <input 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              placeholder="e.g. 555-0105" 
            />
          </label>
          <label>
            Subject Specialization
            <input 
              value={form.specialization} 
              onChange={(e) => setForm({ ...form, specialization: e.target.value })} 
              placeholder="e.g. Mathematics, Science, Literacy" 
            />
          </label>
          <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '4px' }}>
            <input 
              type="checkbox" 
              checked={form.is_active} 
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })} 
            />
            <span>Active Faculty Member</span>
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => { setIsFormOpen(false); setSelectedTeacher(null) }}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>{selectedTeacher ? 'Update Teacher' : 'Save Teacher'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal 
        isOpen={Boolean(viewTeacher)} 
        onClose={() => setViewTeacher(null)} 
        title="Teacher Faculty Details"
      >
        {viewTeacher && (
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Full Name</strong>
              <span>{viewTeacher.name}</span>
            </div>
            <div className="detail-item">
              <strong>Specialization</strong>
              <span>{viewTeacher.specialization || 'General Education'}</span>
            </div>
            <div className="detail-item">
              <strong>Email Address</strong>
              <span>{viewTeacher.email || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Phone Number</strong>
              <span>{viewTeacher.phone || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Status</strong>
              <span className={`badge badge--${viewTeacher.is_active ? 'success' : 'danger'}`}>
                {viewTeacher.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteTeacher)} 
        onClose={() => setDeleteTeacher(null)} 
        title="Confirm Delete"
      >
        {deleteTeacher && (
          <div>
            <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
              Are you sure you want to remove <strong>{deleteTeacher.name}</strong> from faculty records?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteTeacher(null)}>Cancel</Button>
              <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Delete Teacher</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
