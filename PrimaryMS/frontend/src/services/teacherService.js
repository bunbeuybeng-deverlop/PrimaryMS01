import api from './api.js'

export const teacherService = {
  getAll:    (params)  => api.get('/teachers/', { params }).then(r => r.data),
  getById:   (id)      => api.get(`/teachers/${id}/`).then(r => r.data),
  create:    (payload) => api.post('/teachers/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/teachers/${id}/`, payload).then(r => r.data),
  remove:    (id)      => api.delete(`/teachers/${id}/`).then(r => r.data),
}
