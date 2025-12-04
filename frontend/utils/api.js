// API utility functions for V-Link frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    return response.json()
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    return response.json()
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.json()
  },

  // Links endpoints
  createLink: async (linkData) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(linkData),
    })
    return response.json()
  },

  getLinks: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/links`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.json()
  },

  updateLink: async (id, linkData) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/links/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(linkData),
    })
    return response.json()
  },

  deleteLink: async (id) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/links/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.json()
  },

  // Bio endpoints
  getBio: async (username) => {
    const response = await fetch(`${API_BASE_URL}/api/bio/${username}`)
    return response.json()
  },

  updateBio: async (bioData) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/bio`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bioData),
    })
    return response.json()
  },

  // Analytics endpoints
  getLinkAnalytics: async (linkId) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/analytics/link/${linkId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.json()
  },

  getUserAnalytics: async () => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/analytics/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    return response.json()
  },
}

export default api
