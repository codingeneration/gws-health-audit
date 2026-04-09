import { useEffect, useState } from 'react'
import AuditCard from './AuditCard'

const GRADE_COLORS = {
  green: { stroke: '#34d399', text: 'text-green' },
  yellow: { stroke: '#fbbf24', text: 'text-yellow' },
  red: { stroke: '#f87171', text: 'text-red' },
}

export default function Dashboard({ audit, onReset }) {
  const [ringOffset, setRingOffset] = useState(251.2)
  const [visible, setVisible] = useState(false)
  const circumference = 251.2
  const gradeColor = GRADE_COLORS[audit.overall.gradeColor]
  const actionItems = audit.checks.filter(c => c.status === 'red')
  const reviewItems = audit.checks.filter(c => c.status === 'yellow')
  const auditDate = new Date(audit.auditedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  useEffect(() => {
    setTimeout(() => {
      setRingOffset(circumference - (audit.overall.score / 100) * circumference)
      setVisible(true)
    }, 100)
  }, [audit.overall.score])

  return (
    <div className="min-h-screen grid-bg">
      <header className="border-b border-border bg-surface/50 backdrop-blur px-6 py-4 flex items-center gap-4 no-print sticky top-0 z-10">
        <button onClick={onReset} className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M5 12l7 7M5 12l7-7"/></svg>
          New Audit
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green animate-pulse" />
            <span className="font-mono text-sm text-text-secondary truncate">{audit.domain}</span>
          </div>
          <p className="text-xs text-text-muted">{audit.totalUsers} users · Audited {auditDate}</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-border hover:border-border-bright rounded-lg text-sm text-text-secondary hover:text-text-primary transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Export PDF
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 flex gap-6 items-center" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s ease-out' }}>
          <div className="relative flex-shrink-0 w-28 h-28">
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="40" fill="none" stroke="#1e2d45" strokeWidth="8"/>
              <circle cx="56" cy="56" r="40" fill="none" stroke={gradeColor.stroke} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={ringOffset} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)' }}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-mono text-3xl font-bold ${gradeColor.text}`}>{audit.overall.grade}</span>
              <span className="text-xs text-text-muted">{audit.overall.score}/100</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary mb-1">{audit.overall.gradeColor === 'green' ? 'Low Risk' : audit.overall.gradeColor === 'yellow' ? 'Moderate Risk' : 'High Risk'}</h1>
            <p className="text-text-secondary text-sm mb-4">{audit.overall.gradeColor === 'green' ? 'Your workspace security is in good shape.' : audit.overall.gradeColor === 'yellow' ? 'Some issues need attention before they become problems.' : 'Critical security gaps require immediate attention.'}</p>
            <div className="flex gap-4 flex-wrap">
              {actionItems.length > 0 && <div className="flex items-center gap-2 text-sm"><div className="w-2 h-2 rounded-full bg-red"/><span className="text-red font-medium">{actionItems.length} action required</span></div>}
              {reviewItems.length > 0 && <div className="flex items-center gap-2 text-sm"><div className="w-2 h-2 rounded-full bg-yellow"/><span className="text-yellow font-medium">{reviewItems.length} needs review</span></div>}
              {actionItems.length === 0 && reviewItems.length === 0 && <div className="flex items-center gap-2 text-sm"><div className="w-2 h-2 rounded-full bg-green"/><span className="text-green font-medium">All checks passed</span></div>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-4">Security Checks</h2>
          {audit.checks.map((check, i) => <AuditCard key={check.id} check={check} index={i} />)}
        </div>

        <div className="mt-8 rounded-xl border border-accent/20 bg-accent-dim p-6 text-center">
          <h3 className="font-semibold text-text-primary mb-1">Want these issues fixed?</h3>
          <p className="text-sm text-text-secondary mb-4">Steve's IT Pro offers fixed-price Google Workspace remediation for SMBs. One flat fee to resolve every finding in this report.</p>
          <a href="https://stevesitpro.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-blue-400 text-canvas font-semibold text-sm rounded-lg transition-colors">
            Get a Free Quote
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </main>
    </div>
  )
}
