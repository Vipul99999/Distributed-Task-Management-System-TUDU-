
## 🟢 TUDU
### Distributed Task Management System

A cloud-deployed, service-separated task management platform built using modern full-stack technologies.

TUDU demonstrates modular backend architecture, secure authentication patterns, and production-style deployment across multiple cloud platforms.

---
**Demo:** [Live Demo Link]()

## 🚀 Overview

TUDU is not just a CRUD to-do app.

It is a service-separated system designed with:

- Secure JWT-based authentication
- RESTful API architecture
- Cloud deployment strategy
- Backend security best practices
- Modular and extensible design

The project simulates real-world SaaS architecture by separating authentication and business logic services.

---

## 🏗 Architecture

### System Flow

User → Auth Service → JWT → Task Frontend → Backend API → PostgreSQL

### Services

🔐 Authentication Service (Next.js)  
🖥 Task Frontend (Next.js)  
⚙ Backend API (Node.js + Express)  
🗄 Database (Neon PostgreSQL)

---

## ☁️ Deployment

| Service | Platform |
|----------|----------|
| Authentication Service | Vercel |
| Task Frontend | Vercel |
| Backend API | Render |
| Database | Neon (Serverless PostgreSQL) |

Each service is independently deployed with environment-based configuration.

---

## 🔐 Authentication Flow

- User registers or logs in
- Password is securely hashed using bcrypt
- JWT token is generated upon successful authentication
- Protected routes validate JWT using middleware
- Backend verifies token signature before granting access

Authentication is stateless and scalable.

---

## ✨ Features

### 👤 User Authentication
- User Registration
- Secure Login
- Password Hashing (bcrypt)
- JWT-based Authorization
- Protected API Routes

### 📋 Task Management
- Create tasks
- Update tasks
- Delete tasks
- Drag-and-drop task reordering
- Modular UI structure

### ⚡ Performance Optimizations
- React Query for server-state caching
- Optimized API requests
- Clean component architecture

### 🛡 Security Practices
- Helmet for secure HTTP headers
- Express Rate Limiting
- Controlled CORS configuration
- Environment-based secrets management

---

## 🛠 Technology Stack

### Frontend
- Next.js
- React
- React Query
- Tailwind CSS
- dnd-kit

### Backend
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Zod Validation
- JSON Web Tokens
- Helmet
- Express Rate Limit

### Infrastructure
- Vercel
- Render
- Neon PostgreSQL

---

## 📡 API Documentation

### 🔐 Authentication Endpoints

#### ➤ Register User
**POST** `/api/auth/register`

Request Body:
```json
{ "name": "username",
  "email": "user@example.com",
  "password": "password123"
}
````

Response:

```json
{
  "message": "User registered successfully",
  "userId": "uuid"
}
```

---

#### ➤ Login User

**POST** `/api/auth/login`

Request Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "token": "jwt_token_here"
}
```

---

### 📋 Task Endpoints

> All task endpoints require Authorization header.

Authorization Header:

```
Authorization: Bearer <jwt_token>
```

---

#### ➤ Get All Tasks

**GET** `/api/tasks`

Response:

```json
[
  {
    "id": "task_id",
    "title": "Complete project",
    "completed": false
  }
]
```

---

#### ➤ Create Task

**POST** `/api/tasks`

Request Body:

```json
{
  "title": "Complete project",
  "description": "Finish backend integration"
}
```

Response:

```json
{
  "id": "task_id",
  "title": "Complete project",
  "completed": false
}
```

---

#### ➤ Update Task

**PUT** `/api/tasks/:id`

Request Body:

```json
{
  "title": "Updated title",
  "completed": true
}
```

---

#### ➤ Delete Task

**DELETE** `/api/tasks/:id`

Response:

```json
{
  "message": "Task deleted successfully"
}
```

---

## 📂 Project Structure

```
userAuth/
 |-- prisma
/src
 ├── app/
 ├── action/
 ├── components/
 ├── lib/
 └── types/

task-frontend/src/
 ├── components/
 ├── hooks/
 ├── lib/
 └── app/
 └── types/
 └── validation/
 └── stores/

backend/
 ├── prisma/
 ├── src/
 │   ├── routes/
 │   ├── controllers/
 │   ├── middleware/
 │   ├── services/
 │   └── config/
 │   └── utils/
 │   └── types/
```

---

## ⚙️ Environment Variables

### Backend

```

NODE_ENV
PORT
DATABASE_URL
JWT_SECRET=<JWT_SECRET_KEY>
ALLOWED_MICROSERVICES
PUBLIC_KEY=<your_rsa_public_key>
NEXT_PUBLIC_AUTH_API_URL
NEXT_PUBLIC_APP_API_URL
```

### Frontend

```
AUTH_SERVICE_URL=  <auth service url here>
PUBLIC_KEY = <public key here>
NEXT_PUBLIC_AUTH_SERVICE_URL= <auth service url here>
NEXT_PUBLIC_APP_API_URL= <app api url here>
NEXT_PUBLIC_APP_SERVICE_URL= <app service url here>
```

---

## 🧠 Design Decisions

| Decision           | Reason                            |
| ------------------ | --------------------------------- |
| Service Separation | Modularity and scalability        |
| JWT Authentication | Stateless and scalable auth       |
| Prisma ORM         | Type-safe database interaction    |
| React Query        | Efficient server-state management |
| Cloud Deployment   | Real-world distributed simulation |

---

## 🚀 Future Improvements

* Refresh token implementation
* Real-time updates (WebSockets)
* Notifications system
* User preferences module
* Docker containerization
* Reverse proxy configuration
* CI/CD pipeline integration

---

## 📚 What This Project Demonstrates

* Backend architecture understanding
* Secure authentication implementation
* REST API design
* Cloud deployment experience
* Environment configuration management
* Security-focused backend practices

---

## 👨‍💻 Author

Vipul Kumar Patel
Computer Science Student
Focused on Backend Systems, Distributed Architecture & Scalable Applications

