# SkillSwap AI Platform — Advanced Full-Stack Project

A polished final-year project starter for **Skill Swap Platform with AI Recommendation**.

## Stack
- Frontend: React + Vite + React Router + Axios + Lucide React
- Backend: Node.js + Express + MySQL + JWT + bcrypt
- AI: Python FastAPI recommendation service (with a deterministic fallback)
- Database: MySQL
- Optional deployment: Docker Compose

## Main features
- Modern responsive dashboard UI
- Registration / Login / JWT authentication
- Profile management
- Add, edit and delete skills
- Search users by skill
- AI-powered skill recommendations
- Skill swap requests with accept/reject
- Connections
- Real-time-ready chat API and polished chat UI
- Notifications
- Reviews and ratings
- Admin dashboard
- Reports / moderation
- Dark mode
- Responsive sidebar/navbar
- Database schema + seed data
- Docker Compose setup

## Run locally

### 1. Database
Create a MySQL database and run:
```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

### 2. Backend
```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

### 4. AI service (optional but recommended)
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The backend falls back to local recommendation logic if the AI service is unavailable.

## Demo account
After running seed.sql:
- Email: demo@skillswap.ai
- Password: password123

## Important
This is a complete project starter intended to be customized with your college details, screenshots, project members, and final report. Replace demo credentials before deployment.
