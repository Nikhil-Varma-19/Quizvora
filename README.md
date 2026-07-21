# 🚀 Quizvora

> A real-time multiplayer quiz platform inspired by **Kahoot** and **Mentimeter**, supporting both **Predefined** and **Live** quiz modes. Hosts create a room, participants join with a short room code, everyone answers in real time over Socket.IO, and a leaderboard closes out the session.

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React](https://img.shields.io/badge/React-Vite-61DAFB)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)

---

## 📖 Overview

Quizvora is a real-time multiplayer quiz platform where hosts create interactive quizzes and participants join using a room code. Hosts can run a room in **live** mode (authoring questions on the fly) or **predefined** mode (authoring everything upfront), and participants can join as a guest or a registered user.

The platform supports:

- 📚 Predefined Quiz Mode
- ⚡ Live Quiz Mode
- 🎯 MCQ & Written Questions
- 👥 Guest & Registered Users
- 🏠 Room-based Multiplayer Sessions
- 📊 Real-time Answer Statistics
- 🏆 Live Leaderboard
- 🔄 Socket.IO-powered Communication

---

## ✨ Features

### 👨‍💼 Host / Admin

- Create quiz rooms
- Select quiz mode (Predefined / Live)
- Create MCQ & written questions
- Edit / delete questions (Predefined mode)
- Start & end the quiz
- Navigate between questions
- View live answer statistics
- View written answers in real time

### 👥 Participants

- Join using a room code
- Guest or registered login
- Receive questions in real time
- Submit MCQ & written answers
- View live results
- View the leaderboard
- Join an ongoing quiz

---

## 🎯 Quiz Modes

### 📚 Predefined Mode

- Create all questions before starting the quiz.
- Edit or delete questions before the quiz starts.
- Questions become locked once the quiz begins.

### ⚡ Live Mode

- Questions are created during the quiz.
- Questions can only be created after the quiz has started.
- Every new question is instantly broadcast to all participants.

---

## 🛠️ Tech Stack

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS v4
- react-router-dom
- axios
- socket.io-client
- zustand
- lucide-react

### Backend

- Node.js
- Express.js
- TypeScript
- Socket.IO
- MongoDB + Mongoose
- Redis

### DevOps

- Docker
- Docker Compose

---

## ⚙️ Getting Started

### 1. Backend

The backend must be running on **`http://localhost:7000`** before you start the frontend.

Bring it up (with Docker Compose, or however your backend is configured), then confirm it's listening on port `7000`.

### 2. Frontend

```bash
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:7000` (see `vite.config.ts`). This is also what sidesteps CORS, since the backend has no CORS middleware of its own.

All frontend requests use relative paths (`/api/...`) and connect the socket to same-origin, so this works:

- **In dev** — via the Vite proxy.
- **In prod** — as long as the frontend is served from (or fronted by a reverse proxy in front of) the same origin as the API.

`VITE_API_ORIGIN` is an optional env var fallback for a non-proxied prod deploy — set it and the socket client will connect there explicitly instead of same-origin.

---

## 🧩 Known Backend Quirks the Frontend Works Around

These are intentional workarounds on the frontend, not bugs in it — the backend itself is out of scope to change:

- **`room:create` never returns the room's `mode`** (`live` / `predefined`) in either the REST response or the socket ack. The frontend remembers whatever mode the host just submitted in local / zustand state instead of reading it back.
- **Member / leaderboard objects have no id field** (`player:list:update`, `quiz:ended` leaderboard) — lists are keyed by array index + name, never by id.
- **MCQ live stats are not broadcast.** `question:stats` (type `mcq`) is emitted only to the participant who just answered, never to the room or host. Written-answer stats are emitted only to the host. The UI is built honestly around this: participants get their own answer breakdown, hosts get a live written-response feed, and there is no room-wide shared stats view for MCQ.
- **Composing a live question is two steps.** Live mode's `POST /api/live-question/:roomId` does not broadcast anything by itself — the host still has to fire `question:next` afterwards to reveal it, so the host console treats these as two separate steps.
- **`quiz:start`'s `quiz:started` broadcast excludes the host's own socket**, and (in live mode) no `question:show` is emitted until the next question is actually advanced to. The host console therefore navigates itself to the live screen straight off the `quiz:start` ack instead of waiting on a broadcast that may never reach it.

---

## 🚧 Project Status

This project is currently under active development. New features and improvements are being added continuously.

---

## 👨‍💻 Author

**Nikhil Varma**

Backend Developer | Node.js | TypeScript | NestJS | Socket.IO | MongoDB | PostgreSQL | Redis | Docker

⭐ If you find this project helpful, consider giving it a **Star** on GitHub!