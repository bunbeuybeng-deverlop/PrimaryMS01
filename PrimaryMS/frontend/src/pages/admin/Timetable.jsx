import { useState, useEffect } from 'react'
import { FiPlus, FiClock, FiGrid, FiUser, FiBook, FiTrash2, FiCalendar } from 'react-icons/fi'
import { timetableService } from '../../services/timetableService.js'
import { classService } from '../../services/classService.js'
import { subjectService } from '../../services/subjectService.js'
import { teacherService } from '../../services/teacherService.js'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import Loading from '../../components/common/Loading.jsx'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

export default function AdminTimetable() {
  const [timetable, setTimetable] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [classFilter, setClassFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [form, setForm] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    day_of_week: 'monday',
    start_time: '08:00',
    end_time: '08:45',
    room: 'Room 101',
  })

  useEffect(() => {
    loadDependencies()
    loadTimetable()
  }, [])

  const loadDependencies = async () => {
    try {
      const [cls, sub, tch] = await Promise.all([
        classService.getAll(),
        subjectService.getAll(),
        teacherService.getAll(),
      ])
      setClasses(cls)
      setSubjects(sub)
      setTeachers(tch)
    } catch (err) {
      console.error('Failed to load timetable dependencies:', err)
    }
  }

  const loadTimetable = async () => {
    try {
      setLoading(true)
      const params = {}
      if (classFilter) params.class_id = classFilter
      if (dayFilter) params.day_of_week = dayFilter

      const data = await timetableService.getAll(params)
      setTimetable(data)
      setError('')
    } catch (err) {
      console.error('Failed to load timetable:', err)
      setError('Failed to fetch timetable records.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const payload = {
        class_id: parseInt(form.class_id),
        subject_id: parseInt(form.subject_id),
        teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null,
        day_of_week: form.day_of_week,
        start_time: form.start_time.length === 5 ? `${form.start_time}:00` : form.start_time,
        end_time: form.end_time.length === 5 ? `${form.end_time}:00` : form.end_time,
        room: form.room || null,
      }
      await timetableService.create(payload)
      setIsFormOpen(false)
      loadTimetable()
    } catch (err) {
      console.error('Timetable creation failed:', err)
      alert(err.response?.data?.detail || 'Failed to create timetable slot.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setActionLoading(true)
      await timetableService.remove(deleteId)
      setDeleteId(null)
      loadTimetable()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete timetable entry.')
    } finally {
      setActionLoading(false)
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
        .schedule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .slot-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; transition: transform var(--transition), box-shadow var(--transition); }
        .slot-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: rgba(99, 102, 241, 0.4); }
        .slot-day { text-transform: uppercase; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px; color: #a5b4fc; background: rgba(79, 70, 229, 0.15); padding: 3px 8px; border-radius: 6px; }
        .slot-time { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; }
        .slot-subject { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
        .slot-details { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .slot-row { display: flex; align-items: center; gap: 8px; }
        .slot-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 12px; }
        .time-form { display: flex; flex-direction: column; gap: 14px; }
        .time-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: var(--text-secondary); }
        .time-form input, .time-form select { background: var(--bg-elevated); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 9px 12px; color: var(--text-primary); font-family: inherit; font-size: 0.9rem; }
      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Class Timetable & Schedule</h1>
          <p className="page-sub">Organize weekly lesson periods, classroom allocations, and teaching periods</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <FiPlus /> Add Class Period
        </Button>
      </div>

      <div className="filter-bar">
        <select 
          className="filter-select" 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select 
          className="filter-select" 
          value={dayFilter} 
          onChange={(e) => setDayFilter(e.target.value)}
        >
          <option value="">All Weekdays</option>
          {DAYS.map(d => (
            <option key={d} value={d} style={{ textTransform: 'capitalize' }}>{d}</option>
          ))}
        </select>

        <Button size="sm" variant="secondary" onClick={loadTimetable}>
          Filter
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setClassFilter(''); setDayFilter(''); loadTimetable(); }}>
          Reset
        </Button>
      </div>

      {loading ? (
        <Loading text="Loading timetable schedules from PostgreSQL..." />
      ) : error ? (
        <div className="dashboard__error">{error}</div>
      ) : (
        <div className="schedule-grid">
          {timetable.map(slot => (
            <div key={slot.id} className="slot-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="slot-day">{slot.day_of_week}</span>
                  <span className="slot-time">
                    <FiClock style={{ color: 'var(--text-muted)' }} />
                    {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                  </span>
                </div>

                <h3 className="slot-subject">{slot.subject?.name || `Subject #${slot.subject_id}`}</h3>

                <div className="slot-details" style={{ marginTop: '12px' }}>
                  <div className="slot-row">
                    <FiGrid style={{ color: 'var(--text-muted)' }} />
                    <span>Class: <strong>{slot.class_?.name || 'Classroom'}</strong></span>
                  </div>
                  <div className="slot-row">
                    <FiUser style={{ color: 'var(--text-muted)' }} />
                    <span>Instructor: {slot.teacher?.name || 'Assigned Faculty'}</span>
                  </div>
                  {slot.room && (
                    <div className="slot-row">
                      <FiCalendar style={{ color: 'var(--text-muted)' }} />
                      <span>Location: {slot.room}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="slot-footer">
                <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#38bdf8' }}>
                  {slot.room || 'Standard Hall'}
                </span>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(slot.id)} title="Delete"><FiTrash2 /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        title="Schedule Class Period"
      >
        <form className="time-form" onSubmit={handleCreate}>
          <label>
            Class *
            <select 
              value={form.class_id} 
              onChange={(e) => setForm({ ...form, class_id: e.target.value })} 
              required
            >
              <option value="">-- Choose Class --</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.grade_level || 'General'})</option>
              ))}
            </select>
          </label>

          <label>
            Subject *
            <select 
              value={form.subject_id} 
              onChange={(e) => {
                const sId = e.target.value
                const sObj = subjects.find(s => s.id === parseInt(sId))
                setForm({ 
                  ...form, 
                  subject_id: sId,
                  teacher_id: sObj?.teacher_id || form.teacher_id,
                })
              }} 
              required
            >
              <option value="">-- Choose Subject --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.code || 'Curriculum'})</option>
              ))}
            </select>
          </label>

          <label>
            Teacher
            <select 
              value={form.teacher_id} 
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
            >
              <option value="">-- Assigned Teacher --</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Day of Week *
              <select 
                value={form.day_of_week} 
                onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
              >
                {DAYS.map(d => (
                  <option key={d} value={d} style={{ textTransform: 'capitalize' }}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              Room / Lab
              <input 
                value={form.room} 
                onChange={(e) => setForm({ ...form, room: e.target.value })} 
                placeholder="e.g. Room 102" 
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label>
              Start Time *
              <input 
                type="time" 
                value={form.start_time} 
                onChange={(e) => setForm({ ...form, start_time: e.target.value })} 
                required 
              />
            </label>
            <label>
              End Time *
              <input 
                type="time" 
                value={form.end_time} 
                onChange={(e) => setForm({ ...form, end_time: e.target.value })} 
                required 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={actionLoading}>Schedule Period</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal 
        isOpen={Boolean(deleteId)} 
        onClose={() => setDeleteId(null)} 
        title="Delete Schedule Period"
      >
        <div>
          <p style={{ marginBottom: '18px', color: 'var(--text-secondary)' }}>
            Are you sure you want to remove this timetable slot?
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
