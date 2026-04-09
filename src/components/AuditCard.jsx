import { useState } from 'react'

const STATUS_CONFIG = {
  green: { border: 'border-green/20', badge: 'bg-green/10 text-green border border-green/20', dot: 'bg-green', label: 'PASS', iconColor: '#34d399' },
  yellow: { border: 'border-yellow/20', badge: 'bg-yellow/10 text-yellow border border-yellow/20', dot: 'bg-yellow', label: 'REVIEW', iconColor: '#fbbf24' },
  red: { border: 'border-red/20', badge: 'bg-red/10 text-red border border-red/20', dot: 'bg-red', label: 'ACTION', iconColor: '#f87171' },
}

export default function AuditCard({ check, index }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[check.status]

  return (
    <div className={`rounded-xl border bg-surface transition-all duration-200 cursor-pointer hover:border-border-bright card-enter ${cfg.border}`} style={{ animationDelay: `${index * 0.08}s` }} onClick={() => setExpanded(e => !e)}>
      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border" style={{ color: cfg.iconColor, borderColor: cfg.iconColor + '33', backgroundColor: cfg.iconColor + '11' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {check.id === 'twoSV' && <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
            {check.id === 'superAdmins' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
            {check.id === 'inactiveUsers' && <><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4"/><line x1="17" y1="17" x2="22" y2="22"/><line x1="22" y1="17" x2="17" y2="22"/></>}
            {check.id === 'neverLoggedIn' && <><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></>}
            {check.id === 'suspendedUsers' && <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>}
            {check.id === 'oauthApps' && <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-semibold text-text-primary">{check.label}</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold tracking-wider ${cfg.badge}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-text-secondary leading-snug">{check.headline}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="font-mono text-2xl font-bold" style={{ color: cfg.iconColor }}>{check.metric}</div>
          <div className="text-xs text-text-muted whitespace-nowrap">{check.metricLabel}</div>
        </div>
      </div>
      <div className="px-5 pb-4 flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        <span className="text-xs text-text-muted flex-1">{expanded ? 'Hide details' : 'Show details & recommendations'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#445570" strokeWidth="2" className="transition-transform duration-200" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path d="m6 9 6 6 6-6"/></svg>
      </div>
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">{check.detail}</p>
          {check.id === 'twoSV' && check.data.atRisk.length > 0 && (
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Users not enrolled (up to 10)</p>
              <div className="space-y-1">{check.data.atRisk.map(email => <div key={email} className="font-mono text-xs text-red bg-red-dim px-3 py-1.5 rounded-lg">{email}</div>)}</div>
            </div>
          )}
          {check.id === 'superAdmins' && check.data.admins.length > 0 && (
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Super admin accounts</p>
              <div className="space-y-1">{check.data.admins.map(admin => <div key={admin.email} className="flex items-center justify-between font-mono text-xs px-3 py-1.5 rounded-lg bg-elevated"><span className="text-text-secondary">{admin.email}</span><span className={admin.stale ? 'text-yellow' : 'text-text-muted'}>Last: {admin.lastLogin}</span></div>)}</div>
            </div>
          )}
          {check.id === 'inactiveUsers' && check.data.users?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Inactive accounts (up to 10)</p>
              <div className="space-y-1">{check.data.users.map(u => <div key={u.email} className="flex items-center justify-between font-mono text-xs px-3 py-1.5 rounded-lg bg-elevated"><span className="text-text-secondary">{u.email}</span><span className="text-yellow">Last: {u.lastLogin}</span></div>)}</div>
            </div>
          )}
          {check.id === 'neverLoggedIn' && check.data.users?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Never accessed</p>
              <div className="space-y-1">{check.data.users.map(email => <div key={email} className="font-mono text-xs text-yellow bg-yellow-dim px-3 py-1.5 rounded-lg">{email}</div>)}</div>
            </div>
          )}
          {check.id === 'suspendedUsers' && check.data.users?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Suspended accounts</p>
              <div className="space-y-1">{check.data.users.map(email => <div key={email} className="font-mono text-xs text-text-muted bg-elevated px-3 py-1.5 rounded-lg line-through">{email}</div>)}</div>
            </div>
          )}
          {check.id === 'oauthApps' && check.data.apps?.length > 0 && (
            <div>
              <p className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Authorized apps</p>
              <div className="space-y-1">{check.data.apps.map(app => <div key={app.name} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-elevated"><span className="text-text-secondary font-medium truncate mr-4">{app.name}</span><div className="flex items-center gap-2 flex-shrink-0"><span className="text-text-muted">{app.scopeCount} scope{app.scopeCount !== 1 ? 's' : ''}</span>{app.hasSensitiveScopes && <span className="text-[10px] px-1.5 py-0.5 bg-red/10 text-red border border-red/20 rounded font-mono">HIGH RISK</span>}</div></div>)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
