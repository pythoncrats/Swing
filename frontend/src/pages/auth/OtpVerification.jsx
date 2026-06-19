import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function OtpVerification() {
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { verifyOtp, otpAttempts, otpTimer, loading } = useAuthStore()

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('registerEmail')
    if (!storedEmail) {
      navigate('/register')
    }
    setEmail(storedEmail)
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp) {
      setError('Please enter the OTP')
      return
    }

    if (otpTimer > 0) {
      setError(`Please wait ${otpTimer} seconds before trying again`)
      return
    }

    try {
      await verifyOtp(email, otp)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-swing-light to-blue-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md shadow-lg">
        <h2 className="text-3xl font-bold text-swing-primary mb-6 text-center">Swing</h2>
        
        <h3 className="text-2xl font-bold text-swing-dark mb-2">Verify Your Email</h3>
        <p className="text-gray-600 mb-6">We have sent an OTP code to {email}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {otpAttempts >= 3 && otpTimer > 0 && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            Too many attempts. Please wait {otpTimer} seconds
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-swing-dark mb-2">
              Enter OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              disabled={otpTimer > 0}
              className="input-field text-center text-2xl letter-spacing tracking-widest font-mono disabled:bg-gray-100"
            />
            <p className="text-sm text-gray-600 mt-2">Attempts: {otpAttempts}/3</p>
          </div>

          <button
            type="submit"
            disabled={loading || otpTimer > 0}
            className="btn-primary w-full py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Did not receive the code?
          <button className="text-swing-primary font-semibold hover:text-swing-dark ml-1">
            Resend
          </button>
        </p>
      </div>
    </div>
  )
}

export default OtpVerification
