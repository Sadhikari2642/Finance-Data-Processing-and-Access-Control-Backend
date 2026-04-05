
# 💰 FinanceDash — Backend System

> A production-grade REST API backend for a Finance Dashboard Application with Role-Based Access Control (RBAC), JWT Authentication, Financial Record Management, and Analytical Dashboard APIs.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [System Architecture Diagram](#system-architecture-diagram)
4. [Database Schema](#database-schema)
5. [Folder Structure](#folder-structure)
6. [Role-Permission Mapping](#role-permission-mapping)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Authentication Flow](#authentication-flow)
9. [Setup & Installation](#setup--installation)
10. [Environment Variables](#environment-variables)
11. [Request & Response Examples](#request--response-examples)
12. [Error Handling](#error-handling)
13. [Security Practices](#security-practices)
14. [Optional Enhancements](#optional-enhancements)
15. [Assumptions Made](#assumptions-made)
16. [Future Improvements](#future-improvements)

---

## Project Overview

**FinanceDash** is a backend system designed to power a multi-user financial dashboard application. It supports three user roles — **Viewer**, **Analyst**, and **Admin** — each with clearly enforced permissions at the API level. The system provides:

- JWT-based authentication (registration + login)
- Role-Based Access Control (RBAC) enforced via middleware
- Full CRUD for financial records with filtering and pagination
- Advanced analytical dashboard APIs with aggregation
- Input validation, structured error responses, and request logging
- Soft deletes, rate limiting, and audit-friendly design

**Tech Stack:**

| Layer | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | SQLite (via Sequelize ORM) / Swap to PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Joi / express-validator |
| Logging | Morgan + Winston |
| Rate Limiting | express-rate-limit |
| Testing | Jest + Supertest |

---

## Architecture Overview

The backend follows **Clean Architecture** principles with strict separation of concerns across layers:

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────┐
│                     ROUTES LAYER                     │
│  /auth, /users, /records, /dashboard                │
│  Binds HTTP verbs + paths to controller methods     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                    │
│  • authenticate  — validates JWT token              │
│  • authorize     — enforces role permissions        │
│  • validate      — checks request body/params       │
│  • rateLimiter   — prevents abuse                   │
│  • requestLogger — logs all incoming requests       │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                 CONTROLLERS LAYER                    │
│  Thin layer. Parses req/res. Delegates to Service.  │
│  AuthController, UserController,                    │
│  RecordController, DashboardController              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                  SERVICES LAYER                      │
│  Business logic lives here.                         │
│  AuthService, UserService,                          │
│  RecordService, DashboardService                    │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                   MODELS LAYER                       │
│  Sequelize ORM models with associations             │
│  User, FinancialRecord                              │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│                   DATABASE LAYER                     │
│           SQLite (dev) / PostgreSQL (prod)          │
└─────────────────────────────────────────────────────┘
```

---

## System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser / Postman)                   │
└───────────────────────────────┬──────────────────────────────────────┘
                                │  HTTP/HTTPS
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         EXPRESS SERVER (app.js)                      │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     GLOBAL MIDDLEWARE                        │    │
│  │  cors │ helmet │ json-parser │ morgan-logger │ rate-limiter  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │                        ROUTER                              │      │
│  │                                                           │      │
│  │  /api/v1/auth          /api/v1/users                      │      │
│  │  /api/v1/records       /api/v1/dashboard                  │      │
│  └──────────┬──────────────────────────┬─────────────────────┘      │
│             │                          │                             │
│             ▼                          ▼                             │
│  ┌─────────────────┐       ┌─────────────────────────┐              │
│  │  Auth Routes    │       │  Protected Routes        │              │
│  │  POST /register │       │  ← authenticate()        │              │
│  │  POST /login    │       │  ← authorize(roles[])    │              │
│  └────────┬────────┘       └────────────┬────────────┘              │
│           │                             │                            │
│           ▼                             ▼                            │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                     CONTROLLERS                          │        │
│  │  AuthController │ UserController │ RecordController      │        │
│  │  DashboardController                                     │        │
│  └──────────────────────────┬──────────────────────────────┘        │
│                             │                                        │
│                             ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                      SERVICES                            │        │
│  │  AuthService │ UserService │ RecordService               │        │
│  │  DashboardService                                        │        │
│  └──────────────────────────┬──────────────────────────────┘        │
│                             │                                        │
│                             ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                SEQUELIZE ORM MODELS                      │        │
│  │  User Model                FinancialRecord Model         │        │
│  │  - id (PK)                 - id (PK)                    │        │
│  │  - name                    - userId (FK → users.id)     │        │
│  │  - email (unique)          - amount                     │        │
│  │  - passwordHash            - type (income/expense)      │        │
│  │  - role (enum)             - category                   │        │
│  │  - isActive                - date                       │        │
│  │  - createdAt               - notes                      │        │
│  │  - updatedAt               - isDeleted (soft delete)    │        │
│  └──────────────────────────┬──────────────────────────────┘        │
│                             │                                        │
└─────────────────────────────┼────────────────────────────────────── ┘
                              │
                              ▼
              ┌───────────────────────────┐
              │     DATABASE              │
              │  SQLite  ──►  PostgreSQL  │
              │  (dev)        (prod)      │
              └───────────────────────────┘
```

---

## Database Schema

### Table: `users`

```sql
CREATE TABLE users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,           -- bcrypt hash
  role        ENUM('viewer','analyst','admin')  NOT NULL DEFAULT 'viewer',
  is_active   BOOLEAN       NOT NULL DEFAULT true,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `financial_records`

```sql
CREATE TABLE financial_records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  type        ENUM('income','expense') NOT NULL,
  category    VARCHAR(100)  NOT NULL,
  date        DATE          NOT NULL,
  notes       TEXT,
  is_deleted  BOOLEAN       NOT NULL DEFAULT false,   -- soft delete flag
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX idx_records_user_id      ON financial_records(user_id);
CREATE INDEX idx_records_type         ON financial_records(type);
CREATE INDEX idx_records_category     ON financial_records(category);
CREATE INDEX idx_records_date         ON financial_records(date);
CREATE INDEX idx_records_is_deleted   ON financial_records(is_deleted);
```

### Entity Relationship Diagram

```
┌──────────────────────┐          ┌────────────────────────────────┐
│        users         │          │       financial_records         │
├──────────────────────┤          ├────────────────────────────────┤
│ PK  id               │◄─────────│ FK  user_id                    │
│     name             │  1 : N   │ PK  id                         │
│     email (unique)   │          │     amount    DECIMAL(15,2)     │
│     password (hash)  │          │     type      income/expense    │
│     role             │          │     category  VARCHAR(100)      │
│     is_active        │          │     date      DATE              │
│     created_at       │          │     notes     TEXT              │
│     updated_at       │          │     is_deleted BOOLEAN          │
└──────────────────────┘          │     created_at                  │
                                  │     updated_at                  │
                                  └────────────────────────────────┘
```

---

## Folder Structure

```
financedash-backend/
│
├── src/
│   ├── config/
│   │   ├── database.js          # Sequelize DB connection setup
│   │   ├── env.js               # Env variable loader + validation
│   │   └── logger.js            # Winston logger config
│   │
│   ├── models/
│   │   ├── index.js             # Sequelize init + associations
│   │   ├── User.js              # User model definition
│   │   └── FinancialRecord.js   # FinancialRecord model definition
│   │
│   ├── middleware/
│   │   ├── authenticate.js      # JWT token validation
│   │   ├── authorize.js         # Role-based permission guard
│   │   ├── validate.js          # Request body/param schema validation
│   │   ├── rateLimiter.js       # express-rate-limit config
│   │   └── requestLogger.js     # Morgan HTTP request logger
│   │
│   ├── controllers/
│   │   ├── AuthController.js    # register, login
│   │   ├── UserController.js    # CRUD for user management (Admin)
│   │   ├── RecordController.js  # CRUD for financial records
│   │   └── DashboardController.js # Aggregation + analytics endpoints
│   │
│   ├── services/
│   │   ├── AuthService.js       # Token generation, password hashing
│   │   ├── UserService.js       # User business logic
│   │   ├── RecordService.js     # Record business logic + filters
│   │   └── DashboardService.js  # Aggregation queries
│   │
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── auth.routes.js       # /api/v1/auth
│   │   ├── user.routes.js       # /api/v1/users
│   │   ├── record.routes.js     # /api/v1/records
│   │   └── dashboard.routes.js  # /api/v1/dashboard
│   │
│   ├── validators/
│   │   ├── auth.validator.js    # Register + login schemas
│   │   ├── user.validator.js    # User create/update schemas
│   │   └── record.validator.js  # Record create/update schemas
│   │
│   ├── utils/
│   │   ├── ApiError.js          # Custom error class
│   │   ├── ApiResponse.js       # Standardized response formatter
│   │   └── pagination.js        # Pagination helper
│   │
│   ├── app.js                   # Express app setup
│   └── server.js                # HTTP server entry point
│
├── tests/
│   ├── unit/
│   │   ├── auth.service.test.js
│   │   └── record.service.test.js
│   └── integration/
│       ├── auth.test.js
│       ├── records.test.js
│       └── dashboard.test.js
│
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
└── README.md
```

---

## Role-Permission Mapping

The system enforces three roles with clearly defined permissions. Permissions are checked in the `authorize` middleware before any controller logic executes.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RBAC PERMISSION MATRIX                          │
├────────────────────────────┬──────────┬──────────┬─────────────────┤
│ Resource / Action          │ VIEWER   │ ANALYST  │ ADMIN           │
├────────────────────────────┼──────────┼──────────┼─────────────────┤
│ Auth                       │          │          │                 │
│   POST /auth/register      │ Public   │ Public   │ Public          │
│   POST /auth/login         │ Public   │ Public   │ Public          │
├────────────────────────────┼──────────┼──────────┼─────────────────┤
│ Dashboard                  │          │          │                 │
│   GET /dashboard/summary   │ ✅       │ ✅       │ ✅              │
│   GET /dashboard/analytics │ ❌       │ ✅       │ ✅              │
│   GET /dashboard/trends    │ ❌       │ ✅       │ ✅              │
│   GET /dashboard/breakdown │ ❌       │ ✅       │ ✅              │
├────────────────────────────┼──────────┼──────────┼─────────────────┤
│ Financial Records          │          │          │                 │
│   GET /records             │ ❌       │ ✅       │ ✅              │
│   GET /records/:id         │ ❌       │ ✅       │ ✅              │
│   POST /records            │ ❌       │ ❌       │ ✅              │
│   PUT /records/:id         │ ❌       │ ❌       │ ✅              │
│   DELETE /records/:id      │ ❌       │ ❌       │ ✅              │
├────────────────────────────┼──────────┼──────────┼─────────────────┤
│ User Management            │          │          │                 │
│   GET /users               │ ❌       │ ❌       │ ✅              │
│   GET /users/:id           │ ❌       │ ❌       │ ✅              │
│   POST /users              │ ❌       │ ❌       │ ✅              │
│   PUT /users/:id           │ ❌       │ ❌       │ ✅              │
│   DELETE /users/:id        │ ❌       │ ❌       │ ✅              │
│   GET /users/me (self)     │ ✅       │ ✅       │ ✅              │
│   PUT /users/me (self)     │ ✅       │ ✅       │ ✅              │
└────────────────────────────┴──────────┴──────────┴─────────────────┘

  ✅ = Access Granted    ❌ = Access Denied (403 Forbidden)
```

### How RBAC is Enforced

```
Request comes in
      │
      ▼
┌─────────────────────┐
│  authenticate()     │  ← Validates JWT. Sets req.user = decoded payload.
│  middleware         │    Returns 401 if token missing/invalid/expired.
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  authorize(         │  ← Checks if req.user.role is in the allowed roles array.
│   ['admin']         │    Returns 403 if role is not permitted.
│  ) middleware       │    e.g., authorize(['admin', 'analyst'])
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Controller         │  ← Business logic runs only if both checks pass.
└─────────────────────┘
```

---

## API Endpoints Reference

**Base URL:** `http://localhost:3000/api/v1`

All protected routes require: `Authorization: Bearer <token>`

---

### 🔐 Authentication — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login and receive JWT |

---

### 👤 Users — `/users`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/users` | Admin | List all users (paginated) |
| GET | `/users/me` | All | Get own profile |
| GET | `/users/:id` | Admin | Get user by ID |
| POST | `/users` | Admin | Create a new user |
| PUT | `/users/me` | All | Update own profile |
| PUT | `/users/:id` | Admin | Update any user |
| DELETE | `/users/:id` | Admin | Soft-delete a user |

---

### 📊 Financial Records — `/records`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/records` | Admin, Analyst | List records with filters + pagination |
| GET | `/records/:id` | Admin, Analyst | Get a specific record |
| POST | `/records` | Admin | Create a new financial record |
| PUT | `/records/:id` | Admin | Update a financial record |
| DELETE | `/records/:id` | Admin | Soft-delete a record |

**Query Parameters for `GET /records`:**

| Param | Type | Description | Example |
|---|---|---|---|
| `type` | string | Filter by `income` or `expense` | `?type=income` |
| `category` | string | Filter by category name | `?category=salary` |
| `startDate` | date | Filter from this date (inclusive) | `?startDate=2024-01-01` |
| `endDate` | date | Filter to this date (inclusive) | `?endDate=2024-12-31` |
| `userId` | integer | Filter by user (Admin only) | `?userId=3` |
| `page` | integer | Page number (default: 1) | `?page=2` |
| `limit` | integer | Records per page (default: 20, max: 100) | `?limit=10` |
| `sortBy` | string | Sort field: `date`, `amount`, `createdAt` | `?sortBy=date` |
| `order` | string | `ASC` or `DESC` (default: `DESC`) | `?order=ASC` |

---

### 📈 Dashboard — `/dashboard`

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | All | Total income, expenses, net balance |
| GET | `/dashboard/analytics` | Admin, Analyst | Full analytics report |
| GET | `/dashboard/trends` | Admin, Analyst | Monthly income vs expense trends |
| GET | `/dashboard/breakdown` | Admin, Analyst | Category-wise spending breakdown |
| GET | `/dashboard/recent` | Admin, Analyst | Last N transactions |

**Query Parameters for Dashboard endpoints:**

| Param | Type | Description |
|---|---|---|
| `startDate` | date | Start of analysis period |
| `endDate` | date | End of analysis period |
| `userId` | integer | Scope to user (Admin only) |
| `limit` | integer | For `/recent`: number of records |

---

## Authentication Flow

```
┌─────────┐          ┌──────────────┐          ┌──────────┐
│  Client │          │  Auth Routes │          │   DB     │
└────┬────┘          └──────┬───────┘          └────┬─────┘
     │                      │                       │
     │  POST /auth/register │                       │
     │─────────────────────►│                       │
     │  { name, email,      │  Validate input       │
     │    password, role }  │  Hash password        │
     │                      │──────────────────────►│
     │                      │  INSERT user          │
     │                      │◄──────────────────────│
     │  201 { user, token } │  Sign JWT             │
     │◄─────────────────────│                       │
     │                      │                       │
     │  POST /auth/login    │                       │
     │─────────────────────►│                       │
     │  { email, password } │──────────────────────►│
     │                      │  SELECT WHERE email   │
     │                      │◄──────────────────────│
     │                      │  bcrypt.compare()     │
     │  200 { token }       │  Sign JWT (15min exp) │
     │◄─────────────────────│                       │
     │                      │                       │
     │  GET /records        │                       │
     │  Authorization:      │                       │
     │  Bearer <token>      │                       │
     │─────────────────────►│                       │
     │                      │  jwt.verify(token)    │
     │                      │  authorize(['analyst'])│
     │                      │──────────────────────►│
     │                      │  SELECT records       │
     │                      │◄──────────────────────│
     │  200 { records }     │                       │
     │◄─────────────────────│                       │
```

**JWT Payload Structure:**

```json
{
  "sub": 42,
  "email": "alice@example.com",
  "role": "analyst",
  "iat": 1716000000,
  "exp": 1716003600
}
```

---

## Setup & Installation

### Prerequisites

- Node.js v18+
- npm v9+
- SQLite3 (built-in for dev) OR PostgreSQL v14+ (for prod)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourname/financedash-backend.git
cd financedash-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 4. Run database migrations
npm run db:migrate

# 5. (Optional) Seed the database with sample data
npm run db:seed

# 6. Start the development server
npm run dev

# 7. (Production) Start with pm2
npm run build
npm start
```

### Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Environment Variables

Create a `.env` file in the root directory. Reference `.env.example`:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database (SQLite for dev)
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# Database (PostgreSQL for prod — uncomment and fill)
# DB_DIALECT=postgres
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=financedash
# DB_USER=postgres
# DB_PASSWORD=yourpassword

# JWT
JWT_SECRET=your-very-strong-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-strong-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
```

---

## Request & Response Examples

### Register

**Request:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "SecurePass@123",
  "role": "analyst"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "analyst",
      "createdAt": "2024-06-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Create Financial Record

**Request:**
```http
POST /api/v1/records
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": 1,
  "amount": 5000.00,
  "type": "income",
  "category": "salary",
  "date": "2024-06-01",
  "notes": "June monthly salary"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Financial record created",
  "data": {
    "id": 101,
    "userId": 1,
    "amount": "5000.00",
    "type": "income",
    "category": "salary",
    "date": "2024-06-01",
    "notes": "June monthly salary",
    "isDeleted": false,
    "createdAt": "2024-06-01T10:05:00.000Z"
  }
}
```

---

### Get Records (Filtered + Paginated)

**Request:**
```http
GET /api/v1/records?type=expense&category=utilities&startDate=2024-01-01&endDate=2024-06-30&page=1&limit=10
Authorization: Bearer <analyst_token>
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 55,
        "userId": 2,
        "amount": "120.00",
        "type": "expense",
        "category": "utilities",
        "date": "2024-03-15",
        "notes": "Electric bill"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalRecords": 28,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Dashboard Summary

**Request:**
```http
GET /api/v1/dashboard/summary?startDate=2024-01-01&endDate=2024-06-30
Authorization: Bearer <viewer_token>
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-06-30"
    },
    "summary": {
      "totalIncome": 30000.00,
      "totalExpenses": 18500.00,
      "netBalance": 11500.00,
      "transactionCount": 47
    }
  }
}
```

---

### Dashboard Analytics (Analyst/Admin)

**Request:**
```http
GET /api/v1/dashboard/analytics?startDate=2024-01-01&endDate=2024-06-30
Authorization: Bearer <analyst_token>
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 30000.00,
      "totalExpenses": 18500.00,
      "netBalance": 11500.00
    },
    "categoryBreakdown": [
      { "category": "salary",     "type": "income",  "total": 30000.00, "count": 6 },
      { "category": "rent",       "type": "expense", "total": 9000.00,  "count": 6 },
      { "category": "utilities",  "type": "expense", "total": 1500.00,  "count": 12 },
      { "category": "groceries",  "type": "expense", "total": 3000.00,  "count": 18 }
    ],
    "monthlyTrends": [
      { "month": "2024-01", "income": 5000.00, "expenses": 3100.00, "net": 1900.00 },
      { "month": "2024-02", "income": 5000.00, "expenses": 3050.00, "net": 1950.00 },
      { "month": "2024-03", "income": 5000.00, "expenses": 3200.00, "net": 1800.00 }
    ],
    "recentTransactions": [
      {
        "id": 101,
        "amount": 5000.00,
        "type": "income",
        "category": "salary",
        "date": "2024-06-01"
      }
    ]
  }
}
```

---

## Error Handling

All errors follow a consistent structure. The `ApiError` utility class is used throughout services and controllers.

**Error Response Schema:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

**HTTP Status Code Reference:**

| Code | When Used |
|---|---|
| 200 | Successful GET or PUT |
| 201 | Successful POST (resource created) |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — valid JWT but insufficient role |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — e.g. duplicate email |
| 422 | Unprocessable Entity — semantic validation failed |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

**Global Error Middleware** (`src/middleware/errorHandler.js`) catches all unhandled errors, logs them, and formats the response — ensuring no raw stack traces are ever exposed to clients in production.

---

## Security Practices

| Practice | Implementation |
|---|---|
| Password hashing | bcrypt with configurable rounds (default: 12) |
| JWT signing | HS256 with secret rotation support |
| Short-lived tokens | 15 minute access token expiry |
| Input sanitization | Joi validation on all inputs before controller |
| Rate limiting | 100 requests per 15 min per IP |
| CORS | Whitelist-only origins via env variable |
| HTTP headers | `helmet.js` sets secure HTTP headers |
| SQL injection | Sequelize ORM with parameterized queries |
| Soft deletes | Records/users are never physically deleted |
| Role enforcement | authorize() middleware on every protected route |
| Error masking | Stack traces hidden in production responses |

---

## Optional Enhancements

### Soft Deletes

All `DELETE` endpoints set `is_deleted = true` rather than removing rows. Queries filter `WHERE is_deleted = false` by default. Admins can optionally pass `?includeDeleted=true` to see soft-deleted records for audit purposes.

### Request Logging

Every request is logged using `morgan` in `combined` format to stdout, and to a rotating file via `winston`. Log format:

```
[2024-06-01 10:05:22] INFO: POST /api/v1/records 201 45ms - 342b [user:1 role:admin]
```

### Rate Limiting

Configured via `express-rate-limit`:
- Global: 100 requests / 15 min per IP
- Auth endpoints: 10 requests / 15 min per IP (stricter, brute-force protection)

### Pagination

All list endpoints support `?page=N&limit=N` parameters. Responses include a `pagination` object with `currentPage`, `totalPages`, `totalRecords`, `hasNextPage`, and `hasPrevPage`.

---

## Assumptions Made

1. **Role assignment at registration** — Users select their role at registration. In a production system, role assignment would be restricted to Admins only.
2. **Single tenant** — The system is single-tenant. Analysts and Admins can access records across all users; Viewers only see summary data.
3. **No refresh token rotation** — JWT refresh tokens are implemented but single-use rotation is not enforced in this version.
4. **SQLite for development** — SQLite is used by default for zero-config local development. PostgreSQL is the intended production database and can be switched via `DB_DIALECT=postgres` in `.env`.
5. **Amount always positive** — The `type` field (income/expense) determines the sign of a transaction. The `amount` column stores the absolute value.
6. **Soft deletes are final** — There is no restore endpoint in v1. Soft-deleted records can be viewed but not restored via the API.
7. **UTC dates** — All dates are stored and returned in UTC. Timezone conversion is the client's responsibility.

---

## Future Improvements

| Area | Improvement |
|---|---|
| Auth | Add OAuth2 / SSO (Google, GitHub) login |
| Auth | Implement refresh token rotation and revocation list |
| Roles | Fine-grained permissions (e.g., analyst can create their own records) |
| Multi-tenancy | Tenant isolation for SaaS-style deployment |
| Notifications | Webhook/email alerts when balance drops below threshold |
| Export | CSV/PDF export for records and dashboard data |
| Caching | Redis cache for dashboard aggregations (TTL: 5 min) |
| Real-time | WebSocket support for live dashboard updates |
| Audit Log | Dedicated audit_logs table tracking every write operation |
| API Versioning | `/api/v2` with backward-compatible evolution strategy |
| CI/CD | GitHub Actions pipeline with lint, test, and Docker build |
| Containerization | Docker + docker-compose for local and production deployment |
| API Docs | Auto-generated Swagger / OpenAPI 3.0 documentation |
| Monitoring | Integrate Prometheus metrics + Grafana dashboard |

---

## License

MIT © 2024 FinanceDash Contributors

---

*Built with clean architecture principles — controllers stay thin, services own logic, middleware enforces rules, and models define truth.*
