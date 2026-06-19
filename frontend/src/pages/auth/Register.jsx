import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Mail, Lock, User, Phone } from 'lucide-react'

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'trainee' // ✨ Switched from userType to role to match backend expectations perfectly
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { register, loading, error } = useAuthStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear errors dynamically as the user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Sending both 'role' and 'userType' keys to safely protect against whatever your backend relies on
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        userType: formData.role 
      })
      
      sessionStorage.setItem('registerEmail', formData.email)
      navigate('/verify-otp')
    } catch (err) {
      setErrors({ submit: error || 'Registration failed. Please check your network connectivity.' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-swing-light to-blue-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md shadow-lg bg-white p-6 rounded-xl border border-gray-100">
        <h2 className="text-3xl font-black text-swing-primary mb-6 text-center tracking-tight">
          Swing<span className="text-teal-600">.</span>
        </h2>
        
        <h3 className="text-2xl font-bold text-swing-dark mb-2">Create Account</h3>
        <p className="text-gray-500 text-sm mb-6">Join Swing and unlock immediate market placement.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50/50 rounded-lg focus-within:bg-white focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary transition-all">
              <User size={18} className="text-swing-primary ml-3" />
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-hidden"
              />
            </div>
            {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50/50 rounded-lg focus-within:bg-white focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary transition-all">
              <Mail size={18} className="text-swing-primary ml-3" />
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-hidden"
              />
            </div>
            {errors.email && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50/50 rounded-lg focus-within:bg-white focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary transition-all">
              <Phone size={18} className="text-swing-primary ml-3" />
              <input
                type="tel"
                name="phone"
                placeholder="e.g., +256..."
                value={formData.phone}
                onChange={handleChange}
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-hidden"
              />
            </div>
            {errors.phone && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.phone}</p>}
          </div>

          {/* User Role Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Account Role Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:outline-hidden focus:border-swing-primary focus:ring-1 focus:ring-swing-primary transition-all"
            >
              <option value="trainee">Trainee / Youth Applicant</option>
              <option value="trainer">Academic Facilitator / Trainer</option>
              <option value="admin">Platform System Administrator</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50/50 rounded-lg focus-within:bg-white focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary transition-all">
              <Lock size={18} className="text-swing-primary ml-3" />
              <input
                type="password"
                name="password"
                placeholder="Create secure password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-hidden"
              />
            </div>
            {errors.password && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="flex items-center border border-gray-200 bg-gray-50/50 rounded-lg focus-within:bg-white focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary transition-all">
              <Lock size={18} className="text-swing-primary ml-3" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Retype password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-gray-800 focus:outline-hidden"
              />
            </div>
            {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Registering Workspace...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-gray-500">
          Already verified?
          <Link to="/login" className="text-swing-primary font-bold hover:underline ml-1">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register