import { useState, useEffect } from 'react'
import { FiPlus, FiDollarSign, FiFilter, FiCheck, FiTrash2, FiAlertCircle, FiCheckCircle, FiClock, FiEdit } from 'react-icons/fi'
import { feeService } from '../../services/feeService.js'
import { studentService } from '../../services/studentService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'

export default function AdminFees() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [studentFilter, setStudentFilter] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    student_id: '',
    amount: 150,
    description: 'Term Tuition Fee',
    due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    status: 'unpaid',
  })

  useEffect(() => {
    loadDependencies()
    loadFees()
  }, [])

  const loadDependencies = async () => {
    try {
      const stu = await studentService.getAll()
      setStudents(stu)
    } catch (err) {
      console.error('Failed to load students for fees:', err)
    }
  }

  const loadFees = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (studentFilter) params.student_id = studentFilter

      const data = await feeService.getAll(params)
      setFees(data)
      setError('')
    } catch (err) {
      console.error('Failed to load fees:', err)
      setError('Failed to fetch fee records.')
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
        amount: parseFloat(form.amount),
        description: form.description || null,
        due_date: form.due_date,
        paid_date: form.status === 'paid' ? new Date().toISOString().split('T')[0] : null,
        status: form.status,
      }
      if (editId) {
        await feeService.update(editId, payload)
      } else {
        await feeService.create(payload)
      }
      setIsFormOpen(false)
      loadFees()
    } catch (err) {
      console.error('Fee save failed:', err)
      alert(err.response?.data?.detail || 'Failed to save fee record.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleMarkPaid = async (fee) => {
    try {
      setActionLoading(true)
      await feeService.update(fee.id, {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0],
      })
      loadFees()
    } catch (err) {
      console.error('Update fee failed:', err)
      alert('Failed to update fee status.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setActionLoading(true)
      await feeService.remove(deleteId)
      setDeleteId(null)
      loadFees()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete fee record.')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="badge badge--success"><FiCheckCircle /> Paid</span>
      case 'overdue':
        return <span className="badge badge--danger"><FiAlertCircle /> Overdue</span>
      case 'unpaid':
        return <span className="badge badge--warning"><FiClock /> Unpaid</span>
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
        .filter-select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 8px 12px; color: var(--text-primary); font-size: 0.88rem; outline: none; }
        .fee-table-wrapper { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); overflow: hidden; }
        .fee-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .fee-table th { background: var(--bg-elevated); color: var(--text-secondary); text-align: left; padding: 12px 16px; font-weight: 600; font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .fee-table td { padding: 14px 16px; border-top: 1px solid var(--border-color); color: var(--text-primary); }
        .fee-table tr:hover { background: rgba(255, 255, 255, 0.02); }
        .fee-amount { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
        .fee-form { display: flex; flex-direction: column; gap: 14px; }
        .fee-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .fee-form input, .fee-form select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Tuition & Fee Billing</h1>
          <p className="page-sub">Manage student invoices, payment due dates, and settlement logs</p>
        </div>
        <Button onClick={() => {
          setEditId(null)
          setForm({
            student_id: '',
            amount: 150,
            description: 'Term Tuition Fee',
            due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
            status: 'unpaid',
          })
          setIsFormOpen(true)
        }}>
          <FiPlus /> Issue Fee Invoice
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
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Payment Statuses</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>

        <Button size="sm" variant="secondary" onClick={loadFees}>
          <FiFilter /> Filter
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setStudentFilter(''); setStatusFilter(''); loadFees(); }}>
          Reset
        </Button>
      </div>

      {loading ? (
        <Loading text="Loading billing records from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <div className="fee-table-wrapper">
          <table className="fee-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Paid Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No fee invoices found.
                  </td>
                </tr>
              ) : (
                fees.map((f, i) => (
                  <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td><strong>{f.student?.name || `Student #${f.student_id}`}</strong></td>
                    <td>{f.description || 'Tuition Fee'}</td>
                    <td><span className="fee-amount">${f.amount?.toFixed(2)}</span></td>
                    <td>{f.due_date}</td>
                    <td>{getStatusBadge(f.status)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{f.paid_date || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {f.status !== 'paid' && (
                          <Button variant="secondary" size="sm" onClick={() => handleMarkPaid(f)} title="Mark as Paid">
                            <FiCheck /> Mark Paid
                          </Button>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => {
                          setEditId(f.id)
                          setForm({
                            student_id: f.student_id,
                            amount: f.amount,
                            description: f.description || '',
                            due_date: f.due_date,
                            status: f.status,
                          })
                          setIsFormOpen(true)
                        }} title="Edit"><FiEdit /></Button>
                        <Button variant="danger" size="sm" onClick={() => setDeleteId(f.id)} title="Delete"><FiTrash2 /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue / Edit Fee Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title={editId ? "Edit Fee Invoice" : "Issue New Fee Invoice"}
      >
        <form className="fee-form" onSubmit={handleSave}>
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
            Fee Description *
            <input 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="e.g. Term tuition, Activity fee, Uniform" 
              required 
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Amount ($) *
              <input 
                type="number" 
                step="0.01" 
                min="1" 
                value={form.amount} 
                onChange={(e) => setForm({ ...form, amount: e.target.value })} 
                required 
              />
            </label>
            <label>
              Due Date *
              <input 
                type="date" 
                value={form.due_date} 
                onChange={(e) => setForm({ ...form, due_date: e.target.value })} 
                required 
              />
            </label>
          </div>

          <label>
            Payment Status
            <select 
              value={form.status} 
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>Issue Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        title="Delete Fee Record"
      >
        <div>
          <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
            Are you sure you want to delete this billing invoice?
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
