# SkillSwap AI — Deployment Guide

## Recommended architecture

GitHub → source code
Railway → MySQL database
Render → Node.js/Express backend
Render → Python/FastAPI AI service
Vercel → React/Vite frontend

## 1. GitHub

Create a GitHub repository and upload the project.

IMPORTANT:
- Do not upload `.env` files.
- Keep `.env.example` files.
- Never put database passwords or JWT secrets in GitHub.

## 2. Railway MySQL

Create a MySQL service in Railway.

Use the Railway MySQL credentials in the Render backend environment variables.

Import:
- database/schema.sql
- database/seed.sql

## 3. Render backend

Create a Web Service from the GitHub repository.

Settings:
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:
- PORT=5000
- DB_HOST=Railway host
- DB_PORT=3306
- DB_USER=Railway user
- DB_PASSWORD=Railway password
- DB_NAME=skillswap
- JWT_SECRET=your-long-random-secret
- AI_SERVICE_URL=https://YOUR-AI-SERVICE.onrender.com
- FRONTEND_URL=https://YOUR-FRONTEND.vercel.app

## 4. Render AI service

Create another Web Service.

Settings:
- Root Directory: `ai-service`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

## 5. Vercel frontend

Import the GitHub repository into Vercel.

Settings:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:
- VITE_API_URL=https://YOUR-BACKEND.onrender.com/api

## 6. Final connection

After deployment, replace the placeholder URLs with the actual URLs from:
- Render backend
- Render AI service
- Vercel frontend

Redeploy the services after changing environment variables.

## 7. Test

Test:
- Register
- Login
- Profile
- Skills I Know
- Skills I Want to Learn
- Skill search
- AI recommendations
- Swap requests
- Chat
- Notifications
- Admin dashboard
