import { useState, useEffect } from 'react'

const SCOPES = ['https://www.googleapis.com/auth/admin.directory.user.readonly','https://www.googleapis.com/auth/admin.reports.audit.readonly'].join(' ')
const CHECKS = [
  { icon: '🔐', label: 'Two-Step Verification adoption rate' },
  { icon: '👑', label: 'Super admin count & login activity' },
  { icon: '💸', label: 'Inactive licensed users (license waste)' },
  { icon: '🚫', label: 'Accounts provisioned but never used' },
  { icon: '🔌', label: 'Third-party OAuth app access' },
  { icon: '🔒', label: 'Suspended accounts holding licenses' },
]

export default function ConnectScreen({ onConnect }) {
  const [gisReady, setGisReady] = useState(false)
  const [error, setError] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) { setGisReady(true); clearInterval(interval) }
    }, 200)
    return () => clearInterval(interval)
  }, [])

  function handleConnect() {
    setError(null)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) { setError('VITE_GOOGLE_CLIENT_ID is not set. See README for setup.'); return }
    if (!window.google?.accounts?.oauth2) { setError('Google Identity Services not loaded. Please refresh.'); return }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId, scope: SCOPES,
      callback: (response) => {
        if (response.error) { setError(`Authentication failed: ${response.error_description || response.error}`); return }
        onConnect(response.access_token)
      },
    })
    client.requestAccessToken()
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-accent-dim border border-accent/30 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4f9cf9" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <span className="font-mono text-sm text-text-secondary tracking-wider uppercase">GWS Health Audit</span>
        <span className="ml-auto font-mono text-xs text-text-muted">v1.0</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s ease-out' }}>
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 rounded-full bg-accent-dim border border-accent/20 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f9cf9" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-3 leading-tight">Google Workspace<br /><span className="text-accent">Health Audit</span></h1>
          <p className="text-text-secondary text-lg mb-2">Security posture report in under 60 seconds.</p>
          <p className="text-text-muted text-sm mb-10">No data is stored. All analysis runs in your browser.</p>
          <div className="bg-surface border border-border rounded-xl p-6 mb-8 text-left">
            <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">What we scan</p>
            <div className="grid grid-cols-1 gap-2">
              {CHECKS.map((check, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-text-secondary">
                  <span className="text-base">{check.icon}</span>
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          </div>
          {error && <div className="mb-4 px-4 py-3 bg-red-dim border border-red/30 rounded-lg text-red text-sm text-left">{error}</div>}
          <button onClick={handleConnect} disabled={!gisReady} className="w-full py-4 px-6 bg-accent hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-canvas font-semibold text-base rounded-xl transition-all duration-200 flex items-center justify-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {gisReady ? 'Connect Google Workspace' : 'Loading...'}
          </button>
          <p className="mt-4 text-xs text-text-muted">Requires a Google Workspace Super Admin account</p>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center">
        <p className="text-xs text-text-muted">Built by <a href="https://stevesitpro.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Steve's IT Pro</a> · Fixed-price Google Workspace consulting for SMBs</p>
      </footer>
    </div>
  )
}
