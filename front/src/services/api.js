import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create separate axios instance for book APIs (to avoid auth store interceptor conflicts)
const api = axios.create({
  baseURL: API_BASE_URL,
})

// Add token to requests (your auth store already handles this globally, but we'll add it here too)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Books API (public endpoints)
export const booksAPI = {
  search: (query, page = 1) => api.get('/books/search', { params: { query, page } }),
  getBooks: (page = 1, genre = null, sort = null) =>
    api.get('/books', { params: { page, genre, sort } }),
  getBookById: (id) => api.get(`/books/${id}`),
  getBookContent: (id) => api.get(`/books/${id}/content`),
}

// Library API (protected endpoints)
export const libraryAPI = {
  addToLibrary: (data) => api.post('/library', data),
  getLibrary: (status = null) => api.get('/library', { params: { status } }),
  updateStatus: (bookId, status) => api.patch(`/library/${bookId}/status`, { status }),
  removeFromLibrary: (bookId) => api.delete(`/library/${bookId}`),
}

// Reading API (protected endpoints)
export const readingAPI = {
  updateProgress: (data) => api.post('/reading/progress', data),
  getProgress: (bookId) => api.get(`/reading/progress/${bookId}`),
  addBookmark: (data) => api.post('/reading/bookmarks', data),
  getBookmarks: (bookId) => api.get(`/reading/bookmarks/${bookId}`),
  deleteBookmark: (id) => api.delete(`/reading/bookmarks/${id}`),
}

// Achievement API (protected endpoints)
export const achievementAPI = {
  getAchievements: () => api.get('/user/achievements'),
  getStats: () => api.get('/user/stats'),
}

export default api
