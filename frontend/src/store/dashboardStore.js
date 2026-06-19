import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useDashboardStore = create((set) => ({
  trainees: [],
  trainers: [],
  jobs: [],
  assignments: [],
  certifications: [],
  rejections: [],
  organizations: [],
  loading: false,
  error: null,

  fetchTraineeData: async (traineeId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/trainee/${traineeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({
        loading: false,
        trainees: [response.data]
      })
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch trainee data',
        loading: false
      })
    }
  },

  fetchTrainerData: async (trainerId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/trainer/${trainerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      set({
        loading: false,
        trainers: [response.data],
        assignments: response.data.assignments || []
      })
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch trainer data',
        loading: false
      })
    }
  },

  fetchAdminData: async () => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const [traineesRes, trainersRes, jobsRes, orgsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/trainees`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/trainers`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/jobs`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/organizations`, { headers: { Authorization: `Bearer ${token}` } })
      ])

      set({
        trainees: traineesRes.data,
        trainers: trainersRes.data,
        jobs: jobsRes.data,
        organizations: orgsRes.data,
        loading: false
      })
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch admin data',
        loading: false
      })
    }
  },

  updateTraineeProfile: async (traineeId, profileData) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(
        `${API_URL}/trainee/${traineeId}/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ loading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update profile',
        loading: false
      })
      throw error
    }
  },

  assignTraineeToTrainer: async (traineeId, trainerId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/admin/assign-trainee`,
        { traineeId, trainerId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ loading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to assign trainee',
        loading: false
      })
      throw error
    }
  },

  recommendJob: async (traineeId, jobId) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/admin/recommend-job`,
        { traineeId, jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set({ loading: false })
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to recommend job',
        loading: false
      })
      throw error
    }
  },

  addOrganization: async (orgData) => {
    set({ loading: true, error: null })
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/admin/organizations`,
        orgData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      set((state) => ({
        organizations: [...state.organizations, response.data],
        loading: false
      }))
      return response.data
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add organization',
        loading: false
      })
      throw error
    }
  }
}))
