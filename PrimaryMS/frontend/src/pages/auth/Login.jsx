import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import './Login.css'



export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]           = useState({ username: '', password: '' })
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showPass, setShowPass]   = useState(false)

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const user = await login(form)
      navigate(`/${user.role}`, { replace: true })
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left Branding Panel ── */}
      <div className="auth-panel">
        {/* Ambient orbs */}
        <div className="auth-panel__orb auth-panel__orb--1" />
        <div className="auth-panel__orb auth-panel__orb--2" />
        <div className="auth-panel__orb auth-panel__orb--3" />

        {/* Geometric shapes */}
        <div className="auth-panel__shapes">
          <div className="auth-panel__shape auth-panel__shape--1" />
          <div className="auth-panel__shape auth-panel__shape--2" />
          <div className="auth-panel__shape auth-panel__shape--3" />
        </div>

        {/* School icon */}
        <div className="auth-panel__illustration" aria-hidden="true">🏫</div>

        <div className="auth-panel__content">
          <h1 className="auth-panel__logo-title">
            <span className="auth-panel__logo-primary">Primary</span>
            <span className="auth-panel__logo-accent">MS</span>
          </h1>
          <p className="auth-panel__tagline">School Management System</p>

          <div className="auth-panel__features">
            <div className="auth-panel__feature">
              <span className="auth-panel__feature-icon">📊</span>
              <div className="auth-panel__feature-text">
                <strong>Real-time Dashboard</strong>
                Track attendance, scores, and performance at a glance
              </div>
            </div>
            <div className="auth-panel__feature">
              <span className="auth-panel__feature-icon">👨‍🏫</span>
              <div className="auth-panel__feature-text">
                <strong>Multi-role Access</strong>
                Tailored portals for admins, teachers, and parents
              </div>
            </div>
            <div className="auth-panel__feature">
              <span className="auth-panel__feature-icon">🔒</span>
              <div className="auth-panel__feature-text">
                <strong>Secure & Reliable</strong>
                JWT-based authentication with role protection
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">
          {/* Mobile-only branding */}
          <div className="auth-card__mobile-brand">
            <span className="auth-card__mobile-logo" aria-hidden="true">🏫</span>
            <div className="auth-card__mobile-title">PrimaryMS</div>
          </div>

          {/* Header */}
          <div className="auth-card__header">
            <h2 className="auth-card__greeting">Welcome back 👋</h2>
            <p className="auth-card__hint">
              Don't have an account?{' '}
              <Link to="/register">Create one</Link>
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="auth-form__error" role="alert">
                <span className="auth-form__error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Username */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-username">
                Username
              </label>
              <div className="auth-field__input-wrap">
                <span className="auth-field__icon" aria-hidden="true">👤</span>
                <input
                  id="login-username"
                  className="auth-field__input"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-field__label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-field__input-wrap">
                <span className="auth-field__icon" aria-hidden="true">🔑</span>
                <input
                  id="login-password"
                  className="auth-field__input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-field__toggle"
                  onClick={() => setShowPass(p => !p)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              <span className="auth-submit-btn__inner">
                {loading && <span className="auth-spinner" />}
                {loading ? 'Signing in…' : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Register CTA */}
          <div className="auth-register-cta">
            <div className="auth-register-cta__text">
              <span className="auth-register-cta__icon" aria-hidden="true">🎓</span>
              <div>
                <p className="auth-register-cta__title">New to PrimaryMS?</p>
                <p className="auth-register-cta__sub">Create an account in seconds</p>
              </div>
            </div>
            <Link to="/register" className="auth-register-cta__btn" id="goto-register-btn">
              Register
            </Link>
          </div>

          <p className="auth-card__footer">
            © {new Date().getFullYear()} PrimaryMS · All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
