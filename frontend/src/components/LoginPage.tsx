import { useState } from 'react'
import { api } from '../api'

interface Props {
  onLogin: (username: string) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.auth.login(username, password)
      onLogin(result.username)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #032147 0%, #0a1628 100%)',
    }}>
      <div style={{
        width: 360,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: '40px 36px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            <div style={{ width: 4, height: 20, background: '#ecad0a', borderRadius: 2 }} />
            <div style={{ width: 4, height: 14, background: '#209dd7', borderRadius: 2, alignSelf: 'flex-end' }} />
            <div style={{ width: 4, height: 24, background: '#753991', borderRadius: 2 }} />
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: 18,
            color: '#ffffff',
            letterSpacing: '-0.3px',
          }}>
            Project Board
          </span>
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: 22,
          color: '#ffffff',
          marginBottom: 8,
          letterSpacing: '-0.4px',
        }}>
          Sign in
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
          Use <strong style={{ color: 'rgba(255,255,255,0.6)' }}>user</strong> / <strong style={{ color: 'rgba(255,255,255,0.6)' }}>password</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(32,157,215,0.6)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                color: '#ffffff',
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(32,157,215,0.6)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '11px',
              background: loading ? 'rgba(117,57,145,0.5)' : '#753991',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
