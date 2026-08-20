# POS System — Point of Sale & Business Management Platform

A POS and business-management system built for Kenyan retail businesses (KES currency, M-Pesa-ready payments). Covers sales, products, inventory, customers, orders, suppliers, expenses, employees, and reporting.

## What's in this repo

```text
pos-project/
├── client/     React + Vite frontend — fully functional POS UI (see below)
├── server/     Express + TypeScript + Prisma API skeleton (PostgreSQL)
└── package.json
```

### Current state — read this first

- **`client/`** is a complete, working POS application. It runs standalone: `App.jsx` persists all data (products, orders, customers, etc.) to the browser via a `window.storage` shim backed by `localStorage` (see `client/src/lib/storageShim.js`). You can `npm install && npm run dev` and use the entire app immediately — dashboard, POS checkout, inventory, customers, orders, refunds, reports, settings — with data that survives page reloads.
- **`server/`** is a real Express + Prisma + PostgreSQL skeleton: full schema (`prisma/schema.prisma`), JWT auth, role-based middleware, and working route handlers for auth, products, sales/checkout, customers, inventory adjustments, and reports. It is **not yet wired into the client** — the client currently talks to `localStorage`, not this API.
- **`client/src/services/api.js`** is a small REST client ready to use once you connect the two — swap the `window.storage` calls in `App.jsx` for `api.get/post/...` calls against these endpoints.

This structure lets you run and demo the POS today, and migrate state onto a real database at your own pace without a rewrite.

## Features implemented in the client app

- Secure-feeling login screen (checks against seeded staff records)
- Dashboard with live KPIs, 7-day revenue chart, payment-method breakdown, top products, profitability
- POS / New Sale: product search & category filters, cart, order discounts, tax calculation, checkout (Cash / M-Pesa / Card / Bank) with change calculation, automatic stock deduction, generated receipt
- Products: full CRUD with validation, low/out-of-stock badges
- Inventory: stock value, low-stock alerts, one-click restock
- Customers: CRUD, profile view with real order history & spend
- Orders: status tabs, order detail, working refund flow (restores stock)
- Suppliers, Expenses, Employees: CRUD
- Reports: profit report (COGS/expenses/net profit), sales-per-employee, top customers
- Branches, Settings (business info, currency, tax rate)
- Toasts, confirmation dialogs, empty states, form validation throughout

## Features scaffolded on the server but not yet connected

- PostgreSQL schema covering the full domain (Business, Branch, User, Product, Category, Supplier, Customer, Order, OrderItem, Payment, Refund, InventoryMovement, Expense, AuditLog, Notification)
- JWT auth with httpOnly cookies, bcrypt password hashing, role-based route guards
- Atomic checkout transaction (`POST /api/sales`) that creates the order + payment and decrements stock in one DB transaction
- Inventory adjustment endpoint with audit logging

## Not implemented (flagged honestly)

- M-Pesa Daraja STK Push integration — env vars are wired (`server/.env.example`), but the actual API calls to Safaricom are not implemented
- PDF generation, emailed receipts, QR/barcode generation, receipt history/verification pages
- PWA service worker / offline sync queue
- Multi-branch data isolation enforced server-side (schema supports it; route filtering by branch is not yet applied everywhere)

---

## Getting started

### 1. Frontend only (fastest way to see the app)

```bash
cd client
npm install
npm run dev
```

Open the printed local URL. Log in with `admin@example.com` (or `alice@example.com`, `kevin@example.com`) and any password — the demo login just matches against seeded employee records.

### 2. Full stack (frontend + real database)

Requires PostgreSQL running locally or a connection string from a host (Supabase, Railway, Render, etc.).

```bash
cd server
cp .env.example .env
# fill in DATABASE_URL, JWT_SECRET, SEED_ADMIN_PASSWORD, etc.
npm install
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

In another terminal:

```bash
cd client
cp .env.example .env
# set VITE_API_URL to http://localhost:4000
npm install
npm run dev
```

Note: the client's data calls are not yet pointed at the API (see "Current state" above) — this step gets the server running and ready to connect.

## Environment variables

See `server/.env.example` and `client/.env.example`. Never commit a real `.env` file. Secrets (DB credentials, JWT secret, M-Pesa credentials, SMTP credentials) live only on the server.

## Default admin account

Set via `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` before running `npm run prisma:seed`. There is no hardcoded production password anywhere in the codebase.

## Production build

```bash
npm run build:client   # outputs client/dist — deploy to Vercel/Netlify
npm run build:server   # outputs server/dist — deploy to Railway/Render
```

## Deployment notes

- Frontend: any static host (Vercel, Netlify) — set `VITE_API_URL` to your deployed API URL.
- Backend: Railway, Render, or any Node host — set all `server/.env` variables in the host's dashboard, never in code.
- Database: any managed PostgreSQL (Supabase, Railway, Render, RDS).

## Security notes

- Passwords are hashed with bcrypt; sessions use httpOnly JWT cookies.
- Rate limiting is applied to `/api/auth/*`.
- No secrets are present in client code or committed files — only `.env.example` placeholders.
- Role-based middleware (`requireRole`) gates destructive/sensitive routes; extend this as you add more endpoints.

## Future improvements

- Wire `client/src/services/api.js` into `App.jsx` to replace the localStorage shim
- Implement M-Pesa STK Push, PDF receipt generation, email delivery, QR verification
- Enforce branch-scoped queries throughout the API
- Add automated tests (API + component)
- PWA manifest is present (`client/public/manifest.webmanifest`); add a service worker for offline support
