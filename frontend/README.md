🖥️ FlowForge — Frontend
> Next.js 16 frontend for the FlowForge real-time collaboration platform.

![License](https://img.shields.io/github/license/flowforge/flowforge)
![Contributors](https://img.shields.io/github/contributors/flowforge/flowforge)
![Build Status](https://img.shields.io/github/actions/workflow/status/flowforge/flowforge/ci.yml)

---

## 📋 Table of Contents
- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [App Routes](#-app-routes)
- [Environment Variables](#-environment-variables-reference)
- [Linting](#-linting)
- [Development Status](#-development-status)
- [Deployment](#-deployment)
- [License](#-license)

---

## 📌 Overview
The FlowForge frontend is built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.  
It provides the user interface for project management, real-time chat, and team collaboration features.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Auth & DB | Supabase |
| Linting | ESLint (Next.js config) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Auth & DB | Supabase |
| Linting | ESLint (Next.js config) |

---

## 📂 Folder Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout (server component)
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── api/                # Next.js Route Handlers
│   │   ├── auth/signup/    # Signup API route
│   │   └── projects/       # Projects API route
│   ├── components/
│   │   ├── AppShell.tsx    # Client wrapper for nav/sidebar logic
│   │   └── Sidebar.tsx     # Sidebar navigation
│   ├── hooks/
│   │   └── useAuth.ts      # Authentication hook
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   ├── dashboard/          # Dashboard page
│   ├── chat/               # Chat page
│   ├── projects/           # Projects page
│   ├── workspace/          # Workspace page
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── public/                 # Static assets
├── next.config.ts
├── tailwind.config (via postcss)
└── tsconfig.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- A running [FlowForge backend](../backend/README.md)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🗺️ App Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login |
| `/signup` | User registration |
| `/dashboard` | Main dashboard |
| `/projects` | Projects list |
| `/workspace` | Project workspace |
| `/chat` | Real-time chat |

---

## 🔒 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

---

## 🧹 Linting

```bash
npm run lint
```

---

## 🚧 Development Status

- [x] Next.js App Router setup
- [x] Tailwind CSS integration
- [x] Supabase client configuration
- [x] Authentication pages (login / signup)
- [x] Dashboard UI
- [x] Sidebar navigation
- [ ] Kanban board
- [ ] Real-time chat UI
- [ ] Project management views

---

## 🚀 Deployment

This app is deployed on **Vercel**. To deploy your own instance:

1. Import the repository into [Vercel](https://vercel.com)
2. Set the **Root Directory** to `frontend`
3. Add the environment variables listed above
4. Deploy

---

## 📜 License

MIT — see the root [LICENSE](../LICENSE) file for details.
