import api from './api.js'

export const reportService = {
  getSummary:          ()       => api.get('/reports/summary/').then(r => r.data),
  getAttendanceReport: (params) => api.get('/reports/attendance/', { params }).then(r => r.data),
  getScoreReport:      (params) => api.get('/reports/scores/', { params }).then(r => r.data),
}
