# ⚡ GetSmark — Task Manager

A full-stack team task management application built with **Spring Boot** and **React**.  
Create projects, invite team members, assign tasks, and track progress — all in one place.

---

## 🚀 Live Demo

> **Frontend:** [get-smark-task-manager.vercel.app](https://get-smark-task-manager.vercel.app)

---

## ✨ Features

### 🔐 Authentication
- OTP-based signup (email verification)
- JWT login (24hr token)
- Forgot password via OTP

### 📁 Project Management
- Create projects (creator becomes Admin)
- Add members by email:
  - Registered user → **directly added** + notification email
  - Unregistered user → **invite email sent** → shows as ⏳ Pending until accepted
- Cancel pending invites
- Remove members

### ✅ Task Management
- Create tasks with Title, Description, Due Date, Priority (Low / Medium / High)
- Assign tasks to confirmed members only (pending invites cannot be assigned)
- Status tracking: **To Do → In Progress → Done**
- Admin: full control (create, update, delete)
- Member: update status on assigned tasks only

### 📊 Dashboard
- Total tasks, Tasks by status, Overdue count
- Per-user workload, 7-day activity trend
- Project health overview, Upcoming deadlines
- Auto-refreshes every 30 seconds

### 📧 Email Notifications (via Brevo)
- OTP emails for signup and password reset
- Invite link email for unregistered users
- "You've been added" email for registered users

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Spring Boot 3.2.5, Java 21              |
| Database  | MongoDB                                 |
| Auth      | JWT + BCrypt                            |
| Email     | Brevo SMTP (smtp-relay.brevo.com)       |
| Frontend  | React 19, Vite 8, React Router v7       |
| HTTP      | Axios                                   |
| Deploy    | Railway (backend + DB), Vercel/Railway (frontend) |

---

## 📂 Project Structure

```
GetSmark---TaskManager/
├── client/                          # React Frontend
│   ├── Dockerfile                   # Production build (Nginx)
│   ├── nginx.conf                   # React Router + static serving
│   ├── railway.toml                 # Railway config
│   ├── vite.config.js               # Dev proxy /api → localhost:8080
│   └── src/
│       ├── App.jsx                  # Routes + PrivateRoute
│       ├── context/AuthContext.jsx  # JWT state
│       ├── utils/api.js             # Axios + token injection
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Forgotpassword.jsx
│           ├── Dashboard.jsx
│           ├── Projects.jsx
│           ├── ProjectDetail.jsx    # Members, pending invites, tasks
│           ├── Tasks.jsx
│           └── AcceptInvite.jsx     # Invite link handler
│
└── taskmanager/                     # Spring Boot Backend
    ├── Dockerfile                   # Production build
    ├── railway.toml                 # Railway config
    └── src/main/java/com/taskmanager/
        ├── controller/              # Auth, Project, Task, Dashboard
        ├── service/                 # Business logic + email
        ├── repository/              # MongoDB repos
        ├── model/                   # User, Project, Task, Invitation, OtpStore
        ├── security/                # JwtUtil, JwtFilter
        └── resources/
            ├── application.properties       # Local dev
            └── application-prod.properties  # Railway production
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Java 21+
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Brevo account for emails ([brevo.com](https://brevo.com) — free 300 emails/day)

### 1. Clone the repo
```bash
git clone https://github.com/23Amansharma/GetSmark---TaskManager.git
cd GetSmark---TaskManager
```

### 2. Configure Backend

Edit `taskmanager/src/main/resources/application.properties`:

```properties
server.port=8080
app.url=http://localhost:5173

spring.data.mongodb.uri=mongodb://localhost:27017/taskmanager

jwt.secret=your_super_secret_key_here_must_be_at_least_32_chars

spring.mail.host=smtp-relay.brevo.com
spring.mail.port=587
spring.mail.username=YOUR_BREVO_SMTP_USERNAME
spring.mail.password=YOUR_BREVO_SMTP_API_KEY
app.mail.from=YOUR_VERIFIED_SENDER_EMAIL
```

### 3. Run Backend
```bash
cd taskmanager

# Windows
mvnw.cmd spring-boot:run

# Mac / Linux
./mvnw spring-boot:run
```
Backend starts at `http://localhost:8080`

### 4. Run Frontend
```bash
cd client
npm install
npm run dev
```
Frontend starts at `http://localhost:5173`  
Vite automatically proxies `/api` → `http://localhost:8080`

---

## 🚂 Railway Deployment Guide

> Railway deploys directly from GitHub — **no Docker installation needed on your machine.**  
> Railway pulls code from GitHub and uses the Dockerfiles on its own servers.

---

### Step 1 — Set up MongoDB

**Option A — Railway Plugin (easiest):**
1. Railway dashboard → New Project → Add Service → Database → MongoDB
2. Click the MongoDB service → Variables tab → copy `MONGODB_URL`

**Option B — MongoDB Atlas (free):**
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → create free cluster
2. Database Access → create a user (save username + password)
3. Network Access → Add IP `0.0.0.0/0` (allow all)
4. Connect → Drivers → copy the URI  
   Example: `mongodb+srv://user:pass@cluster.mongodb.net/taskmanager`

---

### Step 2 — Deploy Backend

1. Railway dashboard → New Project (or existing) → **Add Service → GitHub Repo**
2. Select `23Amansharma/GetSmark---TaskManager`
3. In service settings → set **Root Directory** to: `taskmanager`
4. Go to **Variables** tab → add these:

| Variable               | Value                                    |
|------------------------|------------------------------------------|
| `SPRING_PROFILES_ACTIVE` | `prod`                                 |
| `MONGODB_URI`          | *(from Step 1)*                          |
| `JWT_SECRET`           | *(any random 64+ char string)*           |
| `APP_URL`              | *(frontend URL — update after Step 3)*   |
| `MAIL_HOST`            | `smtp-relay.brevo.com`                   |
| `MAIL_PORT`            | `587`                                    |
| `MAIL_USERNAME`        | *(Brevo SMTP username)*                  |
| `MAIL_PASSWORD`        | *(Brevo SMTP API key)*                   |
| `MAIL_FROM`            | *(Brevo verified sender email)*          |

5. Railway will detect the Dockerfile and deploy (~3-5 min for Maven build)
6. Note your backend URL: `https://xxxx.railway.app`

---

### Step 3 — Deploy Frontend

1. Same Railway project → **Add Service → GitHub Repo** (same repo again)
2. Set **Root Directory** to: `client`
3. Go to **Variables** tab → add:

| Variable        | Value                                         |
|-----------------|-----------------------------------------------|
| `VITE_API_URL`  | `https://your-backend.railway.app` (from Step 2, no trailing slash) |

4. Deploy (~2-3 min)
5. Note your frontend URL: `https://xxxx.railway.app`

---

### Step 4 — Update APP_URL in Backend

1. Backend service → Variables tab
2. Update `APP_URL` = `https://your-frontend-url.railway.app`
3. Backend auto-redeploys — invite emails will now have correct links ✅

---

### Step 5 — Test

1. Open frontend URL in browser
2. Signup → OTP email should arrive
3. Login → Dashboard should load
4. Create a project → Add a member → Check invite email
5. Click invite link → Accept → member joins project ✅

---

### 🔄 Future Updates (push to deploy)

Railway is connected to GitHub. Any `git push` auto-triggers redeploy:

```bash
git add .
git commit -m "your update"
git push
```

---

## 🌐 API Reference

All routes prefixed with `/api`

### Auth — Public
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| POST   | `/auth/send-otp`      | Send OTP for signup                |
| POST   | `/auth/verify-otp`    | Verify OTP                         |
| POST   | `/auth/complete-signup` | Create account, get JWT          |
| POST   | `/auth/login`         | Login, get JWT                     |
| POST   | `/auth/forgot-password` | Send password reset OTP          |
| POST   | `/auth/reset-password`  | Reset password with OTP          |
| GET    | `/auth/health`        | Health check (Railway uses this)   |
| GET    | `/auth/invite-info`   | Get invite details by token        |

### Projects — JWT Required
| Method | Endpoint                                    | Description                      |
|--------|---------------------------------------------|----------------------------------|
| GET    | `/projects`                                 | My projects                      |
| POST   | `/projects`                                 | Create project                   |
| GET    | `/projects/{id}`                            | Get project by ID                |
| POST   | `/projects/{id}/members`                    | Add member / send invite         |
| DELETE | `/projects/{id}/members`                    | Remove member (admin)            |
| GET    | `/projects/{id}/pending-invites`            | Pending invites list (admin)     |
| DELETE | `/projects/{id}/pending-invites/{inviteId}` | Cancel invite (admin)            |
| POST   | `/projects/accept-invite`                   | Accept invite with token         |

### Tasks — JWT Required
| Method | Endpoint                  | Description                              |
|--------|---------------------------|------------------------------------------|
| POST   | `/tasks`                  | Create task (admin)                      |
| GET    | `/tasks/project/{id}`     | All tasks in a project                   |
| GET    | `/tasks/my`               | My assigned tasks                        |
| PATCH  | `/tasks/{id}`             | Update task (member: status only)        |
| DELETE | `/tasks/{id}`             | Delete task (admin)                      |

### Dashboard — JWT Required
| Method | Endpoint     | Description              |
|--------|--------------|--------------------------|
| GET    | `/dashboard` | Full stats and analytics |

---

## 🗄️ Database Schema

### `users`
```
_id, name, email, password (BCrypt), createdAt
```

### `projects`
```
_id, name, description, createdBy,
members: [{ userId, name, email, role }],  ← role: ADMIN / MEMBER
createdAt
```

### `tasks`
```
_id, title, description, dueDate,
priority (LOW/MEDIUM/HIGH),
status (TODO/IN_PROGRESS/DONE),
projectId, assignedTo (userId), assignedToName, createdAt
```

### `invitations`
```
_id, projectId, projectName, invitedEmail,
invitedByName, token (UUID), createdAt, expiresAt (+7 days)
(deleted when accepted or cancelled)
```

### `otp_store`
```
_id, email, otp, purpose (SIGNUP/RESET),
createdAt, expiresAt (+10 minutes)
```

---

## 🔒 Security Notes

> ⚠️ **Important:** `application.properties` contains real credentials.  
> Add it to `.gitignore` before pushing to a public repo.

```gitignore
# .gitignore
taskmanager/src/main/resources/application.properties
```

All production secrets are set via **Railway Environment Variables** — never hardcoded.

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| OTP email not received | Check Brevo sender email is verified. Check spam folder. |
| Invite link not working | `APP_URL` not set correctly in Railway backend variables |
| API calls failing (local) | `vite.config.js` proxy must point to `http://localhost:8080` |
| Railway build failing | Check Root Directory is set correctly: `taskmanager` for backend, `client` for frontend |
| MongoDB connection error | Check `MONGODB_URI` format. For Atlas, allow `0.0.0.0/0` in Network Access |
| 401 on all requests (prod) | `JWT_SECRET` env variable not set in Railway backend |
| Pending invite not visible | Only Admin can see pending invites section |
| User not in assign dropdown | Only confirmed members shown — pending invite must be accepted first |

---

## 👨‍💻 Author

**Aman Sharma**  
GitHub: [@23Amansharma](https://github.com/23Amansharma)