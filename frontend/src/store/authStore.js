import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to ensure user object always has a standardized 'role' property
const normalizeUser = (userObj) => {
  if (!userObj) return null
  return {
    ...userObj,
    role: userObj.role || userObj.userType || userObj.user_type || 'trainee'
  }
}

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false,
  otpAttempts: 0,
  otpTimer: 0,

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  register: async (userData) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData)
      set({ 
        otpSent: true,
        loading: false,
        otpAttempts: 0
      })
      return response.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Registration failed',
        loading: false 
      })
      throw error
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp })
      
      // Normalize user role formatting instantly
      const cleanUser = normalizeUser(response.data.user)
      
      set({
        user: cleanUser,
        isAuthenticated: true,
        otpSent: false,
        otpAttempts: 0,
        loading: false
      })
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      set((state) => ({
        otpAttempts: state.otpAttempts + 1,
        error: error.response?.data?.message || 'OTP verification failed',
        loading: false
      }))

      const state = useAuthStore.getState()
      if (state.otpAttempts >= 3) {
        set({ otpTimer: 300 })
        startOtpTimer()
      }
      throw error
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      
      // Normalize user role formatting instantly
      const cleanUser = normalizeUser(response.data.user)

      set({
        user: cleanUser,
        isAuthenticated: true,
        loading: false
      })
      localStorage.setItem('token', response.data.token)
      return response.data
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Login failed',
        loading: false 
      })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      otpSent: false,
      otpAttempts: 0
    })
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Normalize user role formatting instantly
        const cleanUser = normalizeUser(response.data.user)

        set({
          user: cleanUser,
          isAuthenticated: true
        })
      } catch (error) {
        localStorage.removeItem('token')
        set({ isAuthenticated: false })
      }
    }
  }
}))

const startOtpTimer = () => {
  const timer = setInterval(() => {
    const state = useAuthStore.getState()
    const newTimer = state.otpTimer - 1
    if (newTimer <= 0) {
      clearInterval(timer)
      useAuthStore.setState({
        otpTimer: 0,
        otpAttempts: 0,
        otpSent: false
      })
    } else {
      useAuthStore.setState({ otpTimer: newTimer })
    }
  }, 1000)
}