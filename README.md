# Imprynt Platform

Secure digital identity platform delivered via NFC accessories (rings, bracelets, fingertips).

## Quick Start

```bash
# Start everything
docker compose up --build

# Access the app
# Via nginx (port 80): http://localhost
# Direct to Next.js (port 3000): http://localhost:3000
```

## Architecture

| Service | Port | Description |
|---------|------|-------------|
| app | 3000 | Next.js (frontend + API) |
| db | 5432 | PostgreSQL |
| nginx | 80 | Reverse proxy, rate limiting |

## Project Structure

```
imprynt/
├── docker-compose.yml     # Container orchestration
├── Dockerfile             # Next.js container
├── db/
│   └── init.sql           # Database schema (auto-runs on first start)
├── nginx/
│   └── nginx.conf         # Reverse proxy config
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx    # Login page
│   │   │   └── register/page.tsx # Registration page
│   │   ├── dashboard/page.tsx    # User dashboard
│   │   ├── [slug]/page.tsx       # Public profile page
│   │   ├── r/[userId]/route.ts   # NFC redirect handler
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # Auth.js handlers
│   │       └── register/route.ts            # User registration
│   ├── lib/
│   │   ├── auth.ts        # Auth.js configuration
│   │   └── db.ts          # Database connection
│   └── middleware.ts       # Route protection
└── public/
    └── robots.txt          # Anti-scraping
```

## Database

PostgreSQL schema includes tables for: users, profiles, protected_pages, links, analytics_events, pin_attempts, accessories, contacts (V2), sessions, verification_tokens.

Schema auto-initializes on first `docker compose up`. To reset: `docker compose down -v` then `docker compose up --build`.

## Environment Variables

Copy `.env.local` and update for your environment. Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - App URL
- `NEXTAUTH_SECRET` - Auth.js secret (generate a real one for production)

## Tech Stack

Next.js 15, React 19, PostgreSQL 16, Auth.js v5, Docker, nginx
