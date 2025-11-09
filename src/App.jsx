import React, { useEffect, useState } from 'react'

const API_URL = 'https://backend-server-11f5.onrender.com/api/auth/signup'
const DOWNLOAD_URL = 'https://juststock.in/assets/app/app-release.apk'

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Header />
        <Signup />
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-semibold text-primary">JustStock</h1>
      <p className="text-sm text-gray-600">Create your account to continue</p>
    </div>
  )
}

function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    referralCode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [user, setUser] = useState(null)

  // Autofill referral code from URL path/query/hash or localStorage
  useEffect(() => {
    try {
      const path = window.location.pathname || ''
      // Pattern 1: /d/<code> or /ref/<code> or /invite/<code>
      const m = path.match(/\/(d|ref|invite)\/([A-Za-z0-9_-]+)/i)
      let pathCode = m && m[2] ? m[2] : null
      // Pattern 2: single root segment that looks like a code => /<code>
      if (!pathCode) {
        const trimmed = path.replace(/^\/+|\/+$/g, '')
        const reserved = new Set(['assets'])
        if (trimmed && !trimmed.includes('/') && /^[A-Za-z0-9_-]{4,}$/i.test(trimmed) && !reserved.has(trimmed.toLowerCase())) {
          pathCode = trimmed
        }
      }

      const qs = new URLSearchParams(window.location.search || '')
      const hashQs = new URLSearchParams((window.location.hash || '').replace(/^#/, ''))

      const queryCode =
        qs.get('ref') ||
        qs.get('r') ||
        qs.get('referral') ||
        qs.get('referralCode') ||
        hashQs.get('ref') ||
        hashQs.get('r') ||
        hashQs.get('referral') ||
        hashQs.get('referralCode')

      const stored = localStorage.getItem('referralCode')
      const code = queryCode || pathCode || stored || ''

      if (code) {
        setForm((f) => ({ ...f, referralCode: f.referralCode || code }))
        localStorage.setItem('referralCode', code)
      }
    } catch {
      // ignore parsing errors
    }
  }, [])

  function onChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.mobile) {
      setError('Please fill all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          mobile: form.mobile,
          referralCode: form.referralCode || undefined,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.message || data?.error || `Signup failed (${res.status})`
        throw new Error(msg)
      }

      // Persist tokens for subsequent authenticated requests
      if (data?.token) localStorage.setItem('token', data.token)
      if (data?.tokenExpiresAt) localStorage.setItem('tokenExpiresAt', String(data.tokenExpiresAt))
      if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
      if (data?.refreshTokenExpiresAt) localStorage.setItem('refreshTokenExpiresAt', String(data.refreshTokenExpiresAt))
      if (data?.user) localStorage.setItem('user', JSON.stringify(data.user))

      setUser(data?.user || null)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Signup successful</h2>
          {user?.name && (
            <p className="text-gray-600 mt-1">Welcome, {user.name}!</p>
          )}
          <p className="text-gray-600 mt-1">You can now download the app.</p>

          <button
            onClick={() => { window.location.href = DOWNLOAD_URL }}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 active:bg-primary-dark"
          >
            Download App
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="mb-5">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={onChange}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-sm"
          placeholder="Jane Doe"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-sm"
          placeholder="jane@example.com"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile</label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]{10}"
          required
          value={form.mobile}
          onChange={onChange}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-sm"
          placeholder="9876543210"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={onChange}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-sm"
          placeholder="StrongPass123!"
        />
      </div>

      <div className="mb-5">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={onChange}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-sm"
          placeholder="StrongPass123!"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">Referral code (optional)</label>
        <input
          id="referralCode"
          name="referralCode"
          type="text"
          value={form.referralCode}
          onChange={onChange}
          className="mt-1 block w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-sm"
          placeholder="ABCD12"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
      >
        {loading ? 'Signing up...' : 'Create account'}
      </button>

      <p className="text-[11px] text-gray-500 mt-3">
        By creating an account you agree to the Terms of Service and Privacy Policy.
      </p>
    </form>
  )
}
