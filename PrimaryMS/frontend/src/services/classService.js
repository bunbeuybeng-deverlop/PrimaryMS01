import api from './api.js'

export const classService = {
  getAll:    (params)      => api.get('/classes/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/classes/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/classes/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/classes/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/classes/${id}/`).then(r => r.data),
}
