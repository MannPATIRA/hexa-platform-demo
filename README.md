# Hexa Platform Demo

Order management platform with an Outlook add-in that captures email attachments (handwritten order notes, PDFs) and sends them for processing. The platform parses line items and shows match status against a product catalog.

## Quick Start (Local Development)

This repository contains the **Next.js frontend** and a sibling **`hexa-platform-api`** folder with the standalone Node API (same stack as before: Upstash Redis / in-memory, Nodemailer, etc.). Run both processes locally.

**1. API (port 4000)**

```bash
cd hexa-platform-api
npm install
cp .env.example .env   # optional: KV, SMTP, Graph
npm run dev
```

**2. Web (port 3000)**

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard and [http://localhost:3000/taskpane](http://localhost:3000/taskpane) for the Outlook taskpane preview.

To use this frontend as its **own Git repo**, keep the root as the web app and copy or submodule `hexa-platform-api` into a separate remote repository.

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Framework preset will auto-detect as Next.js — deploy with defaults
4. Note your Vercel URL (e.g., `https://hexa-platform-demo-2bnr.vercel.app`)

### Update the manifest with your domain

After deploying, open `public/manifest.xml` and replace every instance of `YOUR_VERCEL_DOMAIN` with your actual Vercel domain (without `https://`).

For example, replace:
```
https://YOUR_VERCEL_DOMAIN/taskpane
```
with:
```
https://hexa-platform-demo-2bnr.vercel.app/taskpane
```

Then commit and push again so Vercel redeploys with the correct URLs.

## Sideloading the Outlook Add-in

### Account requirement

Sideloading custom add-ins requires a **Microsoft 365 Business, Enterprise, or Education** account (or a free [Microsoft 365 Developer Program](https://developer.microsoft.com/en-us/microsoft-365/dev-program) account). Personal Outlook.com accounts do not support this.

### Steps

1. Open [Outlook on the web](https://outlook.office.com) and sign in
2. Navigate to [https://aka.ms/olksideload](https://aka.ms/olksideload)
3. Scroll to **Custom Addins** at the bottom
4. Click **Add a custom add-in** > **Add from File...**
5. Upload the `manifest.xml` file (download it from your deployed Vercel app at `https://YOUR_VERCEL_DOMAIN/manifest.xml`, or use the file directly from the repo)
6. Wait a few minutes for the add-in to appear
7. Open any email with a PDF or image attachment — click the **Send to Hexa** button in the toolbar

## Azure App Registration (Optional)

For the basic demo, Azure App Registration is **not required** since the add-in uses Office.js APIs directly (no SSO or Microsoft Graph calls).

If you want to add SSO or Graph integration later:

1. Go to [Microsoft Entra admin center](https://entra.microsoft.com)
2. Navigate to Identity > Applications > App registrations
3. Click **New registration**
   - Name: `Hexa Platform Outlook Add-in`
   - Supported account types: **Accounts in any organizational directory and personal Microsoft accounts**
   - Redirect URI: Web — `https://YOUR_VERCEL_DOMAIN/taskpane`
4. Note the **Application (client) ID**
5. Under API permissions, add `Mail.Read` (delegated)
6. Under Certificates & secrets, create a new client secret

## Tech Stack

- **Next.js** (App Router) — platform + Outlook taskpane UI
- **`hexa-platform-api`** — standalone Node server ([Hono](https://hono.dev)) exposing the same `/api/*` routes as before
- **Tailwind CSS + shadcn/ui** — UI components
- **Office.js** — Outlook add-in SDK
- **Upstash Redis** (optional `KV_*`) or **in-memory** — order/shipment persistence on the API
- **Vercel** — typical hosting for the frontend; run the API on any Node host (Railway, Render, Fly.io, etc.)
