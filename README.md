# Alakh Kirpa Water Solutions - Service Management System

A full-stack enterprise web application designed for **Alakh Kirpa Water Solutions** to manage customer records, RO water purifier service history, automated 6-month maintenance reminders, payment modes, and invoice generation.

---

## Architecture Overview

- **Frontend (`/client`)**: React 19, Vite, React Router 7, Lucide Icons, jsPDF.
- **Backend (`/server`)**: Node.js, Express 5, Mongoose 9, JWT Authentication, bcryptjs.
- **Database**: MongoDB (Local development or MongoDB Atlas Cloud).
- **Deployment**: Render (Backend API) & Vercel (Frontend SPA).

---

## Features

- **Admin Portal**:
  - Live statistics dashboard (total customers, service visits, revenue).
  - Customer directory with instant search, phone number, and address records.
  - Complete service timeline with parts replaced, cost breakdown, and payment mode (**Cash**, **Online / UPI**, **Bank Transfer**).
  - Automated 6-month service due calculation (ignores non-routine repair visits so regular cycles remain accurate).
  - Dedicated **Reminders Dashboard** highlighting upcoming and overdue maintenance.
- **Customer Portal**:
  - Direct login for customers using registered phone numbers.
  - Full view of water purifier service history and maintenance logs.
  - One-click branded PDF invoice generation and download.
- **Visual Design**:
  - Dark mode glassmorphic UI with dynamic fluid water animations.
  - Fully responsive across mobile, tablet, and desktop viewports.

---

## Project Structure

```
AquaTrack/
├── client/                 # React Vite frontend
│   ├── src/
│   │   ├── pages/          # Login, Admin, and Customer views
│   │   ├── utils/          # API helpers
│   │   └── index.css       # Theme styling & water wave animations
│   ├── vercel.json         # SPA routing configuration for Vercel
│   └── package.json
├── server/                 # Express backend API
│   ├── middleware/         # JWT verification & RBAC
│   ├── models/             # Mongoose schemas (User, ServiceRecord)
│   ├── routes/             # Admin, Customer, and Auth endpoints
│   ├── server.js           # Server entry point & auto-seed logic
│   └── package.json
├── .gitignore              # Root git ignore
├── start.bat               # Windows local startup script
└── README.md
```

---

## Local Development Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port 27017

### 2. Quick Start (Windows)
Double-click `start.bat` in the root folder. It will automatically start both the backend API (port 5000) and the frontend client (port 5173).

### 3. Manual Startup
**Backend**:
```bash
cd server
npm install
node server.js
```

**Frontend**:
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Cloud Deployment Guide

### Step 1: MongoDB Atlas (Cloud Database)
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `admin_alakh`) with a password.
4. Under **Network Access**, add IP address `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
5. Click **Connect** -> **Drivers** (Node.js) and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/alakh_kirpa?retryWrites=true&w=majority
   ```

*(Optional: To migrate existing customer data into MongoDB Atlas, run:)*
```bash
cd server
node import-data.js "YOUR_MONGODB_ATLAS_CONNECTION_STRING"
```

---

### Step 2: Deploy Backend to Render
1. Push your repository to GitHub.
2. Log in to [render.com](https://render.com) and click **New +** -> **Web Service**.
3. Select your GitHub repository.
4. Configure service settings:
   - **Name**: `alakh-kirpa-backend` (or your choice)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/alakh_kirpa?retryWrites=true&w=majority`
   - `JWT_SECRET`: A long secure random string
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://alakh-kirpa-backend.onrender.com`).
*(On initial start, the server will automatically seed the initial admin account: Phone: `admin`, Password: `admin`)*.

---

### Step 3: Deploy Frontend to Vercel
1. Log in to [vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Select your GitHub repository.
3. In project configuration:
   - **Root Directory**: Click edit and select `client`.
   - **Framework Preset**: `Vite` (automatically detected).
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g. `https://alakh-kirpa-backend.onrender.com`)
5. Click **Deploy**.
6. Once deployed, open your Vercel URL. You can now log into your live, cloud-hosted system!

---

## License
Proprietary software for Alakh Kirpa Water Solutions. All rights reserved.
