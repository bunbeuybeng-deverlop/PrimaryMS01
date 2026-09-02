import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Layouts
import AdminLayout   from '../layouts/AdminLayout.jsx'
import TeacherLayout from '../layouts/TeacherLayout.jsx'
import ParentLayout  from '../layouts/ParentLayout.jsx'

// Auth
import Login    from '../pages/auth/Login.jsx'
import Register from '../pages/auth/Register.jsx'

// Admin pages
import AdminDashboard  from '../pages/admin/Dashboard.jsx'
import Students        from '../pages/admin/Students.jsx'
import Teachers        from '../pages/admin/Teachers.jsx'
import Parents         from '../pages/admin/Parents.jsx'
import Classes         from '../pages/admin/Classes.jsx'
import Subjects        from '../pages/admin/Subjects.jsx'
import AdminAttendance from '../pages/admin/Attendance.jsx'
import AdminScores     from '../pages/admin/Scores.jsx'
import Fees            from '../pages/admin/Fees.jsx'
import Timetable       from '../pages/admin/Timetable.jsx'
import Reports         from '../pages/admin/Reports.jsx'

// Teacher pages
import TeacherDashboard  from '../pages/teacher/Dashboard.jsx'
import MyClasses         from '../pages/teacher/MyClasses.jsx'
import TeacherAttendance from '../pages/teacher/Attendance.jsx'
import TeacherScores     from '../pages/teacher/Scores.jsx'

// Parent pages
import ParentDashboard  from '../pages/parent/Dashboard.jsx'
import Children         from '../pages/parent/Children.jsx'
import ParentAttendance from '../pages/parent/Attendance.jsx'
import ParentScores     from '../pages/parent/Scores.jsx'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students"   element={<Students />} />
        <Route path="teachers"   element={<Teachers />} />
        <Route path="parents"    element={<Parents />} />
        <Route path="classes"    element={<Classes />} />
        <Route path="subjects"   element={<Subjects />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="scores"     element={<AdminScores />} />
        <Route path="fees"       element={<Fees />} />
        <Route path="timetable"  element={<Timetable />} />
        <Route path="reports"    element={<Reports />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherLayout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path="classes"    element={<MyClasses />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="scores"     element={<TeacherScores />} />
      </Route>

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute role="parent"><ParentLayout /></ProtectedRoute>}>
        <Route index element={<ParentDashboard />} />
        <Route path="children"   element={<Children />} />
        <Route path="attendance" element={<ParentAttendance />} />
        <Route path="scores"     element={<ParentScores />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
