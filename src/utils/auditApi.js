const BASE_DIRECTORY = 'https://admin.googleapis.com/admin/directory/v1'
const BASE_REPORTS = 'https://admin.googleapis.com/admin/reports/v1'

async function gFetch(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

async function fetchAllUsers(token) {
  let users = [], pageToken = null
  do {
    const url = new URL(`${BASE_DIRECTORY}/users`)
    url.searchParams.set('customer', 'my_customer')
    url.searchParams.set('maxResults', '500')
    url.searchParams.set('projection', 'full')
    url.searchParams.set('orderBy', 'email')
    if (pageToken) url.searchParams.set('pageToken', pageToken)
    const data = await gFetch(url.toString(), token)
    users = users.concat(data.users || [])
    pageToken = data.nextPageToken || null
  } while (pageToken)
  return users
}

async function fetchOAuthActivity(token) {
  try {
    const url = new URL(`${BASE_REPORTS}/activity/users/all/applications/token`)
    url.searchParams.set('maxResults', '1000')
    const data = await gFetch(url.toString(), token)
    return data.items || []
  } catch { return [] }
}

function analyze2SV(users) {
  const active = users.filter(u => !u.suspended)
  const enrolled = active.filter(u => u.isEnrolledIn2Sv)
  const notEnrolled = active.filter(u => !u.isEnrolledIn2Sv)
  const pct = active.length ? Math.round((enrolled.length / active.length) * 100) : 0
  let status, score
  if (pct >= 90) { status = 'green'; score = 100 }
  else if (pct >= 70) { status = 'yellow'; score = 60 }
  else { status = 'red'; score = 20 }
  return {
    id: 'twoSV', label: 'Two-Step Verification', status, score,
    metric: `${pct}%`, metricLabel: 'enrolled',
    headline: `${enrolled.length} of ${active.length} active users have 2SV enabled`,
    detail: pct < 90 ? 'Low 2SV adoption is the single biggest account compromise risk. Each unenrolled user is a potential entry point for phishing attacks.' : 'Strong 2SV adoption. Your workspace has good baseline protection against credential theft.',
    data: { enrolled: enrolled.length, notEnrolled: notEnrolled.length, total: active.length, atRisk: notEnrolled.slice(0, 10).map(u => u.primaryEmail) },
  }
}

function analyzeSuperAdmins(users) {
  const admins = users.filter(u => u.isAdmin && !u.suspended)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const staleAdmins = admins.filter(u => !u.lastLoginTime || new Date(u.lastLoginTime) < ninetyDaysAgo)
  let status, score
  if (admins.length >= 2 && admins.length <= 3 && staleAdmins.length === 0) { status = 'green'; score = 100 }
  else if (admins.length === 1 || (admins.length >= 4 && admins.length <= 5) || staleAdmins.length > 0) { status = 'yellow'; score = 60 }
  else { status = 'red'; score = 20 }
  return {
    id: 'superAdmins', label: 'Super Admin Accounts', status, score,
    metric: admins.length.toString(), metricLabel: 'super admins',
    headline: `${admins.length} super admin account${admins.length !== 1 ? 's' : ''} detected${staleAdmins.length ? ` (${staleAdmins.length} inactive 90+ days)` : ''}`,
    detail: admins.length <= 1 ? 'Only 1 super admin is a single point of failure. Best practice is 2–3 admins.' : admins.length > 5 ? 'Too many super admins increases your attack surface. Aim for 2–3.' : staleAdmins.length > 0 ? 'Some super admin accounts have not logged in for 90+ days and should be reviewed.' : 'Admin count is within best practice range.',
    data: { admins: admins.map(u => ({ email: u.primaryEmail, lastLogin: u.lastLoginTime ? new Date(u.lastLoginTime).toLocaleDateString() : 'Never', stale: staleAdmins.some(s => s.primaryEmail === u.primaryEmail) })) },
  }
}

function analyzeInactiveUsers(users) {
  const active = users.filter(u => !u.suspended)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const inactive = active.filter(u => u.agreedToTerms && u.lastLoginTime && new Date(u.lastLoginTime) < ninetyDaysAgo)
  const pct = active.length ? Math.round((inactive.length / active.length) * 100) : 0
  let status, score
  if (inactive.length === 0) { status = 'green'; score = 100 }
  else if (pct <= 5) { status = 'yellow'; score = 65 }
  else { status = 'red'; score = 25 }
  return {
    id: 'inactiveUsers', label: 'Inactive Licensed Users', status, score,
    metric: inactive.length.toString(), metricLabel: '90+ day inactive',
    headline: `${inactive.length} active license${inactive.length !== 1 ? 's' : ''} unused for 90+ days`,
    detail: inactive.length === 0 ? 'No license waste detected. All users have logged in within 90 days.' : `These licenses may represent departed employees. At typical SMB pricing, this could be $${inactive.length * 12}–$${inactive.length * 18}/month in waste.`,
    data: { count: inactive.length, users: inactive.slice(0, 10).map(u => ({ email: u.primaryEmail, lastLogin: new Date(u.lastLoginTime).toLocaleDateString() })) },
  }
}

function analyzeNeverLoggedIn(users) {
  const active = users.filter(u => !u.suspended)
  const neverIn = active.filter(u => !u.agreedToTerms)
  let status, score
  if (neverIn.length === 0) { status = 'green'; score = 100 }
  else if (neverIn.length <= 3) { status = 'yellow'; score = 70 }
  else { status = 'red'; score = 30 }
  return {
    id: 'neverLoggedIn', label: 'Provisioned But Never Used', status, score,
    metric: neverIn.length.toString(), metricLabel: 'never logged in',
    headline: `${neverIn.length} account${neverIn.length !== 1 ? 's' : ''} provisioned but never accessed`,
    detail: neverIn.length === 0 ? 'All provisioned accounts have been accessed at least once.' : 'These accounts were created but never activated. They represent immediate license cost with zero value.',
    data: { users: neverIn.slice(0, 10).map(u => u.primaryEmail) },
  }
}

function analyzeSuspendedUsers(users) {
  const suspended = users.filter(u => u.suspended)
  let status, score
  if (suspended.length === 0) { status = 'green'; score = 100 }
  else if (suspended.length <= 3) { status = 'yellow'; score = 75 }
  else { status = 'red'; score = 40 }
  return {
    id: 'suspendedUsers', label: 'Suspended Accounts', status, score,
    metric: suspended.length.toString(), metricLabel: 'suspended',
    headline: `${suspended.length} suspended account${suspended.length !== 1 ? 's' : ''} still occupying licenses`,
    detail: suspended.length === 0 ? 'No suspended users holding licenses. Clean account lifecycle management.' : 'Suspended users still count toward your license total. Deleting them reclaims those licenses.',
    data: { users: suspended.slice(0, 10).map(u => u.primaryEmail) },
  }
}

function analyzeOAuthApps(activityItems) {
  const appMap = new Map()
  for (const item of activityItems) {
    for (const event of (item.events || [])) {
      const appParam = event.parameters?.find(p => p.name === 'app_name')
      const scopeParam = event.parameters?.find(p => p.name === 'scope')
      if (appParam?.value) {
        if (!appMap.has(appParam.value)) appMap.set(appParam.value, { name: appParam.value, scopes: new Set(), userCount: 0 })
        const entry = appMap.get(appParam.value)
        entry.userCount++
        if (scopeParam?.value) scopeParam.value.split(' ').forEach(s => entry.scopes.add(s))
      }
    }
  }
  const apps = [...appMap.values()].map(a => ({ name: a.name, userCount: a.userCount, scopeCount: a.scopes.size, hasSensitiveScopes: [...a.scopes].some(s => s.includes('gmail') || s.includes('drive') || s.includes('admin') || s.includes('contacts')) }))
  const highRisk = apps.filter(a => a.hasSensitiveScopes)
  let status, score
  if (apps.length === 0) { status = 'green'; score = 100 }
  else if (highRisk.length === 0 && apps.length <= 10) { status = 'yellow'; score = 75 }
  else { status = 'red'; score = 35 }
  return {
    id: 'oauthApps', label: 'Third-Party OAuth Access', status, score,
    metric: apps.length.toString(), metricLabel: `app${apps.length !== 1 ? 's' : ''} authorized`,
    headline: activityItems.length === 0 ? 'Reports API not enabled — check manually in Admin Console' : `${apps.length} third-party app${apps.length !== 1 ? 's' : ''} with OAuth access (${highRisk.length} high-risk)`,
    detail: activityItems.length === 0 ? 'Enable the Reports API in GCP to scan for third-party OAuth access automatically.' : highRisk.length > 0 ? `${highRisk.length} apps have access to sensitive data like Gmail or Drive.` : 'No high-risk OAuth scopes detected. Periodically review and revoke unused apps.',
    data: { apps: apps.slice(0, 10), highRisk, apiEnabled: activityItems.length > 0 },
  }
}

function calculateOverall(checks) {
  const weights = { twoSV: 0.35, superAdmins: 0.25, inactiveUsers: 0.12, neverLoggedIn: 0.08, suspendedUsers: 0.08, oauthApps: 0.12 }
  let total = 0
  for (const [id, weight] of Object.entries(weights)) {
    const check = checks.find(c => c.id === id)
    if (check) total += check.score * weight
  }
  const score = Math.round(total)
  let grade, gradeColor
  if (score >= 90) { grade = 'A'; gradeColor = 'green' }
  else if (score >= 80) { grade = 'B'; gradeColor = 'green' }
  else if (score >= 70) { grade = 'C'; gradeColor = 'yellow' }
  else if (score >= 60) { grade = 'D'; gradeColor = 'yellow' }
  else { grade = 'F'; gradeColor = 'red' }
  return { score, grade, gradeColor }
}

export async function runAudit(token, onProgress) {
  onProgress({ step: 'users', status: 'loading', message: 'Fetching user directory...' })
  const users = await fetchAllUsers(token)
  const domain = users[0]?.primaryEmail?.split('@')[1] || 'your domain'
  onProgress({ step: 'users', status: 'done', message: `User directory loaded (${users.length} accounts)` })

  onProgress({ step: 'analysis', status: 'loading', message: 'Analyzing security settings...' })
  const checks = [analyze2SV(users), analyzeSuperAdmins(users), analyzeInactiveUsers(users), analyzeNeverLoggedIn(users), analyzeSuspendedUsers(users)]
  onProgress({ step: 'analysis', status: 'done', message: 'Security analysis complete' })

  onProgress({ step: 'oauth', status: 'loading', message: 'Scanning OAuth app access...' })
  const oauthActivity = await fetchOAuthActivity(token)
  checks.push(analyzeOAuthApps(oauthActivity))
  onProgress({ step: 'oauth', status: 'done', message: 'OAuth scan complete' })

  onProgress({ step: 'report', status: 'loading', message: 'Generating report...' })
  const overall = calculateOverall(checks)
  onProgress({ step: 'report', status: 'done', message: 'Report ready' })

  return { domain, totalUsers: users.length, auditedAt: new Date().toISOString(), overall, checks }
}
