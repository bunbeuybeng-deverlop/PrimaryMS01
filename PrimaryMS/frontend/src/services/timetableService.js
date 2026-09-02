import api from './api.js'

export const timetableService = {
  getAll:    (params)      => api.get('/timetable/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/timetable/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/timetable/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/timetable/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/timetable/${id}/`).then(r => r.data),
}
