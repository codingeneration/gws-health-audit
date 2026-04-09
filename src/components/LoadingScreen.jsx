import { useEffect, useState } from 'react'

export default function LoadingScreen({ progress }) {
  const [dots, setDots] = useState('.')
  useEffect(() => {
    const interval = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 400)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    { key: 'users', label: 'Fetching user directory' },
    { key: 'analysis', label: 'Analyzing security settings' },
    { key: 'oauth', label: 'Scanning OAuth app access' },
    { key: 'report', label: 'Generating report' },
  ]

  return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center px-6">
      <div className="relative w-20 h-20 mb-10">
        <div className="absolute inset-0 rounded-2xl border border-accent/30 bg-accent-dim flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f9cf9" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </div>
        <div className="absolute left-1 right-1 top-0 h-0.5 bg-accent/50 rounded-full animate-scan" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-1">Auditing your Workspace</h2>
      <p className="text-text-muted text-sm mb-10">This takes about 15–30 seconds{dots}</p>
      <div className="w-full max-w-sm space-y-3">
        {steps.map((step) => {
          const prog = progress.find(p => p.step === step.key)
          const isDone = prog?.status === 'done'
          const isActive = prog?.status === 'loading'
          return (
            <div key={step.key} className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface border transition-all duration-300" style={{ borderColor: isDone ? '#34d399' : isActive ? '#4f9cf9' : '#1e2d45', opacity: !prog ? 0.4 : 1 }}>
              <div className="w-6 h-6 flex-shrink-0">
                {isDone && <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" className="w-5 h-5"><path d="m5 12 5 5L20 7" /></svg>}
                {isActive && <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" />}
                {!prog && <div className="w-5 h-5 rounded-full border border-border" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: isDone ? '#34d399' : isActive ? '#e8eef7' : '#445570' }}>{step.label}</p>
                {prog?.message && <p className="text-xs text-text-muted mt-0.5 truncate">{prog.message}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
