# Pollify - Registration Backend

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Express](https://img.shields.io/badge/Express-5.x-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-ready enterprise backend for the Pollify polling web application, featuring a complete registration module with email verification, built with Clean Architecture, SOLID principles, and enterprise-grade security standards.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [API Documentation](#api-documentation)
7. [Authentication & Email Verification Flow](#authentication--email-verification-flow)
8. [Security Features](#security-features)
9. [Database Models](#database-models)
10. [Utilities & Services](#utilities--services)
11. [Contributing](#contributing)

---

## Features

- **User Registration** with comprehensive field validation
- **Email Verification** via OTP (One-Time Password)
- **Profile Image Upload** with magic-byte validation
- **Duplicate Detection** for username and email
- **Secure Password Hashing** using bcrypt
- **Rate Limiting** on registration endpoint
- **NoSQL Injection Protection** via mongo-sanitize
- **CORS Protection** with configurable allowed origins
- **Structured Logging** with Pino
- **Graceful Shutdown** for production deployments
- **Centralized Error Handling** with consistent response format
- **Health Check Endpoint** for load balancers

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 5.x |
| Database | MongoDB with Mongoose 9.x |
| Authentication | JWT, bcrypt |
| Email Service | Nodemailer with SMTP |
| Validation | Zod |
| Logging | Pino + pino-http |
| Security | Helmet, CORS, mongo-sanitize |
| Rate Limiting | express-rate-limit |
| File Upload | Multer |
| Package Manager | Yarn |

---

## Project Structure

```
src/
├── config/
│   ├── db.config.js       # MongoDB connection setup
│   ├── env.js             # Centralized environment configuration
│   └── mail.config.js     # SMTP/Nodemailer configuration
├── middlewares/
│   ├── error.middleware.js  # Centralized error handling
│   └── validate.middleware.js # Zod validation middleware
├── models/
│   ├── User.js                # Mongoose User schema
│   └── VerificationToken.js   # Mongoose OTP token schema
├── modules/
│   └── auth/
│       ├── auth.controller.js   # HTTP request handlers
│       ├── auth.repository.js   # Database access layer
│       ├── auth.routes.js       # Route definitions
│       ├── auth.service.js      # Business logic
│       └── auth.validation.js   # Zod validation schemas
├── services/
│   ├── mail.service.js   # Nodemailer email service
│   └── otp.service.js    # OTP generation and verification
├── utils/
│   ├── apiError.js           # Custom API error class
│   ├── generateOTP.js        # Cryptographically secure OTP generation
│   ├── logger.js             # Pino logger instance
│   ├── otp.util.js           # OTP hashing and verification utilities
│   ├── passwordStrength.js   # Password strength calculator
│   └── response.js           # Consistent API response formatter
├── app.js              # Express app configuration
└── server.js           # Server entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB 5.x or higher (or MongoDB Atlas)
- SMTP credentials (Gmail, SendGrid, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/umarxcodes/polling-backend.git
cd polling-backend

# Install dependencies
yarn install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start the development server
yarn dev
```

### Scripts

```bash
yarn dev        # Start server with nodemon (development)
yarn start      # Start server with node (production)
yarn lint       # Run ESLint
yarn lint:fix   # Run ESLint with auto-fix
yarn format     # Run Prettier
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pollify

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Security
BCRYPT_SALT_ROUNDS=12
OTP_SALT_ROUNDS=10
OTP_EXPIRY_IN_MINUTES=10
OTP_MAX_ATTEMPTS=5
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Pollify API is healthy",
  "timestamp": "2026-07-29T07:32:41.000Z"
}
```

---

### 1. Register User

Creates a new user account and sends a verification OTP to the user's email.

```http
POST /auth/register
Content-Type: multipart/form-data
```

**Request Body (form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Full name (3-50 chars, letters and spaces only) |
| `username` | string | Yes | Username (3-20 chars, lowercase, alphanumeric + `_` + `.`) |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Min 8 chars, must contain upper, lower, number, special char |
| `confirmPassword` | string | Yes | Must match password |
| `terms` | string | Yes | Must be `"true"` |
| `profileImage` | file | No | Optional profile image (jpg, jpeg, png, webp, max 2MB) |

**Success Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please verify your email using the OTP sent to your email.",
  "data": {
    "user": {
      "name": "Muhammad Umar",
      "username": "umar_dev",
      "email": "umar@example.com",
      "profileImage": "https://res.cloudinary.com/dlul8f6xz/image/upload/v1/default_avatar",
      "role": "user",
      "isVerified": false,
      "createdAt": "2026-07-29T07:32:41.000Z",
      "updatedAt": "2026-07-29T07:32:41.000Z"
    }
  }
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Password must contain at least one uppercase letter"
  ]
}

// 409 - Username already exists
{
  "success": false,
  "message": "Username already exists"
}

// 409 - Email already exists
{
  "success": false,
  "message": "Email already exists"
}

// 413 - File Too Large
{
  "success": false,
  "message": "File size too large. Maximum allowed size is 2MB."
}
```

---

### 2. Verify Email

Verifies a user's email address using the OTP sent during registration.

```http
POST /auth/verify-email
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "483291"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": null
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

---

### 3. Resend Verification Email

Resends the verification OTP if the previous one expired.

```http
POST /auth/resend-verification
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (202 Accepted):**
```json
{
  "success": true,
  "statusCode": 202,
  "message": "If an unverified account exists, a verification code has been sent.",
  "data": null
}
```

---

## Authentication & Email Verification Flow

```
┌─────────────────┐
│   Frontend      │
│   (React/Vue)   │
└────────┬────────┘
         │
         │ 1. Fill Registration Form
         │    (name, username, email, password, confirmPassword,
         │     terms acceptance, optional profileImage)
         │
         ▼
┌─────────────────┐
│  POST /register │
│  (multipart)    │
└────────┬────────┘
         │
         │ 2. Validate Request (Zod)
         │    - Name: 3-50 chars, letters/spaces
         │    - Username: 3-20 chars, lowercase, alphanumeric
         │    - Email: valid format
         │    - Password: 8+ chars, upper+lower+number+special
         │    - Confirm Password: must match
         │    - Terms: must be accepted
         │    - Profile Image: optional, jpg/jpeg/png/webp, max 2MB
         │
         ▼
┌─────────────────┐
│  Check Existing │
│  - Username     │
│  - Email        │
└────────┬────────┘
         │
         │ 3. Duplicate Check
         │    - Query DB for existing username → 409 if found
         │    - Query DB for existing email → 409 if found
         │
         ▼
┌─────────────────────────────────────────┐
│  Validate File (Magic Bytes)            │
│  - JPEG: FF D8 FF                       │
│  - PNG: 89 50 4E 47 0D 0A 1A 0A        │
│  - WEBP: RIFF....WEBP                   │
└────────┬────────────────────────────────┘
         │
         │ 4. Hash Password (bcrypt, 12 rounds)
         │    Convert image to base64 data URI
         │
         ▼
┌─────────────────────────────────────────┐
│  Create User Document                   │
│  - isVerified: false                    │
│  - role: "user"                         │
│  - profileImage: default or uploaded    │
└────────┬────────────────────────────────┘
         │
         │ 5. Mongoose pre-save hook hashes password
         │
         ▼
┌─────────────────────────────────────────┐
│  Generate OTP                           │
│  - 6-digit numeric (crypto.randomInt)   │
│  - Hashed with bcrypt before storage     │
│  - Set expiry (10 minutes)               │
│  - Track attempts (max 5)                │
└────────┬────────────────────────────────┘
         │
         │ 6. Store OTP in VerificationToken collection
         │    - userId (unique, indexed)
         │    - hashedOtp (never plaintext)
         │    - expiresAt (TTL index for auto-deletion)
         │    - attempts: 0
         │    - isUsed: false
         │
         ▼
┌─────────────────────────────────────────┐
│  Send Verification Email                │
│  - HTML template with user's name       │
│  - 6-digit OTP code                     │
│  - Expiry notice                        │
│  - SMTP via Nodemailer                  │
└────────┬────────────────────────────────┘
         │
         │ 7. Return 201 Success
         │
         ▼
┌─────────────────────────────────────────┐
│  User receives email                    │
│  "Your verification code is 483291"     │
└────────┬────────────────────────────────┘
         │
         │ 8. User submits OTP
         │
         ▼
┌─────────────────────────────────────────┐
│  POST /verify-email                     │
│  { email, otp }                         │
└────────┬────────────────────────────────┘
         │
         │ 9. Verify OTP
         │    - Find active token for user
         │    - Compare candidate OTP with hashed OTP
         │    - On failure: increment attempts
         │    - On success: mark token as used
         │    - Update user: isVerified = true
         │
         ▼
┌─────────────────────────────────────────┐
│  Email Verified Successfully            │
│  User can now login                     │
└─────────────────────────────────────────┘
```

---

## Security Features

### 1. Password Security
- Passwords are hashed using **bcrypt** with configurable salt rounds (default: 12)
- Original passwords are never stored or returned in API responses
- `select: false` on password field prevents accidental exposure in queries

### 2. OTP Security
- OTPs are generated using **crypto.randomInt()** (cryptographically secure)
- OTPs are **hashed with bcrypt** before storage (never stored in plaintext)
- Maximum **5 verification attempts** per OTP
- **10-minute expiry** with MongoDB TTL index for automatic cleanup
- Single-use tokens (`isUsed` flag prevents replay attacks)

### 3. Input Validation
- **Zod schemas** validate all incoming data with strict type checking
- **MongoDB sanitization** prevents NoSQL injection attacks
- **Magic-byte validation** ensures uploaded files are actually images (prevents MIME spoofing)
- File size limits (2MB) enforced at Multer level

### 4. Rate Limiting
- **Global rate limiter**: 100 requests per 15 minutes per IP
- **Registration-specific limiter**: 5 attempts per 15 minutes per IP (prevents brute-force registration attacks)

### 5. HTTP Security
- **Helmet** sets security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **CORS** with strict origin allowlist (configurable via `CORS_ORIGIN`)
- **Request size limits** (10kb for JSON) prevent payload attacks

### 6. Error Handling
- No stack traces exposed in production
- Consistent error response format
- Centralized error handler catches all exceptions
- Unhandled rejections and uncaught exceptions are logged and cause graceful exits

---

## Database Models

### User

```javascript
{
  _id: ObjectId,
  name: String,           // 3-50 chars, letters and spaces
  username: String,       // 3-20 chars, lowercase, unique, indexed
  email: String,          // valid email, unique, indexed
  password: String,       // bcrypt hashed, select: false
  profileImage: String,   // base64 data URI or default avatar URL
  role: String,           // "user" | "admin" | "moderator" (default: "user")
  isVerified: Boolean,    // default: false, indexed
  createdAt: Date,        // auto-generated
  updatedAt: Date         // auto-generated
}
```

**Indexes:**
- `username` (unique)
- `email` (unique)
- `isVerified` (for fast auth lookups)

### VerificationToken

```javascript
{
  _id: ObjectId,
  userId: ObjectId,       // reference to User, unique, indexed
  hashedOtp: String,      // bcrypt hashed OTP
  plainOtp: String,       // plain OTP for comparison, select: false
  expiresAt: Date,        // TTL index for auto-cleanup
  attempts: Number,       // default: 0, max: 5
  isUsed: Boolean,        // default: false
  createdAt: Date,        // auto-generated
  updatedAt: Date         // auto-generated
}
```

**Indexes:**
- `userId` (unique) - ensures one active token per user
- `expiresAt` (TTL) - MongoDB auto-deletes expired tokens

---

## Utilities & Services

### Mail Service (`src/services/mail.service.js`)
Singleton service that handles all email operations:
- Creates Nodemailer transporter with SMTP configuration
- Validates SMTP credentials on initialization
- Supports HTML and plain text email templates
- Sends verification emails with branded HTML template

### OTP Service (`src/services/otp.service.js`)
Handles OTP lifecycle:
- `sendVerificationOtp()` - Generates, hashes, stores, and emails OTP
- `verifyVerificationOtp()` - Validates OTP, tracks attempts, marks as used

### Response Utility (`src/utils/response.js`)
Consistent API response formatter:
```javascript
Response.success(200, data, "Success message")
Response.fail(400, errors, "Error message")
```

### Password Strength (`src/utils/passwordStrength.js`)
Calculates password strength score (Weak/Medium/Strong) based on:
- Length thresholds
- Character variety (upper, lower, number, special)

### Logger (`src/utils/logger.js`)
Pino logger instance with environment-aware log levels:
- `debug` in development
- `info` in production

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global API | 100 requests | 15 minutes |
| POST /auth/register | 5 requests | 15 minutes |

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created (registration successful) |
| 400 | Validation Error |
| 404 | Not Found |
| 409 | Conflict (duplicate username/email) |
| 413 | Payload Too Large (file exceeds 2MB) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write meaningful commit messages (Conventional Commits)
- Add JSDoc comments for public methods
- Ensure all tests pass before submitting PR

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

Built by Muhammad Umar as part of the Pollify polling web application.

For questions or support, open an issue on GitHub.
