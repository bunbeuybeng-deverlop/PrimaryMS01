import api from './api.js'

export const parentService = {
  getAll:    (params)      => api.get('/parents/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/parents/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/parents/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/parents/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/parents/${id}/`).then(r => r.data),
}
