# ⚙️ Engineering Club Website

A members-only portal for university engineering clubs, design teams, and technical project organizations. Built with **Next.js 15 (App Router)** and **Supabase (PostgreSQL, Auth, Storage, RLS)**.

---

## 🌟 Key Features

- **🛡️ 3 Role Tiers (`member`, `officer`, `admin`):**
  - **Members:** Browse competitions, join subteams, submit funding requests with itemized line items, RSVP for workshops, log hours and engineering updates.
  - **Officers:** Unified review queue for atomic request approvals, manage competition seasons, workshop scheduling & attendance certification, funding spend vs budget ceiling tracking, and 3-tier external link directory curation.
  - **Admins:** Member role promotions/demotions, account deactivations, club branding, domain policy, and budget ceiling management.
- **⚡ Atomic Decision Stored Procedures:**
  - Approving a team request automatically creates the team, designates the lead, enrolls proposed members, auto-approves the requester's competition signup, sends in-app notifications, and records an audit log entry in a single Postgres transaction.
- **🔒 Postgres Security Boundary:**
  - Row Level Security (RLS) policies on all 19 tables.
  - Database triggers preventing role escalations, status forgery, and capping Tier 1 Primary links at a maximum of 4 active items.
  - 404 route cloaking for unauthorized roles (prevents leaking officer/admin surfaces).
- **📅 Workshop Calendar & Finance Exports:**
  - RFC 5545 `.ics` iCalendar subscription feed (`/api/ics/workshops`).
  - Itemized procurement CSV spend export (`/api/export/funding.csv`).
- **🔗 3-Tier Curated Links:** Visual hierarchy separating Tier 1 Primary cards (max 4), Tier 2 Secondary cards, and Tier 3 Collapsible resources.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5 (App Router, Server Actions, React 19)
- **Database & Auth:** Supabase (PostgreSQL 15, Row Level Security, Auth, Storage)
- **Validation:** Zod 3.25
- **Styling:** Tailwind CSS 3.4 + Lucide React Icons
- **Testing:** Vitest 3.2

---

## 🚀 Quick Start

### 1. Prerequisites & Dependencies
Ensure Node.js 18+ is installed.

```bash
npm install
```

### 2. Environment Configuration
The project is connected to the live Supabase project. Environment variables are pre-configured in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vanpniumrtgctqobfzmw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4WzLhRnDkfDsngU4fz76ww_u0w5z18i
DATABASE_URL=postgresql://postgres:BalladeOp38_Fmajor@db.vanpniumrtgctqobfzmw.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN=university.edu
```

### 3. Run Development Server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Building

```bash
# Run automated Vitest test suite (16 tests)
npm test

# Run Next.js production build & type check (26 routes)
npm run build
```

---

## 👥 Demo Personas

On the login page (`/login`) or using the **Persona Switcher** in the top navigation bar, you can instantly test the system under each role:

| Persona | Email | Role | Responsibilities |
| :--- | :--- | :--- | :--- |
| **Alex Vance** | `alex.vance@university.edu` | `admin` | Full club administrative governance, role promotion, budget ceiling adjustments. |
| **Maya Lin** | `maya.lin@university.edu` | `officer` | Unified review queue approvals, workshop scheduling & attendance, funding approvals, links management. |
| **Sam Rivera** | `sam.rivera@university.edu` | `member` (Lead) | Lead of *Apex E-Racing Powertrain*, team roster management, funding requests, work logs. |
| **Jordan Chen** | `jordan.chen@university.edu` | `member` | Workshop RSVPs, topic upvotes, competition signups. |
| **Taylor Kim** | `taylor.swift@university.edu` | `member` (Lead) | Lead of *Apex E-Racing Aero & Chassis*, CFD work logs, competition proposals. |

---

## 🗄️ Database Architecture (`supabase/`)

- `migrations/00001_initial_schema.sql`: 7 enums, 19 tables, indexes, and `pending_requests` view.
- `migrations/00002_rls_policies.sql`: Security definer functions and Row Level Security policies for all tables.
- `migrations/00003_triggers_and_functions.sql`: Triggers for role/status protection and atomic approval RPCs.
- `migrations/00004_storage_buckets.sql`: Storage bucket configuration and policies for procurement receipts.
- `seed.sql`: Realistic seed data with 5 student personas, competitions, teams, workshops, requests, and links.
