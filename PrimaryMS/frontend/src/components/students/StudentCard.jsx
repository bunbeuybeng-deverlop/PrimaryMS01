export default function StudentCard({ student }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg,var(--color-primary),var(--color-secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '1.2rem', fontWeight: 700,
      }}>
        {student?.name?.[0]}
      </div>
      <h4 style={{ fontWeight: 600, marginTop: 4 }}>{student?.name}</h4>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{student?.class}</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Parent: {student?.parent}</p>
    </div>
  )
}
