import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { parentService } from '../../services/parentService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import Pagination from '../../components/common/Pagination.jsx'

export default function AdminParents() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filters
  const [search, setSearch] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)
  const [viewParent, setViewParent] = useState(null)
  const [deleteParent, setDeleteParent] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    loadParents()
  }, [])

  const loadParents = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.q = search
      const data = await parentService.getAll(params)
      setParents(data)
      setCurrentPage(1)
      setError('')
    } catch (err) {
      console.error('Failed to load parents:', err)
      setError('Failed to fetch parents from server.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadParents()
  }

  const openAddModal = () => {
    setSelectedParent(null)
    setForm({ name: '', email: '', phone: '', address: '' })
    setIsFormOpen(true)
  }

  const openEditModal = (p) => {
    setSelectedParent(p)
    setForm({
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      address: p.address || '',
    })
    setIsFormOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      if (selectedParent?.id) {
        await parentService.update(selectedParent.id, form)
      } else {
        await parentService.create(form)
      }
      setIsFormOpen(false)
      setSelectedParent(null)
      loadParents()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save parent.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteParent) return
    try {
      setActionLoading(true)
      await parentService.remove(deleteParent.id)
      setDeleteParent(null)
      loadParents()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.response?.data?.detail || 'Failed to delete parent.')
    } finally {
      setActionLoading(false)
    }
  }

  // Pagination calculation
  const offset = (currentPage - 1) * pageSize
  const paginatedParents = parents.slice(offset, offset + pageSize)

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
        
        .table-wrapper { overflow-x: auto; border-radius: var(--radius-lg); border: 1px solid var(--border-color); background: var(--bg-surface); }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .data-table thead { background: var(--bg-elevated); }
        .data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-color); }
        .data-table th { font-weight: 600; color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-table tbody tr:hover { background: var(--bg-elevated); }
        .data-table tbody tr:last-child td { border-bottom: none; }
        
        .item-name-cell { display: flex; align-items: center; gap: 10px; }
        .item-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4, #3b82f6); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
        .table-actions { display: flex; gap: 6px; }
        .table-empty { text-align: center; color: var(--text-muted); padding: 40px !important; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.9rem; }
        .detail-item strong { display: block; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
        .parent-form { display: flex; flex-direction: column; gap: 14px; }
        .parent-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .parent-form input { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Parents & Guardians</h1>
          <p className="page-sub">Manage guardian contacts, communications, and linked students</p>
        </div>
        <Button onClick={openAddModal}>
          <FiPlus /> Add Parent
        </Button>
      </div>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <div className="search-box">
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search parents by name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <Button type="submit" variant="secondary" size="sm">
          <FiFilter /> Filter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); loadParents(); }}>
          <FiRefreshCw /> Reset
        </Button>
      </form>

      {/* Table Content */}
      {loading ? (
        <Loading text="Loading parents from PostgreSQL..." />
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
                  <th>Children Enrolled</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-empty">No parents found.</td>
                  </tr>
                ) : (
                  paginatedParents.map((p, i) => (
                    <tr key={p.id}>
                      <td>{offset + i + 1}</td>
                      <td>
                        <div className="item-name-cell">
                          <div className="item-avatar">{p.name?.[0] || 'P'}</div>
                          <div>
                            <strong>{p.name}</strong>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Guardian ID #{p.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {p.students && p.students.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {p.students.map(s => (
                              <span key={s.id} className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                                {s.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No Children Linked</span>
                        )}
                      </td>
                      <td>{p.phone || '—'}</td>
                      <td>{p.email || '—'}</td>
                      <td>{p.address || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <Button variant="ghost" size="sm" onClick={() => setViewParent(p)} title="View"><FiEye /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(p)} title="Edit"><FiEdit2 /></Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteParent(p)} title="Delete"><FiTrash2 /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            totalItems={parents.length}
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
        onClose={() => { setIsFormOpen(false); setSelectedParent(null) }} 
        title={selectedParent ? 'Edit Parent' : 'Add New Parent'}
      >
        <form className="parent-form" onSubmit={handleSave}>
          <label>
            Full Name *
            <input 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="e.g. Robert Smith" 
              required 
            />
          </label>
          <label>
            Email Address
            <input 
              type="email" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              placeholder="e.g. rsmith@primaryms.dev" 
            />
          </label>
          <label>
            Phone Number
            <input 
              value={form.phone} 
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
              placeholder="e.g. 555-0201" 
            />
          </label>
          <label>
            Home Address
            <input 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
              placeholder="e.g. 101 Maple Street" 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => { setIsFormOpen(false); setSelectedParent(null) }}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>{selectedParent ? 'Update Parent' : 'Save Parent'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal 
        isOpen={Boolean(viewParent)} 
        onClose={() => setViewParent(null)} 
        title="Parent / Guardian Details"
      >
        {viewParent && (
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Full Name</strong>
              <span>{viewParent.name}</span>
            </div>
            <div className="detail-item">
              <strong>Guardian ID</strong>
              <span>#{viewParent.id}</span>
            </div>
            <div className="detail-item">
              <strong>Email Address</strong>
              <span>{viewParent.email || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Phone Number</strong>
              <span>{viewParent.phone || '—'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <strong>Home Address</strong>
              <span>{viewParent.address || '—'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <strong>Enrolled Children</strong>
              {viewParent.students && viewParent.students.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {viewParent.students.map(s => (
                    <span key={s.id} className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>No children linked</span>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteParent)} 
        onClose={() => setDeleteParent(null)} 
        title="Confirm Delete"
      >
        {deleteParent && (
          <div>
            <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
              Are you sure you want to remove <strong>{deleteParent.name}</strong> from parent records?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteParent(null)}>Cancel</Button>
              <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Delete Parent</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
