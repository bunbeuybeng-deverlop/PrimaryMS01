import { useState } from 'react'
import Button from '../common/Button.jsx'

const EMPTY = { 
  name: '', 
  gender: 'male', 
  date_of_birth: '', 
  class_id: '', 
  parent_id: '', 
  phone: '', 
  address: '', 
  is_active: true 
}

/**
 * @param {{ initial?: object, classes?: Array, parents?: Array, onSubmit: Function, onCancel: Function, loading?: boolean }} props
 */
export default function StudentForm({ initial, classes = [], parents = [], onSubmit, onCancel, loading = false }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    gender: initial?.gender || 'male',
    date_of_birth: initial?.date_of_birth || '',
    class_id: initial?.class_id || initial?.homeroom_class?.id || '',
    parent_id: initial?.parent_id || initial?.parent?.id || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
    is_active: initial?.is_active ?? true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      class_id: form.class_id ? parseInt(form.class_id) : null,
      parent_id: form.parent_id ? parseInt(form.parent_id) : null,
      date_of_birth: form.date_of_birth || null,
      phone: form.phone || null,
      address: form.address || null,
    }
    onSubmit(payload)
  }

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <style>{`
        .student-form { display:flex; flex-direction:column; gap:16px; }
        .student-form label { display:flex; flex-direction:column; gap:6px; font-size:.85rem; color:var(--text-secondary); }
        .student-form input, .student-form select { background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:9px 12px; color:var(--text-primary); font-family:inherit; font-size:.9rem; transition:border-color .2s; }
        .student-form input:focus, .student-form select:focus { outline:none; border-color:var(--color-primary); }
        .student-form__grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .student-form__actions { display:flex; gap:10px; justify-content:flex-end; margin-top:8px; }
        .student-form__check { flex-direction:row !important; align-items:center; gap:10px; cursor:pointer; }
      `}</style>

      <label>
        Full Name *
        <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Alex Smith" required />
      </label>

      <div className="student-form__grid">
        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Date of Birth
          <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} />
        </label>
      </div>

      <div className="student-form__grid">
        <label>
          Homeroom Class
          <select name="class_id" value={form.class_id} onChange={handleChange}>
            <option value="">-- Select Class --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.grade_level || 'General'})</option>
            ))}
          </select>
        </label>
        <label>
          Parent / Guardian
          <select name="parent_id" value={form.parent_id} onChange={handleChange}>
            <option value="">-- Select Parent --</option>
            {parents.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.phone || p.email})</option>
            ))}
          </select>
        </label>
      </div>

      <div className="student-form__grid">
        <label>
          Phone
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. 555-0199" />
        </label>
        <label>
          Address
          <input name="address" value={form.address} onChange={handleChange} placeholder="e.g. 123 Maple St" />
        </label>
      </div>

      <label className="student-form__check">
        <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
        Active Student
      </label>

      <div className="student-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial?.id ? 'Update Student' : 'Enroll Student'}</Button>
      </div>
    </form>
  )
}
