import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import Register from './pages/auth/Register'
import Login from './pages/auth/Login'
import OtpVerification from './pages/auth/OtpVerification'
import DashboardSelector from './pages/dashboard/DashboardSelector'
import TraineeDashboard from './pages/dashboard/TraineeDashboard'
import TrainerDashboard from './pages/dashboard/TrainerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardSelector />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trainee-dashboard"
          element={
            <ProtectedRoute>
              <TraineeDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
