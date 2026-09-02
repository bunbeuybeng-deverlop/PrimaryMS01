import api from './api.js'

export const attendanceService = {
  getAll:    (params)      => api.get('/attendance/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/attendance/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/attendance/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/attendance/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/attendance/${id}/`).then(r => r.data),
}
