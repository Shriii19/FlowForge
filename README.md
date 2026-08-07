# 🚀 FlowForge

### Real-Time Project Collaboration Platform

> Build, manage, and collaborate on projects in real-time — all in one place.

---

## 📌 Overview

**FlowForge** is a modern full-stack collaboration platform designed to streamline teamwork by combining project management, communication, and real-time interaction features.

It aims to provide a unified environment similar to tools like Jira, Slack, and GitHub — enabling teams to work more efficiently and collaboratively.

---

## 🎯 Key Features

* 📋 **Kanban Task Management**
  Organize tasks with drag-and-drop boards (Todo / In Progress / Done)

* 👥 **Team Collaboration**
  Create projects, invite members, and assign tasks

* 💬 **Real-Time Chat**
  Communicate instantly within project workspaces

* 🖱️ **Live Cursor Tracking (Planned)**
  See team members' activity in real-time

* 🎙️ **Voice Rooms (Planned)**
  Built-in voice communication for teams

* 🔗 **GitHub Integration (Planned)**
  Sync issues and commits with projects

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* Tailwind CSS
* Socket.io Client

### Backend

* Node.js
* Express.js
* Socket.io

### Database

* Supabase (PostgreSQL) *(Planned)*

---

## 📂 Project Structure

```
flowforge/
├── backend/        # Express server
├── frontend/       # Next.js app
├── .env.example    # Environment variables template
├── README.md
```

---

## ⚙️ Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/flowforge.git
cd flowforge
```

---

### 2️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

👉 Runs on: http://localhost:3000

---

### 3️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

👉 Runs on: http://localhost:5000

---

### 4️⃣ Environment Variables

Create `.env` files in both frontend and backend based on `.env.example`.

Example:

```
PORT=5000
JWT_SECRET=your_secret_key
DATABASE_URL=your_database_url
```

---

## Deploying On Vercel

For Vercel, the deployable Next.js app lives in `frontend/`.

Two supported setups:

1. Import the repository in Vercel and set the **Root Directory** to `frontend`.
2. Deploy the repository root with the included root `package.json` and `vercel.json`, which forward the build to the frontend workspace.

If your existing Vercel project was imported from the repository root and shows a 404, update the project's **Root Directory** to `frontend` or redeploy after pulling these config changes.

---

## 🚧 Development Status

**Current Phase:** Initial Setup

### ✅ Completed

* Project structure setup
* Frontend (Next.js + Tailwind) initialized
* Backend (Express) initialized

### 🔄 In Progress

* Authentication system
* Dashboard UI
* API integration

### 🔜 Upcoming

* Kanban board implementation
* Real-time chat system
* Supabase integration
* Deployment

---

## 📌 Future Enhancements

* 🤖 AI-powered task suggestions
* 📊 Analytics dashboard
* 🔔 Notification system
* 🔌 Plugin architecture
* 📱 Mobile app support

---

## 🌸 Nexus Spring of Code

This project is officially participating in **Nexus Spring of Code (NSoC) 2026)**.

Contributors are welcome to join and earn points by solving issues tagged with difficulty levels.

### Issue Labels & Points

| Label  | Points |
|--------|--------|
| level1 | 3 pts  |
| level2 | 5 pts  |
| level3 | 10 pts |

### How to Contribute via NSoC

1. Browse issues labeled `level1`, `level2`, or `level3`
2. **Request assignment** on an issue before starting work — PRs without assignment will not be accepted
3. Include **`nsoc26`** in your Pull Request title or description
4. Follow the contribution guidelines in [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📜 License

This project is licensed under the MIT License.

---


## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub!
