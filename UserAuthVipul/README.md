# Next.js Authentication System

A comprehensive authentication system built with Next.js and Typescript, featuring both local authentication and OAuth capabilities. The system includes email verification, password reset functionality, and session management.

## Features

### Local Authentication

- Email and password-based signup
- Email verification system
  - Users must verify email within 15 minutes of registration
  - Verification link can be resent if expired
- Secure password reset flow
  - Reset links expire after 10 minutes
  - Users can request new reset links if expired

### OAuth Integration

- Support for multiple OAuth providers (Google, Github etc.)
- Seamless social login experience

### Security Features

- Session-based authentication
  - Redis-based session tracking
- Secure password hashing
- Protection against common vulnerabilities

### Session Management

- Redis-based session storage for optimal performance
- Support for multiple active sessions per user

## Technical Stack

- **Framework**: Next.js (App Router)
- **Database**: SQL (PostgreSQL)
- **Authentication**: Custom implementation with OAuth support
- **Email Service**: NodeMailer (Can use email service of your choice)
- **Session Management**: Redis-based session storage

## Prerequisites

- Node.js 18.x or higher
- npm package manager
- Redis server (for session management)
- PostgreSQL database

## Getting Started

1. **Clone the repository**
 ```bash
 git clone https://github.com/Vipul99999/VipulAuthNext.git
 ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Create a `.env` file
   - Copy `.env.example` to `.env` and provide the needed values
   - Configure the following variables:
     - Database connection
     - Redis connection
     - OAuth provider credentials
     - Email service credentials

4. **Database Setup**

   - Create and use PostgreSQL database

   ```sql
   CREATE DATABASE IF NOT EXISTS name_of_your_database;
   ```

   - Create database tables by running the migration file in the `migrations/` folder

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application

## Project Structure

```
migrations
|
src/
├── actions/        # Server actions for authentication
├── app/            # Next.js app router pages
├── components/     # Reusable UI components
├── lib/           # Utility functions and configurations
└── sql_schemas/   # Database schema definitions
```

## Authentication Workflows

### Local Sign-up Process

1. User submits registration form with name, email and password
2. System creates unverified account
3. Verification email is sent (valid for 15 minutes)
4. User must verify email to activate account


### Password Reset Flow

1. User requests password reset
2. Reset link is sent via email (valid for 10 minutes)
3. User sets new password through reset link

### OAuth Authentication

1. User initiates OAuth login
2. System redirects to auth provider
3. Provider returns with authentication token
4. System creates/updates user account
5. User is logged in with new session

## Scripts

```json
"scripts": {
  "dev": "next dev --turbopack --experimental-https",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "migrate": "node-pg-migrate"
}
```

## Dependencies

```json
"dependencies": {
  "@upstash/redis": "^1.34.6",
  "bcryptjs": "^3.0.2",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.483.0",
  "next": "15.2.3",
  "next-themes": "^0.4.6",
  "nodemailer": "^6.10.0",
  "pg": "^8.15.6",
  "postgres-array": "^3.0.4",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-icons": "^5.5.0",
  "server-only": "^0.0.1",
  "sonner": "^2.0.1",
  "tailwind-merge": "^3.0.2",
  "tw-animate-css": "^1.2.4",
  "zod": "^3.24.2"
}
```

## Dev Dependencies

```json
"devDependencies": {
  "@eslint/eslintrc": "^3",
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/nodemailer": "^6.4.17",
  "@types/pg": "^8.15.2",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "15.2.3",
  "node-pg-migrate": "^7.9.1",
  "prettier": "^3.5.3",
  "prettier-plugin-tailwindcss": "^0.6.11",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```
