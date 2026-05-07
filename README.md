---
FILE: README.md
---
# GWS Health Audit

> Instant Google Workspace security posture report — runs entirely in the browser, no backend required.

Built by Steve's IT Pro.

---

## What It Does

GWS Health Audit connects to your Google Workspace via OAuth and runs six security checks in under 60 seconds:

| Check | What It Flags |
|---|---|
| 🔐 Two-Step Verification | Adoption rate across all active users |
| 👑 Super Admin Accounts | Count, last login, and stale admin detection |
| 💸 Inactive Licensed Users | Users not logged in for 90+ days (license waste) |
| 🚫 Never Logged In | Provisioned accounts never accessed |
| 🔌 Third-Party OAuth Apps | Apps authorized by users + risk level |
| 🔒 Suspended Accounts | Suspended users still holding licenses |

Results are scored A–F with plain-English explanations. No data is stored — everything runs in the visitor's browser session using their own admin credentials.

---

## Tech Stack

- React 18 + Vite + Tailwind CSS
- Google Identity Services (OAuth 2.0 token flow)
- Google Admin SDK: Directory API + Reports API
- Deployed to GitHub Pages via `gh-pages`

---

## Prerequisites

- A **Google Workspace** domain (any plan)
- A **Google Cloud Platform** account (free)
- **Node.js 18+** installed locally
- Access to a **Super Admin** account on the Workspace domain you want to audit

---

## Setup: Google Cloud Project

This is a one-time setup. Takes about 10–15 minutes.

### Step 1 — Create a GCP Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it `gws-health-audit`
4. Click **Create** and wait for it to provision

### Step 2 — Enable Required APIs

1. In the left sidebar → **APIs & Services** → **Library**
2. Search for **Admin SDK API** → click it → **Enable**

### Step 3 — Configure the OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose your **User Type**:
   - **Internal** — recommended if your GCP project is inside a Google Workspace org and you only want admins on your domain to use it
   - **External** — if you want clients on any Google account to use it (requires Google verification for sensitive scopes)
3. Fill in the required fields:
   - **App name:** `GWS Health Audit`
   - **User support email:** your email
   - **Developer contact:** your email
4. Click **Save and Continue**
5. On the **Scopes** screen, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/admin.directory.user.readonly`
   - `https://www.googleapis.com/auth/admin.reports.audit.readonly`
6. Click **Update** → **Save and Continue**
7. If using **External**, add your own email as a **Test User**. Add client emails here too before sharing with them.
8. Click **Save and Continue** → **Back to Dashboard**

> **Note on the unverified app warning:** Google will show an "unverified app" screen to users until you submit for verification. For client demos this is fine — users click **Advanced** → **Go to GWS Health Audit (unsafe)** to proceed. For production use, submit for verification via the OAuth consent screen dashboard.

### Step 4 — Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `GWS Health Audit Web Client`
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:5173` (local development)
   - `https://codingeneration.github.io` (GitHub Pages)
6. Leave **Authorized redirect URIs** empty
7. Click **Create**
8. **Copy your Client ID** — it looks like: `123456789-abc123.apps.googleusercontent.com`

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/codingeneration/gws-health-audit.git
cd gws-health-audit

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and paste your Client ID:
# VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

Sign in with a Super Admin account on the Workspace domain you want to audit.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

Live at: `https://codingeneration.github.io/gws-health-audit/`

> After deploying, confirm `https://codingeneration.github.io` is listed under Authorized JavaScript origins in your GCP credentials. Allow a few minutes for Google to propagate changes.

---

## Sharing With Clients

1. Add their email as a **Test User** in your OAuth consent screen
2. Share the GitHub Pages URL
3. They sign in with their Super Admin account
4. They use **Export PDF** to save the report
5. Use the findings as the basis for your remediation SOW via stevesitpro.com

---

## Project Structure

```
gws-health-audit/
├── src/
│   ├── App.jsx                 # Main state manager
│   ├── components/
│   │   ├── ConnectScreen.jsx   # Landing / OAuth flow
│   │   ├── LoadingScreen.jsx   # Animated progress
│   │   ├── Dashboard.jsx       # Results overview
│   │   └── AuditCard.jsx       # Individual check card
│   └── utils/
│       └── auditApi.js         # All Google API calls + analysis
├── .env.example
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## Roadmap (v2)

- [ ] Password policy enforcement check
- [ ] Drive external sharing policy status
- [ ] Historical score tracking
- [ ] Branded PDF report with client logo
- [ ] Stripe payment gate before showing results

---

## License

MIT — use it, fork it, sell reports with it.

---

Built with ☕ by Steve's IT Pro
