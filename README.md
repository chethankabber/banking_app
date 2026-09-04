# Banking CRM — Customer Service & Loan Tracking

A full-stack MERN application for managing bank customers, accounts, loans, KYC verification, and customer support tickets. Built as an admin CRM tool, not a customer-facing banking app.

## Project Overview

This CRM lets bank staff (admins and agents):

- Maintain customer records and their KYC status
- Track bank accounts (savings/current) linked to customers
- Manage loan applications through their lifecycle (Pending → Approved/Rejected → Active → Closed)
- Handle customer support tickets (open, assign, resolve)
- View a dashboard with key metrics and charts

It's a demonstration/interview project — KYC document verification is manual (no real Aadhaar/PAN verification), and notifications are just messages stored in the activity log, not real SMS/email.

## Features

- JWT-based authentication with a seeded demo admin account
- Role-based access (`admin`, `agent`, `user`) — only admins can delete records
- Full CRUD for Customers, Accounts, Loans, KYC records, and Support Tickets
- Search, filtering, and pagination on all list endpoints
- Loan status workflow (Pending → Approved/Rejected → Active → Closed) via a dedicated status endpoint
- KYC verification workflow (Pending → Verified/Rejected)
- Support ticket workflow (Open → In Progress → Resolved → Closed) plus assignment to an agent
- Activity log recording who did what, shown on the dashboard
- Dashboard with summary stat cards and charts (loan status, ticket status) using Recharts
- Centralized error handling with consistent JSON error responses
- Input validation on every create/update request

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, express-validator, dotenv, cors

**Frontend:** React (Vite), React Router, Axios, Recharts, plain CSS

**Database:** MongoDB

**Authentication:** JWT (Bearer token)

## Folder Structure

```
banking-crm/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Route handler logic (one file per module)
│   ├── middleware/                # auth, role check, validation, error handling
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express routers
│   ├── utils/                    # generateToken, logActivity, seedAdmin
│   ├── server.js                 # App entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # Single Axios instance with auth header + 401 handling
│   │   ├── context/AuthContext.jsx
│   │   ├── components/           # Sidebar, Layout, Modal, Pagination, StatusBadge, PrivateRoute
│   │   ├── pages/                # Login, Dashboard, and one folder per module
│   │   └── App.jsx               # Route definitions
│   └── .env.example
└── README.md
```

## Installation

### Backend

```
cd backend
npm install
cp .env.example .env
# edit .env with your MongoDB URI and JWT secret
npm run seed     # creates the demo admin account
npm run dev       # starts on http://localhost:5000
```

### Frontend

```
cd frontend
npm install
cp .env.example .env
npm run dev       # starts on http://localhost:5173
```

## Environment Variables

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/banking_crm
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRE=1d
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

## MongoDB Setup

Any MongoDB instance works — local or a free MongoDB Atlas cluster.

- **Local:** install MongoDB Community Server, run `mongod`, and use `mongodb://localhost:27017/banking_crm` as `MONGO_URI`.
- **Atlas:** create a free cluster, add a database user, whitelist your IP, and copy the connection string into `MONGO_URI`.

The database and collections are created automatically the first time the app writes data — no manual schema setup needed.

## Default Admin

Run `npm run seed` inside `backend/` once, after setting up your `.env`. It creates:

```
Email:    admin@example.com
Password: Admin@123
```

This is a demo account for local testing — change or remove it before any real deployment.

## API Documentation

Base URL: `http://localhost:5000/api`

All endpoints except `POST /auth/login` require the header:

```
Authorization: Bearer YOUR_TOKEN
```

Standard error response shape:
```json
{ "success": false, "message": "Description of what went wrong" }
```

---

### AUTH

#### Login
`POST /api/auth/login`

Headers: `Content-Type: application/json`

Body:
```json
{
  "email": "admin@example.com",
  "password": "Admin@123"
}
```

Success (200):
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "64f...",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

Error (401):
```json
{ "success": false, "message": "Invalid email or password" }
```

#### Get current user
`GET /api/auth/me` — Auth required.

Success (200):
```json
{ "success": true, "user": { "_id": "...", "name": "Admin", "email": "...", "role": "admin" } }
```

---

### CUSTOMERS

All routes below require `Authorization: Bearer TOKEN`. Delete requires `admin` role.

#### Create Customer
`POST /api/customers`

Body:
```json
{
  "firstName": "John",
  "lastName": "Kumar",
  "email": "john.kumar@example.com",
  "phone": "9876543210",
  "dateOfBirth": "1990-05-14",
  "gender": "Male",
  "address": "12 MG Road",
  "city": "Bengaluru",
  "state": "Karnataka",
  "pincode": "560001",
  "occupation": "Software Engineer",
  "status": "Active"
}
```

Success (201): `{ "success": true, "data": { ...customer, "customerId": "CUST0001" } }`

#### Get Customers
`GET /api/customers?search=John&status=Active&page=1&limit=10`

Query params (all optional): `search`, `status`, `page`, `limit`

Success (200):
```json
{
  "success": true,
  "data": [ { "...customer fields" } ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

#### Get Customer (with related records)
`GET /api/customers/:id`

Success (200):
```json
{
  "success": true,
  "data": {
    "customer": { "..." },
    "accounts": [ "..." ],
    "loans": [ "..." ],
    "kyc": [ "..." ],
    "tickets": [ "..." ]
  }
}
```

#### Update Customer
`PUT /api/customers/:id` — Body: same shape as create.

#### Delete Customer
`DELETE /api/customers/:id` — Admin only.

Error (409) if the customer still has active accounts/loans:
```json
{ "success": false, "message": "Cannot delete customer with active accounts or loans. Close them first." }
```

---

### ACCOUNTS

#### Create Account
`POST /api/accounts`

Body:
```json
{
  "customer": "CUSTOMER_MONGO_ID",
  "accountType": "Savings",
  "balance": 5000,
  "branch": "MG Road Branch",
  "status": "Active"
}
```

Success (201): `{ "success": true, "data": { ...account, "accountNumber": "ACC000001" } }`

#### Get Accounts
`GET /api/accounts?search=ACC0001&customer=ID&accountType=Savings&status=Active&page=1&limit=10`

#### Get Account
`GET /api/accounts/:id`

#### Update Account
`PUT /api/accounts/:id`

#### Delete Account
`DELETE /api/accounts/:id` — Admin only.

---

### LOANS

#### Create Loan
`POST /api/loans`

Body:
```json
{
  "customer": "CUSTOMER_MONGO_ID",
  "loanType": "Personal",
  "amount": 200000,
  "interestRate": 10.5,
  "tenure": 24,
  "purpose": "Home renovation"
}
```

Success (201): `{ "success": true, "data": { ...loan, "loanNumber": "LN1001" } }`

#### Get Loans
`GET /api/loans?search=LN1001&customer=ID&loanType=Personal&status=Pending&page=1&limit=10`

#### Get Loan
`GET /api/loans/:id`

#### Update Loan
`PUT /api/loans/:id`

#### Update Loan Status
`PATCH /api/loans/:id/status`

Body:
```json
{ "status": "Approved" }
```
Valid values: `Pending`, `Approved`, `Rejected`, `Active`, `Closed`. Writes an activity log entry on every change.

#### Delete Loan
`DELETE /api/loans/:id` — Admin only.

---

### KYC

#### Create KYC
`POST /api/kyc`

Body:
```json
{
  "customer": "CUSTOMER_MONGO_ID",
  "documentType": "Aadhaar",
  "documentNumber": "1234-5678-9012"
}
```

#### Get KYC Records
`GET /api/kyc?customer=ID&verificationStatus=Pending&documentType=PAN&page=1&limit=10`

#### Get KYC
`GET /api/kyc/:id`

#### Update KYC
`PUT /api/kyc/:id`

#### Update KYC Status
`PATCH /api/kyc/:id/status`

Body:
```json
{
  "verificationStatus": "Verified",
  "remarks": "Documents verified successfully"
}
```
Valid values: `Pending`, `Verified`, `Rejected`. Sets `verifiedBy` to the logged-in user and `verifiedAt` to now.

#### Delete KYC
`DELETE /api/kyc/:id` — Admin only.

---

### SUPPORT TICKETS

#### Create Ticket
`POST /api/tickets`

Body:
```json
{
  "customer": "CUSTOMER_MONGO_ID",
  "subject": "Unable to view loan statement",
  "description": "Customer says the loan statement page shows a blank screen.",
  "category": "Loan",
  "priority": "Medium"
}
```

Success (201): `{ "success": true, "data": { ...ticket, "ticketNumber": "TCK00001" } }`

#### Get Tickets
`GET /api/tickets?search=TCK00001&status=Open&priority=High&category=Loan&assignedTo=ID&page=1&limit=10`

#### Get Ticket
`GET /api/tickets/:id`

#### Update Ticket
`PUT /api/tickets/:id`

#### Update Ticket Status
`PATCH /api/tickets/:id/status`

Body:
```json
{ "status": "Resolved", "resolution": "Customer issue resolved." }
```
Valid values: `Open`, `In Progress`, `Resolved`, `Closed`.

#### Assign Ticket
`PATCH /api/tickets/:id/assign`

Body:
```json
{ "assignedTo": "ADMIN_MONGO_ID" }
```

#### Delete Ticket
`DELETE /api/tickets/:id` — Admin only.

---

### DASHBOARD

#### Stats
`GET /api/dashboard/stats`

Success (200):
```json
{
  "success": true,
  "data": {
    "customers": 120,
    "activeCustomers": 110,
    "accounts": 150,
    "loans": 45,
    "pendingLoans": 10,
    "approvedLoans": 20,
    "rejectedLoans": 5,
    "activeLoans": 10,
    "openTickets": 8,
    "resolvedTickets": 30,
    "pendingKyc": 5,
    "verifiedKyc": 100
  }
}
```

#### Chart Data
`GET /api/dashboard/charts` — Returns loan status, ticket status, and account type breakdowns used by the dashboard's charts.

#### Recent Activity
`GET /api/dashboard/activity?limit=10` — Returns the most recent activity log entries.

---

## Complete API List

```
AUTH
POST   /api/auth/login
GET    /api/auth/me

CUSTOMERS
POST   /api/customers
GET    /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id

ACCOUNTS
POST   /api/accounts
GET    /api/accounts
GET    /api/accounts/:id
PUT    /api/accounts/:id
DELETE /api/accounts/:id

LOANS
POST   /api/loans
GET    /api/loans
GET    /api/loans/:id
PUT    /api/loans/:id
DELETE /api/loans/:id
PATCH  /api/loans/:id/status

KYC
POST   /api/kyc
GET    /api/kyc
GET    /api/kyc/:id
PUT    /api/kyc/:id
DELETE /api/kyc/:id
PATCH  /api/kyc/:id/status

TICKETS
POST   /api/tickets
GET    /api/tickets
GET    /api/tickets/:id
PUT    /api/tickets/:id
DELETE /api/tickets/:id
PATCH  /api/tickets/:id/status
PATCH  /api/tickets/:id/assign

DASHBOARD
GET    /api/dashboard/stats
GET    /api/dashboard/charts
GET    /api/dashboard/activity
```

## Testing APIs with Apidog

1. Start the backend: `cd backend && npm run dev`
2. Open Apidog (or Postman) and set the base URL to `http://localhost:5000/api`
3. Call `POST /auth/login` with the demo credentials and copy the `token` from the response
4. For every other request, add a header: `Authorization: Bearer YOUR_TOKEN`
5. Test each endpoint using the example request bodies above — they're copy-pasteable as-is
6. For endpoints that need a `customer` (or `assignedTo`) ID, first call `GET /customers` (or check the seeded admin's `_id` from the DB) and copy a real `_id` into the body

## Sample Test Data

You can create these manually through the UI or Apidog to have realistic demo data:

- **Customers:** John Kumar, Rahul Sharma, Priya Reddy
- **Accounts:** one Savings and one Current account per customer
- **Loans:** a Personal loan, a Home loan, a Vehicle loan, each in a different status
- **Tickets:** a KYC issue, a loan inquiry, an account issue

## Database Models

- **Admin** — name, email, hashed password, role (`admin` / `agent` / `user`)
- **Customer** — personal + address details, unique `customerId`, status
- **Account** — references `Customer`, account type, balance, branch, status
- **Loan** — references `Customer`, loan type, amount, interest rate, tenure, status
- **KYC** — references `Customer` and (once verified) `Admin`, document type/number, verification status
- **SupportTicket** — references `Customer` and (once assigned) `Admin`, subject, description, category, priority, status
- **ActivityLog** — references `Admin`, records action/module/recordId/description for the dashboard's recent activity feed

## Authentication Flow

1. `POST /api/auth/login` with email + password
2. Backend verifies the password with bcrypt, signs a JWT (`{ id, role }`) with `JWT_SECRET`
3. Frontend stores the token in `localStorage` and attaches it to every request via an Axios interceptor
4. `authMiddleware` reads the `Authorization: Bearer` header, verifies the JWT, and attaches the user to `req.user`
5. `roleMiddleware` (`authorize('admin')`) blocks delete requests from non-admin roles
6. A 401 response anywhere clears the stored token and redirects the frontend to `/login`

## How to Run the Project

```
# Terminal 1
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run seed
npm run dev             # http://localhost:5000

# Terminal 2
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

Open `http://localhost:5173`, log in with `admin@example.com` / `Admin@123`, and start exploring.

## Limitations & Assumptions

- KYC document verification is manual — no real Aadhaar/PAN/government API integration.
- Notifications are just activity log entries; there's no real SMS/email service wired up.
- The token is stored in `localStorage`, which is fine for this assignment but not the most XSS-resistant approach for a production banking app.
- Ticket assignment requires pasting an Admin/Agent's Mongo `_id` (there's no "list admins" endpoint in the spec) — in a real product this would be a dropdown backed by a user-management API.
- Deployment is optional per the assignment; the app is built and verified to run locally only.
