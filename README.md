# Agora Frontend (standalone)

Next.js app. Extracted from monorepo; original code moved as-is.

## Setup

1. Copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_URL` to your backend URL (e.g. `http://localhost:4000`).
2. `npm install`
3. Start dev server: `npm run dev`

## Generate API client

With the backend running, from this directory:

```bash
npm run generate-client
```

This fetches the Swagger spec from `NEXT_PUBLIC_API_URL` and generates the client in `src/lib/api/generated`.
