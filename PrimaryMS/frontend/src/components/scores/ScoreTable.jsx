import './ScoreTable.css'

export default function ScoreTable({ scores = [] }) {
  return (
    <div className="score-table-wrapper">
      <table className="score-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Student</th>
            <th>Subject</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {scores.length === 0 ? (
            <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No scores yet.</td></tr>
          ) : (
            scores.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.student}</td>
                <td>{s.subject}</td>
                <td>{s.exam}</td>
                <td>
                  <span className="score-table__score">{s.score}</span>
                </td>
                <td>
                  <span className={`badge badge--grade-${s.grade?.toLowerCase()}`}>{s.grade}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
