import api from './api.js'

export const subjectService = {
  getAll:    (params)      => api.get('/subjects/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/subjects/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/subjects/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/subjects/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/subjects/${id}/`).then(r => r.data),
}
