'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'

interface InviteInfo {
  email: string
  name: string | null
  role: string
  minPasswordLength: number
}

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  content_editor: 'Content Editor',
  author: 'Author',
  viewer: 'Viewer',
}

type Phase = 'checking' | 'ready' | 'submitting' | 'done' | 'rejected'

export default function AcceptInviteForm({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>('checking')
  const [info, setInfo] = useState<InviteInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loginUrl, setLoginUrl] = useState<string | null>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [reveal, setReveal] = useState(false)

  /* ── Validate the token before showing the form ── */
  useEffect(() => {
    if (!token) {
      setError('This link is missing its invitation token.')
      setPhase('rejected')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/invitations/accept?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (cancelled) return

        if (!res.ok) {
          setError(data.error || 'This invitation link is not valid.')
          setLoginUrl(data.loginUrl || null)
          setPhase('rejected')
          return
        }

        setInfo(data)
        // Prefill from the invitation, treating the first word as a given name.
        if (data.name) {
          const parts = String(data.name).trim().split(/\s+/)
          setFirstName(parts[0] || '')
          setLastName(parts.slice(1).join(' '))
        }
        setPhase('ready')
      } catch {
        if (!cancelled) {
          setError('Could not reach the server. Try again in a moment.')
          setPhase('rejected')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token])

  const minLength = info?.minPasswordLength ?? 8
  const tooShort = password.length > 0 && password.length < minLength
  const mismatch = confirm.length > 0 && password !== confirm
  const canSubmit =
    phase === 'ready' && password.length >= minLength && password === confirm

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return

      setPhase('submitting')
      setError(null)

      try {
        const res = await fetch('/api/invitations/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password, firstName, lastName }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Could not complete the invitation.')
          setLoginUrl(data.loginUrl || null)
          setPhase(res.status === 409 || res.status === 410 ? 'rejected' : 'ready')
          return
        }

        setLoginUrl(data.loginUrl || '/admin')
        setPhase('done')
      } catch {
        setError('Could not reach the server. Try again in a moment.')
        setPhase('ready')
      }
    },
    [canSubmit, token, password, firstName, lastName],
  )

  /* ── Shell ── */

  const card = 'w-full max-w-md rounded-2xl bg-white p-8 shadow-[0_18px_44px_-16px_rgba(16,24,40,0.28)] border border-black/5'
  const label = 'block text-sm font-medium mb-1.5'
  const input =
    'w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm transition focus:border-[var(--cms-primary,#04415f)]'

  if (phase === 'checking') {
    return (
      <div className={card}>
        <div className="flex items-center gap-3 text-sm opacity-70">
          <Loader2 size={18} className="animate-spin" />
          Checking your invitation…
        </div>
      </div>
    )
  }

  if (phase === 'rejected') {
    return (
      <div className={card}>
        <div
          className="grid place-items-center mb-4"
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(220,38,38,0.1)' }}
        >
          <AlertCircle size={20} color="#dc2626" />
        </div>
        <h1 className="text-lg font-bold mb-2">Invitation unavailable</h1>
        <p className="text-sm opacity-70 leading-relaxed">{error}</p>
        {loginUrl && (
          <a
            href={loginUrl}
            className="mt-5 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: 'var(--cms-primary, #04415f)' }}
          >
            Go to sign in
          </a>
        )}
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className={card}>
        <div
          className="grid place-items-center mb-4"
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(22,163,74,0.1)' }}
        >
          <CheckCircle2 size={20} color="#16a34a" />
        </div>
        <h1 className="text-lg font-bold mb-2">Your account is ready</h1>
        <p className="text-sm opacity-70 leading-relaxed">
          Sign in with <strong>{info?.email}</strong> and the password you just chose.
        </p>
        <a
          href={loginUrl || '/admin'}
          className="mt-5 inline-block rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'var(--cms-primary, #04415f)' }}
        >
          Sign in
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={card}>
      <h1 className="text-xl font-bold mb-1">Set up your account</h1>
      <p className="text-sm opacity-70 mb-6">
        {info?.email}
        {info?.role && (
          <>
            {' · '}
            <span className="font-medium">{ROLE_LABEL[info.role] || info.role}</span>
          </>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className={label} htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            className={input}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div>
          <label className={label} htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            className={input}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={label} htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={reveal ? 'text' : 'password'}
            className={`${input} pr-10`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={minLength}
            aria-describedby="password-hint"
          />
          <button
            type="button"
            onClick={() => setReveal(!reveal)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-80"
            aria-label={reveal ? 'Hide password' : 'Show password'}
          >
            {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p
          id="password-hint"
          className="mt-1.5 text-xs"
          style={{ color: tooShort ? '#dc2626' : undefined, opacity: tooShort ? 1 : 0.6 }}
        >
          At least {minLength} characters.
        </p>
      </div>

      <div className="mb-5">
        <label className={label} htmlFor="confirm">
          Confirm password
        </label>
        <input
          id="confirm"
          type={reveal ? 'text' : 'password'}
          className={input}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
          aria-describedby={mismatch ? 'confirm-error' : undefined}
        />
        {mismatch && (
          <p id="confirm-error" className="mt-1.5 text-xs" style={{ color: '#dc2626' }}>
            Passwords do not match.
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        // canSubmit already requires the 'ready' phase, so this covers submitting too.
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: 'var(--cms-primary, #04415f)' }}
      >
        {phase === 'submitting' && <Loader2 size={16} className="animate-spin" />}
        {phase === 'submitting' ? 'Creating your account…' : 'Create account'}
      </button>
    </form>
  )
}
