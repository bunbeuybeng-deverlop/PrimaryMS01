import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import './Login.css'    /* shared auth-* styles */
import './Register.css'

const ROLES = [
  { value: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
  { value: 'parent',  label: 'Parent',  icon: '👨‍👩‍👧' },
  { value: 'admin',   label: 'Admin',   icon: '🛡️'  },
]

function getPasswordStrength(pw) {
  let score = 0
  if (pw.length >= 8)           score++
  if (/[A-Z]/.test(pw))         score++
  if (/[0-9]/.test(pw))         score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#06b6d4', '#10b981']
  return { score, label: labels[score] || '', color: colors[score] || '' }
}

export default function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()

  const [form, setForm] = useState({
    username:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    role:            'teacher',
  })
  const [error, setError]             = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading]         = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess]         = useState(false)

  const strength = getPasswordStrength(form.password)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (error) setError('')
  }

  const validate = () => {
    const errs = {}
    if (!form.username.trim())
      errs.username = 'Username is required.'
    else if (form.username.length < 3)
      errs.username = 'At least 3 characters.'

    if (!form.email.trim())
      errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email.'

    if (!form.password)
      errs.password = 'Password is required.'
    else if (form.password.length < 6)
      errs.password = 'At least 6 characters.'

    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.'

    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setError('')
    setLoading(true)
    try {
      await register({
        username: form.username.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
      })
      setSuccess(true)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left Branding Panel ── */}
      <div className="auth-panel">
        <div className="auth-panel__orb auth-panel__orb--1" />
        <div className="auth-panel__orb auth-panel__orb--2" />
        <div className="auth-panel__orb auth-panel__orb--3" />
        <div className="auth-panel__shapes">
          <div className="auth-panel__shape auth-panel__shape--1" />
          <div className="auth-panel__shape auth-panel__shape--2" />
          <div className="auth-panel__shape auth-panel__shape--3" />
        </div>

        <div className="auth-panel__illustration" aria-hidden="true">🏫</div>

        <div className="auth-panel__content">
          <h1 className="auth-panel__logo-title">
            <span className="auth-panel__logo-primary">Primary</span>
            <span className="auth-panel__logo-accent">MS</span>
          </h1>
          <p className="auth-panel__tagline">School Management System</p>

          <div className="auth-panel__features">
            <div className="auth-panel__feature">
              <span className="auth-panel__feature-icon">🚀</span>
              <div className="auth-panel__feature-text">
                <strong>Get Started Instantly</strong>
                Create your account in under a minute
              </div>
            </div>
            <div className="auth-panel__feature">
              <span className="auth-panel__feature-icon">🎭</span>
              <div className="auth-panel__feature-text">
                <strong>Choose Your Role</strong>
                Admin, Teacher, or Parent — each with a tailored portal
              </div>
            </div>
            <div className="auth-panel__feature">
              <span className="auth-panel__feature-icon">🔒</span>
              <div className="auth-panel__feature-text">
                <strong>Secure by Default</strong>
                JWT-protected with bcrypt password hashing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">

          {/* Mobile brand */}
          <div className="auth-card__mobile-brand">
            <span className="auth-card__mobile-logo" aria-hidden="true">🏫</span>
            <div className="auth-card__mobile-title">PrimaryMS</div>
          </div>

          {success ? (
            /* ── Success ── */
            <div className="auth-success">
              <div className="auth-success__icon">🎉</div>
              <div className="auth-success__title">Account Created!</div>
              <p className="auth-success__body">
                Welcome, <strong>{form.username}</strong>!<br />
                Your account has been created successfully.
              </p>
              <Link to={`/${form.role}`} className="auth-success__link-btn">
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="auth-card__header">
                <h2 className="auth-card__greeting">Create an account ✨</h2>
                <p className="auth-card__hint">
                  Already have an account?{' '}
                  <Link to="/login">Sign in</Link>
                </p>
              </div>

              <form className="auth-form" onSubmit={handleSubmit} noValidate>

                {error && (
                  <div className="auth-form__error" role="alert">
                    <span className="auth-form__error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                {/* ── Role Selector ── */}
                <div className="auth-field">
                  <label className="auth-field__label">Select Role</label>
                  <div className="auth-role-selector">
                    {ROLES.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        id={`role-btn-${value}`}
                        className={`auth-role-btn${form.role === value ? ' active' : ''}`}
                        onClick={() => setForm(prev => ({ ...prev, role: value }))}
                      >
                        <span className="auth-role-btn__icon">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="auth-divider">Account Details</div>

                {/* ── Username + Email ── */}
                <div className="auth-form__row">
                  {/* Username */}
                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="reg-username">Username</label>
                    <div className="auth-field__input-wrap">
                      <span className="auth-field__icon" aria-hidden="true">👤</span>
                      <input
                        id="reg-username"
                        className={`auth-field__input${fieldErrors.username ? ' input--error' : ''}`}
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="johndoe"
                        autoComplete="username"
                        autoFocus
                        required
                        minLength={3}
                      />
                    </div>
                    {fieldErrors.username && (
                      <span className="auth-field__err">{fieldErrors.username}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="auth-field">
                    <label className="auth-field__label" htmlFor="reg-email">Email</label>
                    <div className="auth-field__input-wrap">
                      <span className="auth-field__icon" aria-hidden="true">📧</span>
                      <input
                        id="reg-email"
                        className={`auth-field__input${fieldErrors.email ? ' input--error' : ''}`}
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@school.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <span className="auth-field__err">{fieldErrors.email}</span>
                    )}
                  </div>
                </div>

                {/* ── Password ── */}
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="reg-password">Password</label>
                  <div className="auth-field__input-wrap">
                    <span className="auth-field__icon" aria-hidden="true">🔑</span>
                    <input
                      id="reg-password"
                      className={`auth-field__input${fieldErrors.password ? ' input--error' : ''}`}
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="auth-field__toggle"
                      onClick={() => setShowPass(p => !p)}
                      aria-label={showPass ? 'Hide password' : 'Show password'}
                    >
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span className="auth-field__err">{fieldErrors.password}</span>
                  )}
                  {form.password && (
                    <div className="auth-strength">
                      <div className="auth-strength__bar">
                        <div
                          className="auth-strength__fill"
                          style={{ width: `${(strength.score / 4) * 100}%`, background: strength.color }}
                        />
                      </div>
                      <div className="auth-strength__label" style={{ color: strength.color }}>
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Confirm Password ── */}
                <div className="auth-field">
                  <label className="auth-field__label" htmlFor="reg-confirm">Confirm Password</label>
                  <div className="auth-field__input-wrap">
                    <span className="auth-field__icon" aria-hidden="true">✅</span>
                    <input
                      id="reg-confirm"
                      className={`auth-field__input${fieldErrors.confirmPassword ? ' input--error' : ''}`}
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="auth-field__toggle"
                      onClick={() => setShowConfirm(p => !p)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span className="auth-field__err">{fieldErrors.confirmPassword}</span>
                  )}
                </div>

                {/* ── Submit ── */}
                <button
                  id="register-submit-btn"
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  <span className="auth-submit-btn__inner">
                    {loading && <span className="auth-spinner" />}
                    {loading ? 'Creating account…' : 'Create Account'}
                  </span>
                </button>

                <p className="auth-terms">
                  By registering you agree to the{' '}
                  <a href="#">Terms of Service</a> and{' '}
                  <a href="#">Privacy Policy</a>.
                </p>
              </form>
            </>
          )}

          <p className="auth-card__footer">
            © {new Date().getFullYear()} PrimaryMS · All rights reserved
          </p>
        </div>
      </div>
    </div>
  )
}
