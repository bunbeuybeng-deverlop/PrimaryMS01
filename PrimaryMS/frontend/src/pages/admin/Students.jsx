import { useState, useEffect } from 'react'
import { FiPlus, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { studentService } from '../../services/studentService.js'
import { classService } from '../../services/classService.js'
import { parentService } from '../../services/parentService.js'
import StudentTable from '../../components/students/StudentTable.jsx'
import StudentForm from '../../components/students/StudentForm.jsx'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'
import Pagination from '../../components/common/Pagination.jsx'

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filters
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewStudent, setViewStudent] = useState(null)
  const [deleteStudent, setDeleteStudent] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadDependencies()
    loadStudents()
  }, [])

  const loadDependencies = async () => {
    try {
      const [classList, parentList] = await Promise.all([
        classService.getAll(),
        parentService.getAll(),
      ])
      setClasses(classList)
      setParents(parentList)
    } catch (err) {
      console.error('Failed to load dependency data:', err)
    }
  }

  const loadStudents = async () => {
    try {
      setLoading(true)
      const params = {}
      if (search) params.q = search
      if (classFilter) params.class_id = classFilter
      if (statusFilter !== '') params.is_active = statusFilter === 'true'

      const data = await studentService.getAll(params)
      setStudents(data)
      setCurrentPage(1)
      setError('')
    } catch (err) {
      console.error('Failed to load students:', err)
      setError('Failed to fetch students from server.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadStudents()
  }

  const handleSave = async (formData) => {
    try {
      setActionLoading(true)
      if (selectedStudent?.id) {
        await studentService.update(selectedStudent.id, formData)
      } else {
        await studentService.create(formData)
      }
      setIsFormOpen(false)
      setSelectedStudent(null)
      loadStudents()
    } catch (err) {
      console.error('Save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save student record.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteStudent) return
    try {
      setActionLoading(true)
      await studentService.remove(deleteStudent.id)
      setDeleteStudent(null)
      loadStudents()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err.response?.data?.detail || 'Failed to delete student.')
    } finally {
      setActionLoading(false)
    }
  }

  // Pagination calculation
  const paginatedStudents = students.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 0.9rem; }
        .detail-item strong { display: block; font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Students Directory</h1>
          <p className="page-sub">Manage enrolled students, personal details, and class assignments</p>
        </div>
        <Button onClick={() => { setSelectedStudent(null); setIsFormOpen(true) }}>
          <FiPlus /> Enroll Student
        </Button>
      </div>

      {/* Filter Bar */}
      <form className="filter-bar" onSubmit={handleSearchSubmit}>
        <div className="search-box">
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search students by name..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <select 
          className="filter-select" 
          value={classFilter} 
          onChange={(e) => { setClassFilter(e.target.value); }}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); }}
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <Button type="submit" variant="secondary" size="sm">
          <FiFilter /> Filter
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setSearch(''); setClassFilter(''); setStatusFilter(''); loadStudents(); }}>
          <FiRefreshCw /> Reset
        </Button>
      </form>

      {/* Table Content */}
      {loading ? (
        <Loading text="Loading student records from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <>
          <StudentTable 
            students={paginatedStudents} 
            offset={(currentPage - 1) * pageSize}
            onView={(student) => setViewStudent(student)}
            onEdit={(student) => { setSelectedStudent(student); setIsFormOpen(true) }}
            onDelete={(student) => setDeleteStudent(student)}
          />
          <Pagination
            totalItems={students.length}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          />
        </>
      )}

      {/* Enroll / Edit Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setSelectedStudent(null) }} 
        title={selectedStudent ? 'Edit Student' : 'Enroll New Student'}
      >
        <StudentForm 
          initial={selectedStudent} 
          classes={classes} 
          parents={parents} 
          onSubmit={handleSave} 
          onCancel={() => { setIsFormOpen(false); setSelectedStudent(null) }} 
          loading={actionLoading} 
        />
      </Modal>

      {/* View Detail Modal */}
      <Modal 
        isOpen={Boolean(viewStudent)} 
        onClose={() => setViewStudent(null)} 
        title="Student Details"
      >
        {viewStudent && (
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Full Name</strong>
              <span>{viewStudent.name}</span>
            </div>
            <div className="detail-item">
              <strong>Homeroom Class</strong>
              <span>{viewStudent.homeroom_class?.name || 'None'}</span>
            </div>
            <div className="detail-item">
              <strong>Gender</strong>
              <span style={{ textTransform: 'capitalize' }}>{viewStudent.gender || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Date of Birth</strong>
              <span>{viewStudent.date_of_birth || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Parent / Guardian</strong>
              <span>{viewStudent.parent?.name || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Contact Phone</strong>
              <span>{viewStudent.phone || viewStudent.parent?.phone || '—'}</span>
            </div>
            <div className="detail-item" style={{ gridColumn: 'span 2' }}>
              <strong>Home Address</strong>
              <span>{viewStudent.address || '—'}</span>
            </div>
            <div className="detail-item">
              <strong>Status</strong>
              <span className={`badge badge--${viewStudent.is_active ? 'success' : 'danger'}`}>
                {viewStudent.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={Boolean(deleteStudent)} 
        onClose={() => setDeleteStudent(null)} 
        title="Confirm Delete"
      >
        {deleteStudent && (
          <div>
            <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
              Are you sure you want to remove <strong>{deleteStudent.name}</strong> from the database? This action will cascade delete related attendance and score entries.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setDeleteStudent(null)}>Cancel</Button>
              <Button variant="danger" loading={actionLoading} onClick={handleDelete}>Delete Student</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
