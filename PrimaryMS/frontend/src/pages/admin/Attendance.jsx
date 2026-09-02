import { useState, useEffect } from 'react'
import { FiPlus, FiCalendar, FiFilter, FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, FiTrash2, FiEdit } from 'react-icons/fi'
import { attendanceService } from '../../services/attendanceService.js'
import { studentService } from '../../services/studentService.js'
import { classService } from '../../services/classService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'

export default function AdminAttendance() {
  const [attendanceList, setAttendanceList] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [dateFilter, setDateFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Modal
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    student_id: '',
    class_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    note: '',
  })

  useEffect(() => {
    loadDependencies()
    loadAttendance()
  }, [])

  const loadDependencies = async () => {
    try {
      const [stu, cls] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
      ])
      setStudents(stu)
      setClasses(cls)
    } catch (err) {
      console.error('Failed to load dependencies:', err)
    }
  }

  const loadAttendance = async () => {
    try {
      setLoading(true)
      const params = {}
      if (dateFilter) {
        params.date_from = dateFilter
        params.date_to = dateFilter
      }
      if (classFilter) params.class_id = classFilter
      if (statusFilter) params.status = statusFilter

      const data = await attendanceService.getAll(params)
      setAttendanceList(data)
      setError('')
    } catch (err) {
      console.error('Failed to load attendance:', err)
      setError('Failed to fetch attendance records.')
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
        class_id: form.class_id ? parseInt(form.class_id) : null,
        date: form.date,
        status: form.status,
        note: form.note || null,
      }
      if (editId) {
        await attendanceService.update(editId, payload)
      } else {
        await attendanceService.create(payload)
      }
      setIsFormOpen(false)
      loadAttendance()
    } catch (err) {
      console.error('Attendance save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save attendance.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setActionLoading(true)
      await attendanceService.remove(deleteId)
      setDeleteId(null)
      loadAttendance()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete attendance record.')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="badge badge--success"><FiCheckCircle /> Present</span>
      case 'absent':
        return <span className="badge badge--danger"><FiXCircle /> Absent</span>
      case 'late':
        return <span className="badge badge--warning"><FiClock /> Late</span>
      case 'excused':
        return <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}><FiAlertCircle /> Excused</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="page-container">
      <style>{`
        .page-container { display: flex; flex-direction: column; gap: 20px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; }
        .page-title { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
        .page-sub { color: var(--text-muted); font-size: 0.85rem; margin-top: 2px; }
        .filter-bar { display: flex; gap: 12px; flex-wrap: wrap; background: var(--bg-surface); padding: 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); align-items: center; }
        .filter-input, .filter-select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); font-size: 0.88rem; outline: none; }
        .att-table-wrapper { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
        .att-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .att-table th { background: var(--bg-elevated); color: var(--text-secondary); text-align: left; padding: 12px 16px; font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .att-table td { padding: 14px 16px; border-top: 1px solid var(--border-color); color: var(--text-primary); }
        .att-table tr:hover { background: rgba(255, 255, 255, 0.02); }
        .att-form { display: flex; flex-direction: column; gap: 14px; }
        .att-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .att-form input, .att-form select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Tracking</h1>
          <p className="page-sub">Monitor student attendance registers, absence patterns, and excused notes</p>
        </div>
        <Button onClick={() => {
          setEditId(null)
          setForm({
            student_id: '',
            class_id: '',
            date: new Date().toISOString().split('T')[0],
            status: 'present',
            note: '',
          })
          setIsFormOpen(true)
        }}>
          <FiPlus /> Mark Attendance
        </Button>
      </div>

      <div className="filter-bar">
        <input 
          type="date" 
          className="filter-input" 
          value={dateFilter} 
          onChange={(e) => setDateFilter(e.target.value)} 
        />

        <select 
          className="filter-select" 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>

        <Button size="sm" variant="secondary" onClick={loadAttendance}>
          <FiFilter /> Filter
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setDateFilter(''); setClassFilter(''); setStatusFilter(''); loadAttendance(); }}>
          Reset
        </Button>
      </div>

      {loading ? (
        <Loading text="Loading attendance records from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <div className="att-table-wrapper">
          <table className="att-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No attendance records found matching current filters.
                  </td>
                </tr>
              ) : (
                attendanceList.map((rec, i) => (
                  <tr key={rec.id}>
                    <td>{i + 1}</td>
                    <td><strong>{rec.student?.name || `Student #${rec.student_id}`}</strong></td>
                    <td>{rec.class_?.name || 'Homeroom'}</td>
                    <td>{rec.date}</td>
                    <td>{getStatusBadge(rec.status)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{rec.note || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => {
                          setEditId(rec.id)
                          setForm({
                            student_id: rec.student_id,
                            class_id: rec.class_id || '',
                            date: rec.date,
                            status: rec.status,
                            note: rec.note || '',
                          })
                          setIsFormOpen(true)
                        }} title="Edit"><FiEdit /></Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(rec.id)} title="Delete"><FiTrash2 /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mark / Edit Attendance Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editId ? "Edit Attendance Entry" : "Record Attendance Entry"}
      >
        <form className="att-form" onSubmit={handleSave}>
          <label>
            Select Student *
            <select 
              value={form.student_id} 
              onChange={(e) => {
                const sId = e.target.value
                const sObj = students.find(s => s.id === parseInt(sId))
                setForm({
                  ...form,
                  student_id: sId,
                  class_id: sObj?.class_id || form.class_id,
                })
              }} 
              required
            >
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.homeroom_class?.name || 'No Class'})</option>
              ))}
            </select>
          </label>

          <label>
            Class / Homeroom
            <select 
              value={form.class_id} 
              onChange={(e) => setForm({ ...form, class_id: e.target.value })}
            >
              <option value="">-- Select Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Date *
              <input 
                type="date" 
                value={form.date} 
                onChange={(e) => setForm({ ...form, date: e.target.value })} 
                required 
              />
            </label>
            <label>
              Attendance Status *
              <select 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </label>
          </div>

          <label>
            Note / Reason (Optional)
            <input 
              value={form.note} 
              onChange={(e) => setForm({ ...form, note: e.target.value })} 
              placeholder="e.g. Doctor's appointment, Flu" 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>Save Attendance</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        title="Delete Attendance Record"
      >
        <div>
          <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
            Are you sure you want to remove this attendance record?
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
