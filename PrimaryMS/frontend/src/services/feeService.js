import api from './api.js'

export const feeService = {
  getAll:    (params)      => api.get('/fees/', { params }).then(r => r.data),
  getById:   (id)          => api.get(`/fees/${id}/`).then(r => r.data),
  create:    (payload)     => api.post('/fees/', payload).then(r => r.data),
  update:    (id, payload) => api.put(`/fees/${id}/`, payload).then(r => r.data),
  remove:    (id)          => api.delete(`/fees/${id}/`).then(r => r.data),
}
