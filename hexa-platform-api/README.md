# Hexa Platform API

Standalone Node server for the Hexa demo. It exposes the same HTTP routes previously implemented as Next.js Route Handlers (`/api/orders`, `/api/shipments`, procurement, webhooks, etc.).

## Stack

- **Node.js** + **TypeScript** + **[Hono](https://hono.dev)**
- **@upstash/redis** — optional persistence (same `KV_REST_API_URL` / `KV_REST_API_TOKEN` as Vercel KV)
- **Nodemailer** — demo emails and shipment notifications (when configured)

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Default port: **4000** (`PORT`).

## Environment

See `.env.example`. Match **CORS_ORIGINS** to your frontend origin (e.g. `http://localhost:3000`). The Next.js app should set **`NEXT_PUBLIC_API_URL`** to this server’s public URL (no trailing slash).

## Split into its own Git repository

This folder is self-contained under `hexa-platform-demo/hexa-platform-api`. You can move it to a sibling directory and `git init` there, or use `git subtree split` / a copy, depending on your workflow.
