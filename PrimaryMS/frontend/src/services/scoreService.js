import api from './api.js'

export const scoreService = {
  getAll:    (params)      => api.get('/scores/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/scores/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/scores/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/scores/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/scores/${id}/`).then(r => r.data),
}
