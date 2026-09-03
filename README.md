<p align="center">
  <img
    src="./assets/7icons-admin-banner.png"
    alt="7ICONS Admin Dashboard"
    width="100%"
  />
</p>

<h1 align="center">7ICONS Admin</h1>

<p align="center">
  <strong>Administrative Dashboard for the 7ICONS & ICONIA Digital Platform</strong>
</p>

<p align="center">
  Internal management application for content, members, schedules,
  fan representatives, users, comments, media, and platform administration.
</p>

<p align="center">
  <strong>BUILD FOR ICONIA BY ICONIA</strong>
</p>

---

# 💜 About

**7ICONS Admin** is the internal administration dashboard for the
7ICONS & ICONIA digital ecosystem.

The application provides a centralized interface for managing content
and platform data that will eventually be displayed on the public
7ICONS website.

The Admin Panel is maintained as a separate application from the
public website.

```text
7ICONS Digital Ecosystem
│
├── 7icons-web
│   └── Public Website
│
└── 7icons-admin
    └── Administration Dashboard
```

Both applications are designed to connect to the same backend
infrastructure.

---

# 🌐 Live Deployment

The Admin Panel is deployed independently through Vercel.

```text
https://7icons-admin.vercel.app
```

Public website:

```text
https://7icons-web.vercel.app
```

---

# 🎯 Purpose

The main purpose of `7icons-admin` is to remove the need to manually
edit source files every time website content needs to be changed.

The public website currently contains several local TypeScript data
sources such as:

```text
src/data/blogArticles.ts
src/data/members.ts
src/data/schedule.ts
src/data/fanRepresentatives.ts
```

The long-term architecture is:

```text
7ICONS Admin
      ↓
Create / Edit Content
      ↓
Supabase
      ↓
7ICONS Web
      ↓
Updated Public Content
```

This allows content management to happen through an administration
interface instead of direct source-code modification.

---

# 🏗 Current Architecture

```text
                      Supabase
          ┌──────────────────────────┐
          │                          │
          │ Authentication           │
          │ PostgreSQL Database      │
          │ Row Level Security       │
          │ Admin Roles              │
          │ Future Storage           │
          │                          │
          └────────────┬─────────────┘
                       │
             ┌─────────┴──────────┐
             │                    │
             ▼                    ▼
     ┌───────────────┐    ┌───────────────┐
     │  7icons-web   │    │ 7icons-admin  │
     │               │    │               │
     │ Public Site   │    │ Admin Panel   │
     └───────────────┘    └───────┬───────┘
                                  │
                                  ▼
                           Authenticated Admin
```

The public website and Admin Panel remain separate Next.js
applications while sharing the same Supabase backend.

---

# 🛠 Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Next.js App Router
- React Compiler

## Backend

- Supabase
- PostgreSQL
- Supabase Authentication
- Row Level Security
- Supabase Data API

## Authentication

- `@supabase/supabase-js`
- `@supabase/ssr`
- Cookie-based sessions
- Server-side authentication verification
- Admin role verification

## Development & Deployment

- Git
- GitHub
- VS Code
- npm
- Vercel

---

# 🎨 Design Direction

The Admin Panel remains visually connected to the public 7ICONS
website while using a more productivity-focused interface.

Primary visual direction:

```text
White
Lavender
Violet
Purple Gradient
Soft Gray
Rounded Cards
Light Borders
Soft Shadows
Clean Dashboard Layout
```

The interface should feel:

```text
Modern
Professional
Clean
Friendly
Organized
Fast
Consistent with 7ICONS Branding
```

---

# ✨ Branding

Current branding assets include:

```text
Admin Banner
Admin Logo
Admin Favicon
```

Current favicon:

```text
src/app/icon.png
```

The old default Next.js:

```text
src/app/favicon.ico
```

has been removed in favor of the custom 7ICONS Admin favicon.

---

# 🖥 Admin Dashboard

The Dashboard V1 is complete and responsive.

Current layout:

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar        │ Topbar                                     │
│                ├─────────────────────────────────────────────│
│ Dashboard      │ Dashboard                                  │
│ Articles       │                                             │
│ Members        │ Statistic Cards                            │
│ Schedule       │                                             │
│ Fan Reps       │ Recent Activity      Upcoming Schedule     │
│ Users          │                                             │
│ Comments       │ Quick Actions                              │
│ Media          │                                             │
│                │                                             │
│ Settings       │                                             │
└────────────────┴─────────────────────────────────────────────┘
```

---

# 📊 Dashboard V1

Dashboard V1 currently includes:

## Summary Cards

```text
Total Articles
Total Members
Upcoming Events
Fan Representatives
Registered Users
Pending Comments
```

Current values are development placeholders.

They will later be replaced with live database statistics.

---

## Recent Activity

Displays placeholder administration activity such as:

```text
Article published
Member updated
Schedule added
Fan Representative added
Article updated
```

A proper admin activity log is planned for a future phase.

---

## Upcoming Schedule

Displays upcoming events including:

```text
Event Date
Event Title
Event Category
Location
Time
```

This currently uses development data.

Future versions will load events directly from Supabase.

---

## Quick Actions

Current shortcuts:

```text
New Article
Add Member
Add Schedule
Add Fan Representative
Upload Media
```

These routes are already prepared for future CRUD modules.

---

# 📱 Responsive Admin Interface

The Admin Panel has been tested for:

```text
Desktop ✅
Tablet  ✅
Mobile  ✅
```

Mobile features include:

- Responsive dashboard
- Two-column statistic cards
- Compact Quick Actions
- Mobile navigation drawer
- Overlay navigation
- Mobile admin profile
- Responsive schedule cards
- Responsive activity list

---

# 🧭 Current Routes

```text
/
│
├── /login
│
├── /unauthorized
│
├── /dashboard
│
├── /articles
│   └── /new
│
├── /members
│   └── /new
│
├── /schedule
│   └── /new
│
├── /representatives
│   └── /new
│
├── /users
│
├── /comments
│
├── /media
│
└── /settings
```

Administrative routes are grouped using:

```text
src/app/(admin)/
```

This allows all Admin Panel pages to share the same protected layout.

---

# 🔐 Authentication

Admin authentication is now connected to **Supabase Auth**.

Current login flow:

```text
/login
   ↓
Email + Password
   ↓
Supabase Authentication
   ↓
Session Created
   ↓
Admin Role Check
   ↓
Dashboard
```

Login uses:

```text
supabase.auth.signInWithPassword()
```

---

# 🍪 Session Management

Supabase sessions are handled using:

```text
@supabase/ssr
```

Current Supabase utilities:

```text
src/lib/supabase/
├── client.ts
├── server.ts
└── proxy.ts
```

Root session proxy:

```text
proxy.ts
```

The proxy helps maintain authentication cookies and refresh
Supabase sessions when required.

---

# 🛡 Protected Admin Routes

All routes inside:

```text
src/app/(admin)/
```

are protected server-side.

The Admin Layout verifies authentication before rendering
administrative content.

Current behavior:

```text
Not Logged In
      ↓
Admin Route
      ↓
/login
```

Authenticated users must also pass an admin role check.

---

# 👑 Admin Role System

Administrative access is controlled using the Supabase table:

```text
public.admin_roles
```

Current schema concept:

```text
user_id
role
is_active
created_at
updated_at
```

Supported roles:

```text
super_admin
admin
editor
moderator
```

Current development account uses:

```text
super_admin
```

---

# 🔒 Role Protection

Authentication alone does **not** grant access to the Admin Panel.

Current authorization flow:

```text
User logs in
    ↓
Supabase Auth validates credentials
    ↓
User ID retrieved
    ↓
admin_roles checked
    ↓
Admin record found?
    │
    ├── No
    │    ↓
    │ /unauthorized
    │
    └── Yes
         ↓
     is_active = true?
         │
         ├── No → /unauthorized
         │
         └── Yes
              ↓
          Dashboard ✅
```

This prevents regular Supabase users from accessing administrative
routes.

---

# 🚫 Unauthorized Access

Authenticated users without an active admin role are redirected to:

```text
/unauthorized
```

The Unauthorized page provides:

```text
Access Denied message
Go to 7ICONS Web
Sign Out
```

This behavior has been tested successfully with a non-admin
Supabase test account.

---

# 🚪 Logout

Admins can securely sign out through the Admin Profile menu.

Current flow:

```text
Admin Profile
    ↓
Sign Out
    ↓
Supabase Session Removed
    ↓
/login
```

Logout is also available from the Unauthorized page.

---

# 🔐 Current Security Model

Current security layers:

```text
Layer 1
Supabase Authentication

Layer 2
Supabase Session / Cookie Verification

Layer 3
Protected (admin) Layout

Layer 4
admin_roles Authorization

Layer 5
is_active Admin Status

Layer 6
Row Level Security
```

The Admin Panel does **not** rely on a hidden URL for security.

Knowing:

```text
7icons-admin.vercel.app
```

does not grant administrative access.

---

# 🛡 Security Principles

The project follows these principles:

```text
Never hardcode passwords.

Never commit secrets.

Never expose Service Role keys to the browser.

Never rely on hidden URLs for protection.

Every admin route must verify authentication.

Administrative access must verify roles.

Database access must use Row Level Security.

Environment variables must remain outside GitHub.

Authentication and authorization are separate concerns.
```

---

# 🔑 Environment Variables

Local Supabase configuration is stored in:

```text
.env.local
```

Current variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The project `.gitignore` contains:

```gitignore
.env*
```

so local environment values are **not committed to GitHub**.

---

# ☁️ Vercel Environment Variables

Production Supabase variables are configured separately in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

These are configured for:

```text
Production
Preview
Development
```

No database password or Supabase Service Role key is currently stored
in the frontend application.

---

# 🗄 Current Supabase Project

Backend project:

```text
7icons-platform
```

Organization:

```text
7ICONS
```

Region:

```text
Singapore
```

The backend is intended to eventually serve both:

```text
7icons-admin
7icons-web
```

---

# 🗃 Current Database

Currently implemented custom table:

```text
admin_roles
```

Planned future tables:

```text
profiles
articles
members
schedule_events
fan_representatives
comments
media
admin_activity
```

Tables should not be created randomly.

Each module should be designed together with:

```text
Schema
Constraints
Indexes
RLS
Policies
Admin permissions
Public permissions
```

before production use.

---

# 🔐 Row Level Security

Row Level Security is treated as a core part of the backend.

The project was created with automatic RLS enabled for new tables.

The `admin_roles` table uses RLS and allows authenticated users to
read only their own administrative role.

Future tables must have explicit policies before being used by
`7icons-web` or `7icons-admin`.

---

# 📰 Article Management

The next major development module is:

```text
Articles Management V1
```

This module will eventually replace manual editing of:

```text
src/data/blogArticles.ts
```

Planned functionality:

```text
View Articles
Create Article
Edit Article
Delete Article
Draft Article
Publish Article
Unpublish Article
Search Articles
Filter Articles
Manage Cover Image
Manage Slug
Manage Publication Date
```

Possible database fields:

```text
id
title
slug
excerpt
content
category
cover_image
status
published_at
created_at
updated_at
created_by
updated_by
```

Possible statuses:

```text
draft
published
archived
```

---

# 👥 Member Management

Planned module:

```text
Members Management
```

Future functionality:

```text
View Members
Add Member
Edit Member
Manage Portrait
Change Member Status
Manage Biography
Manage Member Story
Manage Display Order
Archive Former Members
```

Possible status values:

```text
current
former
```

---

# 📅 Schedule Management

Future Schedule tools will support:

```text
View Events
Create Event
Edit Event
Delete Event
Manage Event Category
Manage Date
Manage Time
Manage Location
Manage Description
```

Categories:

```text
Performance
Fan Meeting
Livestream
TV
Other
```

---

# 💜 Fan Representative Management

Future capabilities:

```text
View Representatives
Add Representative
Edit Representative
Remove Representative
Manage Region
Manage City
Manage Portrait
Manage Instagram
Manage WhatsApp
Manage Community Mission
Manage Community Motto
Manage Representative Story
```

---

# 👤 User Management

Once authentication is added to the public website, Admin Panel
user management may include:

```text
View Registered Users
View Profiles
View Registration Date
View Account Status
Suspend User
Restore User
View Comment Activity
```

Administrators must never be able to view user passwords.

---

# 💬 Comment Management

Future comment moderation:

```text
View Comments
Search Comments
Filter Comments
Approve Comments
Hide Comments
Remove Comments
Review Reports
View Comment Author
```

Possible statuses:

```text
published
pending
hidden
removed
```

---

# 🖼 Media Management

Future Media Library:

```text
Article Covers
Member Portraits
Fan Representative Portraits
Community Images
Website Assets
```

Planned storage:

```text
Supabase Storage
```

---

# 📝 Admin Activity Log

A future activity log should record meaningful administrative actions.

Examples:

```text
Admin created article
Admin edited member
Admin deleted event
Admin published article
Admin changed representative
Admin moderated comment
```

Possible structure:

```text
admin_id
action
entity_type
entity_id
description
created_at
```

This will become especially important when multiple administrators
are introduced.

---

# 👥 Planned Admin Roles

Current role foundation:

```text
Super Admin
├── Full platform access
├── Manage administrators
├── Manage users
├── Manage content
└── Manage settings

Admin
├── Manage content
├── Manage members
├── Manage schedule
├── Manage representatives
└── Moderate comments

Editor
├── Manage articles
├── Manage schedule
└── Limited publishing permissions

Moderator
├── Moderate comments
└── Limited user moderation
```

Only the Super Admin workflow has been tested so far.

Detailed permission enforcement will be implemented later.

---

# 📁 Current Project Structure

```text
7icons-admin/
│
├── assets/
│   └── 7icons-admin-banner.png
│
├── public/
│   └── brand/
│       └── 7icons-admin-logo.png
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── articles/
│   │   │   ├── members/
│   │   │   ├── schedule/
│   │   │   ├── representatives/
│   │   │   ├── users/
│   │   │   ├── comments/
│   │   │   ├── media/
│   │   │   ├── settings/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── login/
│   │   ├── unauthorized/
│   │   ├── icon.png
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── ui/
│   │
│   └── lib/
│       └── supabase/
│           ├── client.ts
│           ├── proxy.ts
│           └── server.ts
│
├── proxy.ts
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

# 🚀 Local Development

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin login:

```text
http://localhost:3000/login
```

---

# 🏗 Production Build

Before major deployments:

```bash
npm run build
```

A successful build verifies that the application can be compiled for
production.

---

# ☁️ Deployment Workflow

```text
Local Development
        ↓
npm run build
        ↓
Git Commit
        ↓
GitHub main
        ↓
Vercel Build
        ↓
Production
```

The Vercel project automatically deploys updates pushed to:

```text
main
```

---

# 🌿 Git Workflow

Basic workflow:

```bash
git add .
git commit -m "your commit message"
git push
```

Examples:

```text
feat: add admin dashboard
feat: add supabase authentication
feat: add admin role protection
feat: add article management
feat: add schedule management
fix: protect admin routes
docs: update admin documentation
```

---

# 🚦 Development Phases

```text
PHASE 0 — Repository Preparation
├── GitHub Repository               ✅
├── README                          ✅
├── Banner                          ✅
└── Planning                        ✅

PHASE 1 — Application Foundation
├── Next.js                         ✅
├── TypeScript                      ✅
├── Tailwind CSS                    ✅
├── Project Structure               ✅
├── Admin Branding                  ✅
└── Custom Favicon                  ✅

PHASE 2 — Admin UI Foundation
├── Admin Login UI                  ✅
├── Sidebar                         ✅
├── Topbar                          ✅
├── Admin Layout                    ✅
├── Mobile Drawer                   ✅
└── Responsive Admin Shell          ✅

PHASE 3 — Dashboard V1
├── Statistic Cards                 ✅
├── Recent Activity                 ✅
├── Upcoming Schedule               ✅
└── Quick Actions                   ✅

PHASE 4 — Backend Foundation
├── Supabase Project                ✅
├── Environment Variables           ✅
├── Supabase Browser Client         ✅
├── Supabase Server Client          ✅
├── Session Proxy                   ✅
├── Authentication                  ✅
├── Logout                          ✅
├── Protected Routes                ✅
├── admin_roles                     ✅
├── Super Admin                     ✅
├── Non-Admin Protection            ✅
└── Production Auth                 ✅

PHASE 5 — Content Management
├── Articles CRUD                   ⏳
├── Members CRUD                    ⏳
├── Schedule CRUD                   ⏳
└── Fan Representatives CRUD        ⏳

PHASE 6 — Public Website Integration
├── Connect 7icons-web              ⏳
├── Replace Local Article Data      ⏳
├── Replace Local Member Data       ⏳
├── Replace Local Schedule Data     ⏳
└── Replace Local Representative Data ⏳

PHASE 7 — Community Management
├── Public User Authentication      ⏳
├── User Profiles                   ⏳
├── Comments                        ⏳
├── Moderation                      ⏳
└── Account Activity                ⏳

PHASE 8 — Administration Expansion
├── Multiple Admin Permissions      ⏳
├── Activity Logs                   ⏳
├── Media Management                ⏳
└── Advanced Settings               ⏳
```

---

# ✅ Current Status

```text
GitHub Repository                 ✅
README Banner                     ✅
Next.js Application              ✅
Admin Branding                   ✅
Custom Favicon                   ✅

Admin Login UI                   ✅
Admin Dashboard                  ✅
Sidebar                          ✅
Topbar                           ✅
Mobile Navigation Drawer         ✅
Desktop Responsive               ✅
Tablet Responsive                ✅
Mobile Responsive                ✅

Vercel Deployment                ✅

Supabase Project                 ✅
Supabase Connection              ✅
Browser Client                   ✅
Server Client                    ✅
Session Proxy                    ✅

Admin Authentication             ✅
Session Persistence              ✅
Login Redirect                   ✅
Logout                           ✅
Protected Admin Routes           ✅

admin_roles Table                ✅
Super Admin Access               ✅
Non-Admin Rejection              ✅
Unauthorized Page                ✅
Production Authentication        ✅

Articles Management              ⏳
Members Management               ⏳
Schedule Management              ⏳
Fan Representative Management   ⏳
User Management                  ⏳
Comment Moderation               ⏳
Media Management                 ⏳
```

---

# 📌 Next Development Target

The next major milestone is:

```text
ARTICLES MANAGEMENT V1
```

Recommended development order:

```text
1. Design articles database schema
        ↓
2. Create articles table
        ↓
3. Configure RLS
        ↓
4. Configure admin policies
        ↓
5. Build Articles List
        ↓
6. Build Create Article
        ↓
7. Build Edit Article
        ↓
8. Build Delete Article
        ↓
9. Add Draft / Published status
        ↓
10. Test Admin CRUD
        ↓
11. Connect articles to 7icons-web
```

Once Articles Management works correctly, the same architecture can
be reused for:

```text
Members
Schedule
Fan Representatives
```

---

# 🎯 Current Milestone

The Admin Foundation milestone is complete.

```text
7icons-admin runs locally               ✅
Admin Login UI exists                   ✅
Dashboard Shell exists                  ✅
Sidebar works                           ✅
Topbar works                            ✅
Dashboard V1 works                      ✅
Responsive layout works                 ✅
Production build succeeds               ✅
GitHub is connected                      ✅
Vercel deployment is online             ✅

Supabase is connected                    ✅
Admin login works                        ✅
Session works                            ✅
Logout works                             ✅
Admin routes are protected               ✅
Admin roles are verified                 ✅
Non-admin users are blocked              ✅
Production authentication works          ✅
```

The project is now ready to move from **foundation development**
into **real content management**.

---

# 🏁 Long-Term Goal

The long-term goal is to transform:

```text
Developer
    ↓
Edit TypeScript File
    ↓
Commit
    ↓
Push
    ↓
Deploy
```

into:

```text
Administrator
    ↓
7ICONS Admin
    ↓
Create / Edit Content
    ↓
Supabase
    ↓
7ICONS Web
    ↓
Content Updated
```

The public website should eventually receive content without requiring
manual source-code edits for routine content management.

---

# 💜 Project Philosophy

The Admin Panel exists behind the scenes so the public experience can
remain simple, organized, and focused on the community.

```text
Manage the platform.
Preserve the content.
Support the community.
Continue the story.
```

At the center of the ecosystem:

> **7ICONS creates the memories.**  
> **ICONIA helps keep them alive.**

---

<p align="center">
  <strong>7ICONS ADMIN</strong>
</p>

<p align="center">
  Administrative Dashboard for the 7ICONS & ICONIA Digital Platform
</p>

<p align="center">
  <strong>BUILD FOR ICONIA BY ICONIA</strong>
</p>