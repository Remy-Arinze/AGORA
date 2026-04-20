# Agora Frontend

Next.js 14 App Router — school management dashboard for all user roles.

## Quick Start

```bash
cp .env.example .env         # Set NEXT_PUBLIC_API_URL
npm install
npm run dev                  # http://localhost:3000
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL, e.g. `http://localhost:4000` |

## Generate API Client

With the backend running:
```bash
npm run generate-client
# Fetches Swagger JSON from NEXT_PUBLIC_API_URL and generates RTK Query hooks
# Output: src/lib/api/generated/
```

## Architecture

See [`FRONTEND_ARCHITECTURE.md`](./FRONTEND_ARCHITECTURE.md) for the full documentation.
