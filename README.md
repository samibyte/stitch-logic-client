# StitchLogic — Client Side

**Garments Order & Production Tracker System (Frontend)**

## 📌 Project Overview

**StitchLogic** is a modern, role-based web application designed to manage garment orders, production workflows, and tracking processes for small to medium-scale garment factories.  
This repository contains the **client-side (frontend)** implementation, built with a focus on performance, scalability, clean UX, and real-world production standards.

The system supports **Buyers, Managers, and Admins**, each with clearly defined permissions and workflows—from product browsing and order placement to approval, tracking, and analytics.

---

## 🌐 Live Site

🔗 **Live URL:** [Link](https://stitch-logic.web.app/)

---

## ✨ Key Features

- **Role-Based UI & Routing**
  - Buyer, Manager, and Admin dashboards
  - Protected routes using JWT/Firebase authentication
- **Modern UI/UX**
  - Fully responsive (mobile, tablet, desktop)
  - Dark / Light theme toggle
  - Consistent design system with Radix UI & Tailwind CSS
- **Authentication**
  - Email & password login
  - Social login (Google or GitHub)
  - Secure session handling with cookies
- **Product Management**
  - Product listing, details, and booking flow
  - Conditional actions based on role & account status
- **Order Lifecycle**
  - Booking, approval, rejection, cancellation
  - Production tracking timeline (read-only for buyers)
- **Data Handling**
  - Real backend integration (MongoDB)
  - Loading states and global error handling
- **Developer Experience**
  - Modular component structure
  - Reusable forms, modals, and UI components
  - Meaningful commit history

---

## 🧩 Tech Stack

### Core

- React 19
- TypeScript
- Vite

### State & Data

- TanStack React Query
- Axios

### UI & Styling

- Tailwind CSS
- Radix UI
- Framer Motion
- Lucide / Tabler Icons
- Embla Carousel

### Forms & Validation

- React Hook Form
- Zod
- @hookform/resolvers

### Auth & Utilities

- Firebase Authentication
- SweetAlert2
- Sonner (Toast Notifications)
- date-fns
- next-themes

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/             # Route-level pages
├── layouts/           # Main & Dashboard layouts
├── hooks/             # Custom hooks
├── services/          # API & Axios configuration
├── routes/            # Route guards & definitions
├── contexts/          # Auth & theme context
├── utils/             # Helper functions
└── assets/            # Static assets
```

---

## 🔐 Environment Variables

Create a `.env` file at the root of the project:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=your_server_base_url
```

> ⚠️ Ensure your deployed domain is added to Firebase authorized domains.

---

## 🚀 Getting Started

```
npm install
npm run dev
npm run build
npm run preview
```

---

## 🧪 Quality & Standards

- ESLint and Prettier enforced
- Tailwind class sorting enabled
- Loading spinner during API calls
- Dynamic page titles per route
- 404 Not Found page implemented
- Page refresh safe on all private routes

## 📂 Related Repositories

- **Server Repository:** [Link](https://github.com/samibyte/stitch-logic-server)

---

## 👤 Author

**Adnan Sami**  
Full Stack Developer
