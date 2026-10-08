# TYPEFORGE

Typing learning, tests, racing and battles. Built in phases; each phase is a git branch.

## Phase 4: intermediate, advanced, pro practice
`/practice` hub, `/intermediate`, `/advanced` (incl. code in 8 languages), `/pro` (extreme, long-form, programming, random, competitive, custom text). Modes unlock by level (best WPM from typing tests); the server enforces this. API: `GET /api/practice/options`, `GET /api/practice/new`, `POST /api/practice/custom`. Results go through `POST /api/tests/result`; custom-text results never earn XP, level or records. Branch: `git checkout -b phase-4-practice-modes`.

## Phase 3: beginner touch-typing course
12 lessons, interactive keyboard with finger colors, hand diagram, Shift guidance. API: `GET /api/lessons`, `GET /api/lessons/:id`, `POST /api/lessons/:id/progress` (server pins the lesson text in a signed token, verifies counts and timing, awards XP once per lesson). Also: test result tokens are now single-use. Branch: `git checkout -b phase-3-beginner-course`.

## Phase 2: landing page, dashboard, typing test
New: `GET /api/tests/new` (public, returns a signed passage token), `POST /api/tests/result` (auth; server recomputes WPM/accuracy from the passage, checks timing, flags suspicious runs), `GET /api/progress`. Branch: `git checkout -b phase-2-landing-test`.

## Phase 1: setup + authentication
React + TypeScript + Vite + Tailwind client, Express + TypeScript + MongoDB server, JWT auth in an httpOnly cookie.

### Run
1. `cp .env.example .env` and set `JWT_SECRET` (long random string). Never commit `.env`.
2. Start MongoDB locally or use a MongoDB Atlas URI in `MONGODB_URI`.
3. `npm install`
4. `npm run dev` (client http://localhost:5173, API http://localhost:4000)
5. `npm run test`, `npm run build`

### API
`POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/health`

### Git
```
git init && git checkout -b phase-1-setup-auth
git add . && git commit -m "Phase 1: setup and auth"
```
Later phases arrive as new zips; unzip over the project on a new branch (`phase-2-...`).

### Deployment
Client: Netlify/Vercel (`client/public/_redirects` handles SPA routing; set the API URL/proxy). Server: Render/Railway/Fly (long-running Node host, not Netlify static).
