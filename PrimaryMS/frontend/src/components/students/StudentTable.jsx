import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'
import Button from '../common/Button.jsx'
import './StudentTable.css'

/**
 * @param {{ students: Array, onEdit: Function, onDelete: Function, onView: Function, offset?: number }} props
 */
export default function StudentTable({ students = [], onEdit, onDelete, onView, offset = 0 }) {
  return (
    <div className="student-table-wrapper">
      <table className="student-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Class</th>
            <th>Parent</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 ? (
            <tr>
              <td colSpan={7} className="student-table__empty">No students found.</td>
            </tr>
          ) : (
            students.map((s, i) => (
              <tr key={s.id}>
                <td>{offset + i + 1}</td>
                <td>
                  <div className="student-table__name">
                    <div className="student-table__avatar">{s.name?.[0] || '?'}</div>
                    <div>
                      <strong>{s.name}</strong>
                      {s.gender && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.gender}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8' }}>
                    {s.homeroom_class?.name || s.class || 'Unassigned'}
                  </span>
                </td>
                <td>{s.parent?.name || s.parent || '—'}</td>
                <td>{s.phone || s.parent?.phone || '—'}</td>
                <td>
                  <span className={`badge badge--${(s.is_active ?? s.active ?? true) ? 'success' : 'danger'}`}>
                    {(s.is_active ?? s.active ?? true) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="student-table__actions">
                    <Button variant="ghost" size="sm" onClick={() => onView?.(s)} title="View"><FiEye /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit?.(s)} title="Edit"><FiEdit2 /></Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete?.(s)} title="Delete"><FiTrash2 /></Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
