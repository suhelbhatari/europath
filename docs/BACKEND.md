# Backend API Setup Guide

Node.js + Express REST API.

## Prerequisites
- Node.js 18+, npm 9+

## Quick Start
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# http://localhost:3001/api/docs
```

## Environment Variables
```env
PORT=3001
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
CORS_ORIGINS=http://localhost:5173,https://europath.app
```

## Scripts
```bash
npm run dev      # hot-reload (nodemon)
npm run start    # production
npm run test     # Jest
npm run lint     # ESLint
```

## Deploy

**Railway**
```bash
npm i -g @railway/cli
railway login && railway init && railway up
```

**Render** — connect repo, root dir `backend`, build `npm install`, start `node src/index.js`

**Fly.io**
```bash
npm i -g flyctl
flyctl launch && flyctl deploy
```

## Project Structure
```
backend/src/
├── index.js          Server entry + Swagger config
├── controllers/       countries.js, pathways.js, compare.js, search.js, stats.js
├── routes/api.js      Route definitions
└── models/countries.js  Data store (generated from countries.json)
```
