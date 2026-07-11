# 🍔 Food Time — Online Food Delivery System

A **production-ready, microservice-based food delivery web application** built with Java 21, Spring Boot 3, React 19, JWT authentication, and role-based access control — styled like **Swiggy / Zomato**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://food-time.vercel.app)
[![Backend API](https://img.shields.io/badge/API-Render-46E3B7?logo=render)](https://food-time-api.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-Bala4107-181717?logo=github)](https://github.com/Bala4107/food-develier)

---

## ✨ Features

### 👤 Customer (USER)
- 🔐 JWT-based Register / Login
- 🍽️ Browse food menu with categories (Breakfast, Main Course, Drinks & Dessert)
- 🛒 Add/remove items from cart with quantity controls
- 📦 Place orders with real-time status updates
- 📍 Live order tracking with step-by-step timeline
- 🚴 Delivery partner info card (name, phone, vehicle, ETA) on dispatch
- 📋 Full order history

### 🛡️ Admin
- 🔐 Role-based login redirects to Admin Dashboard
- 📊 Live metrics: Total Orders, Pending, Preparing, Delivering, Delivered, Revenue
- 🗃️ Sortable, filterable orders table with search
- 🎛️ Order Action Console: Approve → Verify Payment → Start Cooking → Food Ready → Dispatch → Deliver
- 🔄 Auto-refresh every 2 seconds

---

## 🏗️ Architecture

```
React Frontend (Vercel)
        │
        │ HTTPS / JWT
        ▼
order-service (Render) :8081
  ├── Spring Security + JWT Auth
  ├── H2 In-Memory Database
  ├── Camunda BPM Engine (manual admin workflow)
  └── Embedded ActiveMQ (vm://)
```

> The payment, kitchen, and delivery microservices are included in the repository for the full event-driven architecture but are not required for the deployed admin-controlled workflow.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Bootstrap 5, Bootstrap Icons |
| Backend | Java 21, Spring Boot 3.2, Spring Security |
| Auth | JWT (jjwt 0.11.5), BCrypt |
| Database | H2 In-Memory (MySQL-compatible mode) |
| Workflow | Camunda BPM 7.21 (manual admin control) |
| Messaging | Apache ActiveMQ Classic 6 (embedded) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Live URLs

| Service | URL |
|---|---|
| 🌐 Frontend (Vercel) | https://food-time.vercel.app |
| ⚙️ Backend API (Render) | https://food-time-api.onrender.com |
| 📖 API Docs | https://food-time-api.onrender.com/api/orders |

> **Note:** The Render free tier sleeps after 15 min of inactivity. First request may take ~30s to wake up.

---

## 🔑 Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `admin` |
| Demo User | `user@demo.com` | `demo123` |

> You can also register new USER accounts from the Register tab on the login page.

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/register   - Register new user
POST /api/auth/login      - Login and receive JWT token
```

### Orders
```
GET    /api/orders          - Get all orders
POST   /api/orders          - Place a new order
GET    /api/orders/{id}     - Get order by ID
PUT    /api/orders/{id}/status?status=ORDER_ACCEPTED  - Update order status
```

### Order Status Flow
```
WAITING_FOR_APPROVAL → ORDER_ACCEPTED → PAYMENT_VERIFIED
  → FOOD_PREPARING → FOOD_READY → OUT_FOR_DELIVERY → DELIVERED

Rejection path:
WAITING_FOR_APPROVAL → REJECTED
```

---

## 🖥️ Local Development

### Prerequisites
- Java 21+
- Node.js 18+
- Maven 3.9+ (included in `.maven/`)

### Start Backend
```bash
# Stop any running instance first, then:
.maven\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests -pl order-service
java -jar order-service/target/order-service-1.0.0-SNAPSHOT.jar
```

Backend starts at: http://localhost:8081

### Start Frontend
```bash
cd react-frontend
npm install
npm run dev
```

Frontend starts at: http://localhost:5173

---

## ☁️ Deployment Guide

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo (`Bala4107/food-develier`)
3. Configure:
   - **Build Command:** `cd order-service && ./../.maven/apache-maven-3.9.6/bin/mvn clean package -DskipTests`
   - **Start Command:** `java -jar order-service/target/order-service-1.0.0-SNAPSHOT.jar`
   - **Runtime:** Java
4. Set Environment Variables:
   ```
   JWT_SECRET=<generate-a-strong-64-char-secret>
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → Import Project from GitHub
2. Select repo `Bala4107/food-develier`
3. Set **Root Directory** to `react-frontend`
4. Set Environment Variable:
   ```
   VITE_API_BASE_URL=https://food-time-api.onrender.com
   ```
5. Click Deploy

---

## 🔐 Environment Variables Reference

### Backend (Render)
| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Min 64-char secret for JWT signing |
| `CORS_ALLOWED_ORIGINS` | ✅ | Your Vercel frontend URL |
| `PORT` | Auto | Injected by Render automatically |

### Frontend (Vercel)
| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | Your Render backend URL (no trailing slash) |

---

## 📁 Project Structure

```
food-develier/
├── order-service/          # Main backend (Spring Boot + JWT + Camunda)
│   └── src/main/java/com/food/order/
│       ├── config/         # Security, JWT, CORS, DataInitializer
│       ├── controller/     # Auth + Order REST APIs
│       ├── entity/         # Order, User, Role
│       ├── service/        # Business logic
│       └── repository/     # JPA repositories
├── payment-service/        # Payment microservice (port 8082)
├── kitchen-service/        # Kitchen microservice (port 8083)
├── delivery-service/       # Delivery microservice (port 8084)
├── react-frontend/         # React 19 + Vite frontend
│   ├── src/
│   │   ├── App.jsx         # Root: auth, routing, polling
│   │   ├── Login.jsx       # Login/Register page
│   │   ├── UserDashboard.jsx  # Customer: menu, cart, tracking
│   │   └── AdminDashboard.jsx # Admin: order management
│   └── vercel.json         # Vercel SPA routing config
├── render.yaml             # Render deployment config
├── docker-compose.yml      # Local MySQL + ActiveMQ (optional)
└── schema.sql              # Database schema reference
```

---

## 📸 Screenshots

> Login → User Dashboard → Place Order → Live Tracking → Admin Dashboard

---

## 👨‍💻 Author

**Bala** — [@Bala4107](https://github.com/Bala4107)

---

## 📄 License

MIT License — feel free to use and modify.
