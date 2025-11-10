import React, { useEffect, useState } from 'react'

const API_URL = 'https://backend-server-11f5.onrender.com/api/auth/signup'
const DOWNLOAD_URL = 'https://juststock.in/assets/app/app-release.apk'

export default function App() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background watermark brand name */}
      <div aria-hidden className="pointer-events-none select-none fixed inset-0 flex items-center justify-center">
        <span className="text-primary/10 text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-wider uppercase">JustStock</span>
      </div>
      {/* Foreground gradient layer with content */}
      <div className="relative h-full flex items-center justify-center bg-gradient-to-b from-primary/10 to-white px-4">
        <div className="w-full max-w-md">
          <Header />
          <Signup />
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="text-center mb-4">
      <div className="flex flex-col items-center gap-1">
        <HeadingImage />
        <div className="inline-flex items-center gap-2">
          <span className="text-lg font-semibold text-primary">JustStock</span>
        </div>
      </div>
    </div>
  )
}

function HeadingImage() {
  const src = 'https://res.cloudinary.com/dspnn81nn/image/upload/v1762768335/EDU_JS_PNG_ijxbfm.png'
  return (
    <img
      src={src}
      alt="JustStock"
      className="mx-auto h-20 object-contain"
      loading="eager"
      decoding="async"
    />
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
  const [agree, setAgree] = useState(false)
  const [refLocked, setRefLocked] = useState(false)

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
        const reserved = new Set(['assets', 'assest'])
        if (
          trimmed &&
          !trimmed.includes('/') &&
          /^[A-Za-z0-9_-]{4,}$/i.test(trimmed) &&
          !reserved.has(trimmed.toLowerCase())
        ) {
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
      const locked = Boolean(queryCode || pathCode)

      if (code) {
        setForm((f) => ({ ...f, referralCode: f.referralCode || code }))
        localStorage.setItem('referralCode', code)
        if (locked) setRefLocked(true)
      }
    } catch {
      // ignore parsing errors
    }
  }, [])

  function onChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
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
      setError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Signup successful</h2>
        {user?.name && <p className="text-gray-600 mt-1">Welcome, {user.name}!</p>}
        <p className="text-gray-600 mt-1">You can now download the app.</p>
        <button
          onClick={() => { window.location.href = DOWNLOAD_URL }}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-white font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 active:bg-primary-dark"
        >
          Download App
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5">
      <div className="mb-3">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={onChange}
          className="mt-1 block w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-primary text-sm placeholder-gray-400 px-4 py-3"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={onChange}
          className="mt-1 block w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-primary text-sm placeholder-gray-400 px-4 py-3"
          placeholder="jane@example.com"
        />
      </div>

      <div className="mb-3">
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
          className="mt-1 block w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-primary text-sm placeholder-gray-400 px-4 py-3"
          placeholder="9876543210"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={onChange}
          className="mt-1 block w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-primary text-sm placeholder-gray-400 px-4 py-3"
          placeholder="StrongPass123!"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={onChange}
          className="mt-1 block w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-primary text-sm placeholder-gray-400 px-4 py-3"
          placeholder="StrongPass123!"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700">Referral code</label>
        <div className="relative">
          <input
            id="referralCode"
            name="referralCode"
            type="text"
            value={form.referralCode}
            onChange={onChange}
            readOnly={refLocked}
            aria-readonly={refLocked}
            className={
              "mt-1 block w-full h-12 rounded-lg border border-gray-300 focus:border-primary focus:ring-primary text-sm placeholder-gray-400 pr-10 px-4 py-3 " +
              (refLocked ? "bg-gray-50 text-gray-600 border-gray-200 cursor-not-allowed" : "")
            }
            placeholder="ABCD12"
          />
          {refLocked && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="pointer-events-none absolute right-2.5 top-3 h-5 w-5 text-gray-400"
            >
              <path d="M12 1.5a4.5 4.5 0 00-4.5 4.5v3H6.75A2.25 2.25 0 004.5 11.25v6A2.25 2.25 0 006.75 19.5h10.5a2.25 2.25 0 002.25-2.25v-6A2.25 2.25 0 0017.25 9H16.5V6A4.5 4.5 0 0012 1.5zm-3 7.5V6a3 3 0 116 0v3H9z" />
            </svg>
          )}
        </div>
        {refLocked && (
          <p className="text-[11px] text-gray-500 mt-1">Referral applied from invite link and cannot be changed.</p>
        )}
      </div>

      <div className="mb-3 flex items-start gap-2">
        <input
          id="agree"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          required
        />
        <label htmlFor="agree" className="text-xs text-gray-600">
          I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </label>
      </div>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 text-red-700 text-sm px-3 py-2 border border-red-100">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !agree}
        className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-white font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
      >
        {loading ? 'Signing up...' : 'Agree and continue'}
      </button>
    </form>
  )
}
