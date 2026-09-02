import { Outlet } from 'react-router-dom'
import Sidebar from '../components/common/Sidebar.jsx'
import Navbar  from '../components/common/Navbar.jsx'
import './Layout.css'

export default function AdminLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Navbar />
        <main className="layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
