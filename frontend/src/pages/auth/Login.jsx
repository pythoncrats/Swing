import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Mail, Lock } from 'lucide-react'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.password) newErrors.password = 'Password is required'
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
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ submit: error })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-swing-light to-blue-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md shadow-lg">
        <h2 className="text-3xl font-bold text-swing-primary mb-6 text-center">Swing</h2>
        
        <h3 className="text-2xl font-bold text-swing-dark mb-2">Welcome Back</h3>
        <p className="text-gray-600 mb-6">Login to your Swing account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-swing-dark mb-2">
              Email Address
            </label>
            <div className="flex items-center border border-swing-accent rounded focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary">
              <Mail size={20} className="text-swing-primary ml-3" />
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 px-3 py-2 bg-transparent focus:outline-none"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-swing-dark mb-2">
              Password
            </label>
            <div className="flex items-center border border-swing-accent rounded focus-within:border-swing-primary focus-within:ring-1 focus-within:ring-swing-primary">
              <Lock size={20} className="text-swing-primary ml-3" />
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 px-3 py-2 bg-transparent focus:outline-none"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Don't have an account?
          <Link to="/register" className="text-swing-primary font-semibold hover:text-swing-dark ml-1">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
