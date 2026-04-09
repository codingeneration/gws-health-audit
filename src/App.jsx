import { useState, useCallback } from 'react'
import ConnectScreen from './components/ConnectScreen'
import LoadingScreen from './components/LoadingScreen'
import Dashboard from './components/Dashboard'
import { runAudit } from './utils/auditApi'

export default function App() {
  const [stage, setStage] = useState('connect')
  const [auditData, setAuditData] = useState(null)
  const [progress, setProgress] = useState([])
  const [error, setError] = useState(null)

  const handleConnect = useCallback(async (token) => {
    setStage('loading')
    setProgress([])
    setError(null)
    try {
      const results = await runAudit(token, (step) => {
        setProgress(prev => {
          const existing = prev.findIndex(p => p.step === step.step)
          if (existing >= 0) {
            const next = [...prev]
            next[existing] = step
            return next
          }
          return [...prev, step]
        })
      })
      setAuditData(results)
      setStage('dashboard')
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
      setStage('error')
    }
  }, [])

  const handleReset = useCallback(() => {
    setStage('connect')
    setAuditData(null)
    setProgress([])
    setError(null)
  }, [])

  if (stage === 'connect') return <ConnectScreen onConnect={handleConnect} />
  if (stage === 'loading') return <LoadingScreen progress={progress} />
  if (stage === 'dashboard') return <Dashboard audit={auditData} onReset={handleReset} />

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-dim border border-red/20 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.8">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">Audit Failed</h2>
        <p className="text-text-secondary text-sm mb-6">{error}</p>
        <div className="bg-surface border border-border rounded-lg p-4 text-left mb-6">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Common fixes</p>
          <ul className="text-sm text-text-secondary space-y-1.5">
            <li>· Sign in with a Super Admin account</li>
            <li>· Verify the Admin SDK API is enabled in GCP</li>
            <li>· Check VITE_GOOGLE_CLIENT_ID is set in .env</li>
            <li>· Confirm your domain is in authorized origins</li>
          </ul>
        </div>
        <button onClick={handleReset} className="px-6 py-2.5 bg-accent hover:bg-blue-400 text-canvas font-semibold text-sm rounded-lg transition-colors">
          Try Again
        </button>
      </div>
    </div>
  )
}
