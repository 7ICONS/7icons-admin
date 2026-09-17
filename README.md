<p align="center">
  <img
    src="./assets/7icons-admin-banner.png"
    alt="7ICONS Admin Dashboard"
    width="100%"
  />
</p>

<h1 align="center">7ICONS Admin</h1>

<p align="center">
  <strong>Administrative Dashboard for the 7ICONS & ICONIA Digital Ecosystem</strong>
</p>

<p align="center">
  Internal administration application for content, members, schedules,
  galleries, applications, moderation, notifications, and platform management.
</p>

<p align="center">
  <strong>BUILD FOR ICONIA BY ICONIA</strong>
</p>

---

# 💜 About

**7ICONS Admin** is the internal administration dashboard for the
7ICONS & ICONIA digital ecosystem.

It provides a centralized interface for managing the data and workflows used by
the public 7ICONS website and the wider ecosystem.

The Admin Panel is maintained as a separate Next.js application so the public
website can remain focused on visitors and the ICONIA community while
administrative tools stay isolated behind authenticated access.

```text
7ICONS Digital Ecosystem
│
├── 7icons-web
│   └── Public Website & Community Experience
│
├── 7icons-admin
│   └── Administration Dashboard
│
└── 7icons-apply
    └── Fan Representative Application Portal
```

The three applications share the same Supabase backend foundation.

---

# 🌐 Live Deployment

Admin Panel:

```text
https://7icons-admin.vercel.app
```

Public Website:

```text
https://7icons-web.vercel.app
```

The applications are deployed independently through Vercel.

---

# 🚀 Current Release

## V1.0 — Live

The main Admin Panel foundation and core administration workflows are complete
and deployed.

The project has moved beyond its original dashboard prototype and now includes
real Supabase-backed management, moderation, application review, and
notification workflows.

Current major capabilities include:

- Secure Supabase authentication
- Protected administrative routes
- Admin role authorization
- Content management
- Article CRUD
- Member CRUD
- Schedule CRUD
- Gallery album management
- Fan Representative workflows
- Application review
- Representative invitation workflow
- Comment report review
- Admin notifications
- Supabase Storage integration
- Production deployment through Vercel

---

# 🎯 Purpose

The purpose of `7icons-admin` is to allow routine platform management without
requiring direct edits to the source code of the public website.

The current architecture follows this model:

```text
Administrator
      ↓
7ICONS Admin
      ↓
Create / Edit / Review Content
      ↓
Supabase
      ↓
7ICONS Web / 7icons-apply
      ↓
Updated Ecosystem Data
```

This keeps content management separate from frontend development.

---

# 🏗 Architecture

```text
                         Supabase
             ┌──────────────────────────┐
             │                          │
             │ Authentication           │
             │ PostgreSQL Database      │
             │ Row Level Security       │
             │ Storage                  │
             │ Admin Roles              │
             │ Applications             │
             │ Reports                  │
             │ Notifications            │
             │                          │
             └────────────┬─────────────┘
                          │
             ┌────────────┼─────────────┐
             │            │             │
             ▼            ▼             ▼
      ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
      │ 7icons-web  │ │7icons-admin │ │7icons-apply │
      │             │ │             │ │             │
      │ Public Site │ │ Admin Panel │ │ Apply Portal│
      └─────────────┘ └──────┬──────┘ └─────────────┘
                             │
                             ▼
                    Authorized Admin
```

Each frontend remains an independent Next.js application while sharing the
backend infrastructure.

---

# 🛠 Tech Stack

## Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Next.js App Router**
- **React Compiler**

## Backend

- **Supabase**
- **PostgreSQL**
- **Supabase Authentication**
- **Supabase Storage**
- **Supabase Data API**
- **Row Level Security**
- **PostgreSQL Functions / RPC**

## Authentication

- `@supabase/supabase-js`
- `@supabase/ssr`
- Cookie-based sessions
- Server-side authentication verification
- Admin role verification

## Development & Deployment

- Git
- GitHub
- npm
- VS Code
- Vercel

---

# 🎨 Design Direction

The Admin Panel remains visually connected to the public 7ICONS website while
using a more productivity-focused interface.

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

The interface is designed to feel:

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

Custom favicon:

```text
src/app/icon.png
```

The default Next.js favicon is not used.

---

# 🖥 Admin Dashboard

The Admin Dashboard provides the central overview and navigation for platform
administration.

Main interface:

```text
┌──────────────────────────────────────────────────────────────┐
│ Sidebar        │ Topbar                                     │
│                ├─────────────────────────────────────────────│
│ Dashboard      │ Dashboard                                  │
│ Articles       │                                            │
│ Members        │ Statistics / Platform Overview             │
│ Schedule       │                                            │
│ Gallery        │ Activity / Notifications                   │
│ Applications   │                                            │
│ Reports        │ Upcoming Schedule                          │
│ Representatives│                                            │
│ Users          │ Quick Actions                              │
│ Comments       │                                            │
│ Media          │                                            │
│ Settings       │                                            │
└────────────────┴─────────────────────────────────────────────┘
```

The layout is shared across protected administrative routes.

---

# 📱 Responsive Admin Interface

The Admin Panel supports:

```text
Desktop ✅
Tablet  ✅
Mobile  ✅
```

Responsive behavior includes:

- Responsive dashboard
- Adaptive statistic cards
- Mobile navigation drawer
- Overlay navigation
- Responsive administration tables
- Responsive forms
- Responsive review pages
- Mobile-friendly admin profile controls

---

# 🔐 Authentication

Admin authentication uses **Supabase Auth**.

Current flow:

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
Protected Admin Area
```

Authentication alone does not automatically grant administrative access.

---

# 🍪 Session Management

Supabase sessions are handled with:

```text
@supabase/ssr
```

Main utilities:

```text
src/lib/supabase/
├── client.ts
├── server.ts
└── proxy.ts
```

The session proxy keeps authentication cookies synchronized and refreshes
Supabase sessions when required.

---

# 🛡 Protected Admin Routes

Administrative pages are protected server-side.

A visitor without a valid session is redirected to:

```text
/login
```

An authenticated user without an authorized administrative role is redirected
to:

```text
/unauthorized
```

This keeps authentication and authorization as separate security layers.

---

# 👑 Admin Role System

Administrative access is backed by:

```text
admin_roles
```

Role foundation:

```text
super_admin
admin
editor
moderator
```

The system can use roles and active status to determine whether an authenticated
account is allowed to access administrative functionality.

Typical authorization flow:

```text
User logs in
    ↓
Supabase validates session
    ↓
User ID retrieved
    ↓
admin_roles checked
    ↓
Active administrative role?
    │
    ├── No
    │    ↓
    │ /unauthorized
    │
    └── Yes
         ↓
      Admin Panel
```

---

# 🔐 Security Model

The Admin Panel uses multiple security layers:

```text
Layer 1
Supabase Authentication

Layer 2
Session / Cookie Verification

Layer 3
Protected Admin Layout

Layer 4
Admin Role Authorization

Layer 5
Active Admin Status

Layer 6
Row Level Security

Layer 7
Database Functions / Policies
```

The application does not rely on a hidden URL for security.

Knowing the Admin Panel URL does not grant access.

---

# 🛡 Security Principles

The project follows these principles:

```text
Never hardcode passwords.

Never commit secrets.

Never expose privileged backend keys to the browser.

Never rely on hidden URLs for protection.

Every admin route must verify authentication.

Administrative access must verify authorization.

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

Main public Supabase variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Environment files are excluded from Git.

Production variables are configured separately in Vercel.

---

# 🗄 Shared Supabase Backend

The Admin Panel shares the same backend foundation used by the rest of the
7ICONS ecosystem.

The backend contains data and workflows for areas such as:

- Admin roles
- User profiles
- Articles
- Members
- Schedule events
- Gallery albums
- Gallery photos
- Fan Representative applications
- Representatives
- Comments
- Comment reports
- Admin notifications

Row Level Security and database-side functions are used where appropriate to
control access and protect sensitive workflows.

---

# 📰 Article Management

Article Management is connected to Supabase and replaces the original
source-file-only workflow.

Current functionality includes:

- View articles
- Create article
- Edit article
- Delete article
- Draft / published state
- Featured article state
- Search
- Filtering
- Slug management
- Cover image upload
- Cover replacement
- Storage cleanup
- Publication information

The public Blog and individual article pages consume the Supabase-backed article
data.

```text
Admin
  ↓
Article CRUD
  ↓
Supabase
  ↓
7icons-web /blog
```

---

# 👥 Member Management

Members Management supports real CRUD operations.

Current functionality includes:

- View members
- Create member
- Edit member
- Delete member
- Current / former member status
- Published / hidden state
- Display ordering
- Member biography
- Profile story sections
- Portrait upload
- Portrait replacement
- Portrait removal
- Supabase Storage cleanup

Member data can be consumed by the public Members archive and individual member
pages.

---

# 📅 Schedule Management

Schedule administration is backed by Supabase.

Current functionality includes:

- View events
- Create event
- Edit event
- Delete event
- Published state
- Featured state
- Upcoming / past event handling
- Calendar view
- Monthly navigation
- Event date management
- Event time
- Event location
- Category
- Event detail information

Main categories include:

```text
Performance
Fan Meeting
Livestream
TV
Other
```

The public Schedule system reads from the same backend data.

---

# 🖼 Gallery Management

Gallery administration uses an album-based architecture.

Current functionality includes:

- Create album
- Edit album metadata
- Delete album
- Upload multiple photos
- Add photos to an existing album
- Remove individual photos
- Delete album photos from Storage
- Storage cleanup when content is removed

Gallery data uses structures such as:

```text
gallery_albums
gallery_album_photos
```

with Supabase Storage handling uploaded gallery media.

---

# 💜 Fan Representative Workflow

Fan Representative management is integrated with the wider application
ecosystem.

The workflow connects:

```text
7icons-apply
      ↓
Application Submitted
      ↓
7icons-admin
      ↓
Review
      ↓
Approve / Reject
      ↓
Representative Workflow
```

Representative records can then be used by the public Fan Representatives
section.

---

# 📝 Applications

The Admin Panel includes an application review workflow for submissions coming
from `7icons-apply`.

Supported application categories can include:

```text
Representative
Volunteer
Community
Event
```

Typical application lifecycle:

```text
Submitted
   ↓
Under Review
   ↓
Approved / Rejected
```

Applications may also enter a withdrawn state when applicable.

Administrators can inspect applicant information and type-specific form data
before making a review decision.

Review data can include:

- Application status
- Applicant identity
- Email
- Phone
- Region
- City
- Application-specific form data
- Internal review notes
- Reviewer
- Review timestamp

---

# ✉️ Representative Invitations

Approved Representative workflows can continue into an invitation process.

The ecosystem supports linking the application process with a representative
account/profile flow.

Typical process:

```text
Application Approved
      ↓
Representative Invitation
      ↓
Applicant Opens Invitation
      ↓
Sign In / Create Account
      ↓
Representative Account Flow
```

This keeps application review and user-account onboarding connected without
requiring manual account creation by an administrator.

---

# 🚨 Comment Reports

Community moderation includes a report system for public comments.

Reports can move through moderation states such as:

```text
open
dismissed
actioned
```

The Admin Panel provides a review workflow so reports can be inspected and
resolved by authorized administrators.

The reporting architecture also prevents the same user from repeatedly creating
duplicate reports for the same comment.

---

# 🔔 Admin Notifications

Administrative notifications surface important events that require attention.

Notification workflows include events such as:

- New applications
- Comment reports
- Review-related platform activity

A notification can contain:

```text
Type
Title
Message
Destination
Read / Unread State
Timestamp
```

This allows admins to jump directly from the notification to the relevant
application, report, or review screen.

---

# 👤 User & Community Administration

The Admin Panel shares the same account backend used by the public website.

Administrative tooling is designed around account safety and moderation rather
than password access.

Admins never receive access to user passwords.

Relevant account information can include:

- User identity
- Profile information
- Account status
- Registration information
- Community activity
- Moderation state

Account restrictions are enforced through backend account status checks rather
than exposing authentication credentials.

---

# 💬 Comment Moderation

The wider moderation system supports community comments and replies.

Administrative workflows can work with moderation states and reports without
exposing private authentication data.

Relevant capabilities include:

- Review community comments
- Review reports
- Inspect comment author information
- Take moderation action
- Dismiss reports
- Track resolved reports

---

# 🗂 Supabase Storage

Supabase Storage is used by content-management modules that require media.

Examples include:

- Article cover images
- Member portraits
- Gallery photos
- Representative images

Delete and replacement workflows are designed to clean up outdated files rather
than leave unnecessary media behind.

---

# 🧭 Main Routes

The exact route structure may continue evolving, but the Admin Panel is
organized around areas such as:

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
│
├── /members
│
├── /schedule
│
├── /gallery
│
├── /representatives
│
├── /applications
│
├── /reports
│
├── /users
│
├── /comments
│
├── /media
└── /settings
```

Administrative routes share the protected admin shell.

---

# 📁 Project Structure

A simplified structure:

```text
7icons-admin/
│
├── assets/
│   └── 7icons-admin-banner.png
│
├── public/
│   └── brand/
│
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── dashboard/
│   │   │   ├── articles/
│   │   │   ├── members/
│   │   │   ├── schedule/
│   │   │   ├── gallery/
│   │   │   ├── representatives/
│   │   │   ├── applications/
│   │   │   ├── reports/
│   │   │   ├── users/
│   │   │   ├── comments/
│   │   │   ├── media/
│   │   │   └── settings/
│   │   │
│   │   ├── login/
│   │   ├── unauthorized/
│   │   ├── globals.css
│   │   ├── icon.png
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   └── lib/
│       └── supabase/
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

The exact internal structure can evolve as new administration modules are
introduced.

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

Backend-dependent functionality requires the appropriate Supabase environment
variables.

---

# 🏗 Production Build

Before pushing major updates:

```bash
npm run build
```

A successful production build should be completed before deployment.

---

# ☁️ Deployment

The Admin Panel is deployed through **Vercel**.

Updates pushed to the production branch are automatically built and deployed.

Deployment flow:

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

Production:

```text
https://7icons-admin.vercel.app
```

---

# 🧩 7ICONS Ecosystem

The Admin Panel works as the internal management layer of the complete
ecosystem.

```text
                  Supabase
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼

    7icons-web   7icons-admin   7icons-apply

    Public Site     Admin       Application
    & Community     Tools       Portal
```

Each repository has its own responsibility while sharing platform data where
appropriate.

---

# ✅ Development Status

```text
Repository & Project Foundation          ✅
Admin Branding                           ✅
Responsive Admin Shell                   ✅
Dashboard                                ✅

Supabase Integration                     ✅
Supabase Authentication                  ✅
Session Persistence                      ✅
Protected Admin Routes                   ✅
Admin Role Verification                  ✅
Unauthorized Protection                  ✅
Logout                                   ✅
Row Level Security Foundation            ✅

Articles CRUD                            ✅
Article Cover Storage                    ✅
Public Article Integration               ✅

Members CRUD                             ✅
Member Portrait Storage                  ✅
Public Member Integration                ✅

Schedule CRUD                            ✅
Calendar / Event Management              ✅
Public Schedule Integration              ✅

Gallery Album CRUD                       ✅
Multi-photo Upload                       ✅
Gallery Storage Cleanup                  ✅

Applications Workflow                    ✅
Application Review                       ✅
Approve / Reject                         ✅
Representative Invitation Flow           ✅

Comment Reports                          ✅
Report Review                            ✅
Admin Notifications                      ✅

Production Build                         ✅
GitHub Integration                       ✅
Vercel Deployment                        ✅
Production Authentication                ✅
```

---

# 🔮 Future Development

Future updates can continue expanding the administration experience with:

- More granular role permissions
- Expanded multi-admin workflows
- Richer activity logging
- Newsletter subscriber management
- Newsletter campaign tools
- Additional moderation tools
- More advanced dashboard statistics
- Additional bulk content actions
- Expanded Media Library tools
- Advanced Settings
- Additional ecosystem notifications
- Further accessibility and UX improvements

---

# 🏁 Current Milestone

The original goal of moving routine platform management away from direct
TypeScript data editing has been achieved for the core content workflow.

The ecosystem has evolved from:

```text
Developer
    ↓
Edit Source File
    ↓
Commit
    ↓
Push
    ↓
Deploy
```

toward:

```text
Administrator
    ↓
7ICONS Admin
    ↓
Create / Edit / Review
    ↓
Supabase
    ↓
7ICONS Ecosystem
```

This allows the platform to continue growing without requiring source-code
changes for every routine content update.

---

# 💜 Project Philosophy

The Admin Panel exists behind the scenes so the public experience can remain
simple, organized, and focused on the community.

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
  Administrative Dashboard for the 7ICONS & ICONIA Digital Ecosystem
</p>

<p align="center">
  <strong>BUILD FOR ICONIA BY ICONIA</strong>
</p>