import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { FiHome, FiUsers, FiBook, FiCalendar, FiDollarSign, FiGrid, FiBarChart2, FiClock, FiUserCheck } from 'react-icons/fi'
import './Sidebar.css'

const adminLinks = [
  { to: '/admin',            label: 'Dashboard',  Icon: FiHome },
  { to: '/admin/students',   label: 'Students',   Icon: FiUsers },
  { to: '/admin/teachers',   label: 'Teachers',   Icon: FiUserCheck },
  { to: '/admin/parents',    label: 'Parents',    Icon: FiUsers },
  { to: '/admin/classes',    label: 'Classes',    Icon: FiGrid },
  { to: '/admin/subjects',   label: 'Subjects',   Icon: FiBook },
  { to: '/admin/attendance', label: 'Attendance', Icon: FiCalendar },
  { to: '/admin/scores',     label: 'Scores',     Icon: FiBarChart2 },
  { to: '/admin/fees',       label: 'Fees',       Icon: FiDollarSign },
  { to: '/admin/timetable',  label: 'Timetable',  Icon: FiClock },
  { to: '/admin/reports',    label: 'Reports',    Icon: FiBarChart2 },
]

const teacherLinks = [
  { to: '/teacher',            label: 'Dashboard',  Icon: FiHome },
  { to: '/teacher/classes',    label: 'My Classes', Icon: FiGrid },
  { to: '/teacher/attendance', label: 'Attendance', Icon: FiCalendar },
  { to: '/teacher/scores',     label: 'Scores',     Icon: FiBarChart2 },
]

const parentLinks = [
  { to: '/parent',            label: 'Dashboard',  Icon: FiHome },
  { to: '/parent/children',   label: 'Children',   Icon: FiUsers },
  { to: '/parent/attendance', label: 'Attendance', Icon: FiCalendar },
  { to: '/parent/scores',     label: 'Scores',     Icon: FiBarChart2 },
]

const linksByRole = { admin: adminLinks, teacher: teacherLinks, parent: parentLinks }

export default function Sidebar() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const links = linksByRole[user?.role] || []

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">🏫</span>
        <span className="sidebar__title">PrimaryMS</span>
      </div>
      <nav className="sidebar__nav">
        {links.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar__link${pathname === to ? ' sidebar__link--active' : ''}`}
          >
            <Icon className="sidebar__icon" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
