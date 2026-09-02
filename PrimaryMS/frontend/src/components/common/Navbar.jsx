import { useAuth } from '../../hooks/useAuth.js'
import { FiBell, FiLogOut, FiUser } from 'react-icons/fi'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar__left">
        <h2 className="navbar__page-title">Welcome back, {user?.name || 'User'}</h2>
      </div>
      <div className="navbar__right">
        <button className="navbar__icon-btn" title="Notifications">
          <FiBell />
        </button>
        <div className="navbar__user">
          <div className="navbar__avatar">
            <FiUser />
          </div>
          <div className="navbar__user-info">
            <span className="navbar__user-name">{user?.name}</span>
            <span className="navbar__user-role">{user?.role}</span>
          </div>
        </div>
        <button className="navbar__icon-btn navbar__logout" onClick={logout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  )
}
