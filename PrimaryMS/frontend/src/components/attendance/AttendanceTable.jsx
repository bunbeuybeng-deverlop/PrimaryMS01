import './AttendanceTable.css'

const STATUS_LABEL = { present: '✅ Present', absent: '❌ Absent', late: '⏰ Late', excused: '📋 Excused' }

export default function AttendanceTable({ records = [] }) {
  return (
    <div className="att-table-wrapper">
      <table className="att-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Class</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records.</td></tr>
          ) : (
            records.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{r.student}</td>
                <td>{r.class}</td>
                <td>{r.date}</td>
                <td>
                  <span className={`badge badge--${r.status}`}>
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
