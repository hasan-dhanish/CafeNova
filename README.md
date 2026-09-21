# CaféNova ☕✨

**CaféNova** is a modern, production-oriented Smart Café Ordering & Operations Management Web Application built with **Next.js 16 (Turbopack, App Router)**, **TypeScript**, and **Prisma ORM**.

Designed around a warm artisan aesthetic (*terracotta `#A04322`, espresso `#382319`, porcelain cream `#FAF7F2`*), CaféNova provides two cleanly integrated experiences powered by a single authoritative backend:
1. **Customer Menu Card WebApp** (`/menu`): Frictionless table ordering with zero login required, interactive 3D/AR food previews, basket recommendations, instant cart, and payment options.
2. **Café Management WebApp** (`/admin`): Staff and management workstation featuring a live Kitchen Display System (KDS) Kanban board with audio alerts, floor plan table manager with 1-click printable QR cards, 86'd sold out catalog toggles, inventory tracking, and sales analytics.

---

## 🌟 Key Features

### Customer Menu Card WebApp
- **Frictionless QR Table Ordering**: Tables scoped via encrypted tokens (`/menu?table=T01`) — no forced customer sign-up.
- **Interactive 3D / AR Viewer**: Three.js WebGL model viewer with 360° touch orbit, auto-spin, and WebXR camera table placement for signature menu items.
- **Smart Recommendations**: "Pairs Well With" shelf driven by basket co-occurrences and kitchen pairings.
- **Server-Authoritative Calculations**: Item pricing, customization modifiers, and 5% GST calculated strictly server-side.
- **Payment Flexibility**: Instant UPI, Credit/Debit Cards, and Pay at Counter with HMAC-SHA256 signature verification.
- **Live Order Progress Tracker**: Real-time 5-stage status pipeline (`/orders/[id]`).

### Café Management WebApp
- **Kitchen Display System (KDS)**: 3-column Kanban (`PENDING` → `PREPARING` → `READY` → `SERVED`) with live elapsed timers and hands-free Web Audio alert chimes.
- **Floor Seating & QR Card Generator**: Real-time table occupancy grid with printable table tent QR cards.
- **Instant 86'd Catalog Control**: One-tap sold-out toggle for menu items.
- **Inventory & Low-Stock Alerts**: Ingredient monitoring with automatic threshold warnings and instant restock buttons.
- **Real Business Analytics**: Database-aggregated gross revenue, order volume, AOV, popular items, peak ordering hours, and AR conversion metrics.
- **Role-Based Access Control (RBAC)**: Secure HttpOnly cookie sessions supporting `OWNER`, `MANAGER`, and `BARISTA` roles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5.6
- **Database & ORM**: Prisma ORM with SQLite (`file:./dev.db`) / PostgreSQL ready
- **3D & AR Graphics**: Three.js (WebGL, ACES filmic tone mapping, WebXR)
- **Styling**: Vanilla CSS Design Tokens (Strictly avoids generic hype-gradients)
- **Icons**: Lucide React
- **Validation**: Zod & Bcryptjs

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/hasan-dhanish/CafeNova.git
cd CafeNova
npm install
```

### 2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="cafenova-production-secure-key-32-chars-min"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Seed
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Demo Credentials

Staff accounts are pre-seeded in the database:

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `admin@cafenova.com` | `CafeNova@2026` | Full Access (KDS, Tables, Menu, Inventory, Analytics) |
| **Barista** | `barista@cafenova.com` | `CafeNova@2026` | Operations (KDS, Order Status) |

*(Quick-fill demo buttons are available on the `/login` screen)*

---

## 🌐 Production Deployment

### Deploying to Vercel / Railway / Render
1. Push this repository to GitHub.
2. Import the repository into **Vercel** or **Railway**.
3. Set the Environment Variables:
   - `DATABASE_URL`: Your database connection string (e.g. Supabase PostgreSQL or Turso SQLite).
   - `SESSION_SECRET`: A secure 32+ character random secret string.
   - `NEXT_PUBLIC_APP_URL`: Your production domain URL.
4. Build command: `npm run build` (Prisma client will generate automatically via `postinstall`).

---

## 📄 License
MIT License. Created for artisan dining and smart café operations.
