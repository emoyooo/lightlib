import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  // Set up axios interceptor
  const setupAxiosInterceptor = () => {
    axios.interceptors.request.use(
      (config) => {
        if (token.value) {
          config.headers.Authorization = `Bearer ${token.value}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )
  }

  setupAxiosInterceptor()

  const register = async (email, password, nickname = '') => {
    try {
      loading.value = true
      error.value = null

      const payload = {
        email,
        password,
      }

      // Only add nickname if it's not empty
      if (nickname && nickname.trim()) {
        payload.nickname = nickname.trim()
      }

      console.log('Sending registration payload:', payload)

      const response = await axios.post(`${API_URL}/auth/register`, payload)

      console.log('Registration response:', response.data)

      token.value = response.data.data.token
      user.value = response.data.data.user
      localStorage.setItem('token', token.value)

      return { success: true }
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message)
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      token.value = response.data.data.token
      user.value = response.data.data.user
      localStorage.setItem('token', token.value)

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`)
      user.value = response.data.data.user
    } catch (err) {
      logout()
    }
  }

  const updateProfile = async (nickname) => {
    try {
      loading.value = true
      error.value = null

      const response = await axios.put(`${API_URL}/auth/profile`, {
        nickname: nickname || null,
      })

      user.value = response.data.data.user
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Update failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Initialize user from token
  if (token.value) {
    fetchProfile()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
  }
})
