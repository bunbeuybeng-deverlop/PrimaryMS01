import api from './api.js'

export const authService = {
  login: async ({ username, password }) => {
    const { data } = await api.post('/auth/login/', { username, password })
    if (data.access_token) {
      localStorage.setItem('token', data.access_token)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data.user
  },

  register: async ({ username, email, password, role }) => {
    const { data } = await api.post('/auth/register/', { username, email, password, role, is_active: true })
    if (data.access_token) {
      localStorage.setItem('token', data.access_token)
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user))
    }
    return data.user
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    try {
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  getMe: async () => {
    const { data } = await api.get('/auth/me/')
    if (data) {
      localStorage.setItem('user', JSON.stringify(data))
    }
    return data
  },
}

