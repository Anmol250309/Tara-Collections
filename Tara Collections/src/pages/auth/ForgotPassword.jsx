import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function ForgotPassword() {
  const navigate = useNavigate()
  const { resetPassword, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28 pb-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="font-serif text-3xl font-bold text-dark-950">TARA</span>
            <span className="text-xs font-medium text-primary-500 tracking-widest ml-1">COLLECTIONS</span>
          </Link>
          {sent ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="heading-3">Check Your Email</h1>
              <p className="text-body text-dark-500 mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </>
          ) : (
            <>
              <h1 className="heading-3">Forgot Password?</h1>
              <p className="text-body text-dark-500 mt-2">
                Enter your email and we'll send you a link to reset your password
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-card p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-dark-600 mb-6">
                Please check your inbox (and spam folder) for the reset link.
                The link will expire in 1 hour.
              </p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="btn-primary w-full py-3"
              >
                Back to Login
              </button>
              <p className="mt-4 text-sm text-dark-500">
                Didn't receive the email?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Resend
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="label flex items-center gap-2">
                  <Mail className="w-5 h-5 text-dark-400" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || authLoading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-dark-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword