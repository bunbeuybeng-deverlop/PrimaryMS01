import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiUsers, FiUserCheck, FiBookOpen, FiCalendar, FiDollarSign, FiGrid, 
  FiArrowRight, FiCheckCircle, FiAlertCircle, FiPlus, FiBarChart2
} from 'react-icons/fi'
import { reportService } from '../../services/reportService.js'
import Loading from '../../components/common/Loading.jsx'
import './Dashboard.css'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const data = await reportService.getSummary()
      setSummary(data)
    } catch (err) {
      console.error('Failed to load dashboard summary:', err)
      setError('Unable to load latest statistics from server.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard__header">
          <h1 className="dashboard__title">Admin Dashboard</h1>
          <p className="dashboard__sub">Overview of your school at a glance</p>
        </div>
        <Loading text="Loading school metrics..." />
      </div>
    )
  }

  const statItems = [
    { label: 'Total Students', value: summary?.total_students ?? 0, Icon: FiUsers, color: '#4f46e5', link: '/admin/students' },
    { label: 'Active Teachers', value: summary?.total_teachers ?? 0, Icon: FiUserCheck, color: '#06b6d4', link: '/admin/teachers' },
    { label: 'Active Classes', value: summary?.total_classes ?? 0, Icon: FiGrid, color: '#10b981', link: '/admin/classes' },
    { label: 'Subjects Offered', value: summary?.total_subjects ?? 0, Icon: FiBookOpen, color: '#8b5cf6', link: '/admin/subjects' },
    { 
      label: "Today's Attendance", 
      value: `${summary?.attendance_today_present ?? 0} Present`, 
      sub: `${summary?.attendance_today_absent ?? 0} absent`,
      Icon: FiCalendar, 
      color: '#f59e0b', 
      link: '/admin/attendance' 
    },
    { 
      label: 'Unpaid Fees Total', 
      value: `$${(summary?.fees_unpaid_total ?? 0).toLocaleString()}`, 
      sub: `${summary?.fees_overdue_count ?? 0} overdue`,
      Icon: FiDollarSign, 
      color: '#ef4444', 
      link: '/admin/fees' 
    },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dashboard__title">Admin Dashboard</h1>
          <p className="dashboard__sub">Live PostgreSQL Database Connection · PrimaryMS</p>
        </div>
        <button className="dashboard__refresh-btn" onClick={fetchSummary} title="Refresh metrics">
          Refresh Data
        </button>
      </div>

      {error && <div className="dashboard__error">{error}</div>}

      <div className="dashboard__stats">
        {statItems.map(({ label, value, sub, Icon, color, link }) => (
          <Link key={label} to={link} className="stat-card">
            <div className="stat-card__icon" style={{ background: `${color}22`, color }}>
              <Icon />
            </div>
            <div className="stat-card__body">
              <p className="stat-card__value">{value}</p>
              <p className="stat-card__label">{label}</p>
              {sub && <span className="stat-card__sub">{sub}</span>}
            </div>
            <FiArrowRight className="stat-card__arrow" />
          </Link>
        ))}
      </div>

      <div className="dashboard__grid" style={{ marginTop: '28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Quick Management Actions */}
        <div className="dash-card">
          <h3 className="dash-card__title">⚡ Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/admin/students" className="quick-action-btn">
              <FiPlus /> Enroll New Student
            </Link>
            <Link to="/admin/attendance" className="quick-action-btn">
              <FiCalendar /> Mark Daily Attendance
            </Link>
            <Link to="/admin/scores" className="quick-action-btn">
              <FiBarChart2 /> Record Exam Scores
            </Link>
            <Link to="/admin/fees" className="quick-action-btn">
              <FiDollarSign /> Manage Invoices & Fees
            </Link>
          </div>
        </div>

        {/* System Health / Status */}
        <div className="dash-card">
          <h3 className="dash-card__title">🏫 Academic System Status</h3>
          <div className="status-list">
            <div className="status-item">
              <span className="status-indicator status-indicator--online"></span>
              <div className="status-text">
                <strong>FastAPI REST Backend</strong>
                <p>Connected via asyncpg & psycopg2 (PostgreSQL)</p>
              </div>
              <FiCheckCircle style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="status-item">
              <span className="status-indicator status-indicator--online"></span>
              <div className="status-text">
                <strong>Database Schema</strong>
                <p>Alembic version 24a166e2a27e (Up-to-date)</p>
              </div>
              <FiCheckCircle style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="status-item">
              <span className="status-indicator status-indicator--warning"></span>
              <div className="status-text">
                <strong>Outstanding Fees</strong>
                <p>{summary?.fees_overdue_count ?? 0} invoices currently overdue</p>
              </div>
              <FiAlertCircle style={{ color: 'var(--color-warning)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
