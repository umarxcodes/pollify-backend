# Pollify - Enterprise Polling Backend

![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)
![Express](https://img.shields.io/badge/Express-5.x-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-ready enterprise backend for the Pollify polling web application. Built with Clean Architecture, SOLID principles, and enterprise-grade security standards.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [API Documentation](#api-documentation)
7. [Security Features](#security-features)
8. [Database Models](#database-models)
9. [Rate Limits](#rate-limits)
10. [Error Codes](#error-codes)
11. [CI/CD](#cicd)
12. [Contributing](#contributing)

---

## Features

### Authentication & Authorization

- **User Registration** with email verification via OTP
- **Login** with username/email + password
- **JWT Access Tokens** (15 minutes expiry)
- **Refresh Tokens** with secure HttpOnly cookies (7 days expiry)
- **Account Lockout** after multiple failed login attempts
- **Password Reset** with secure tokens
- **Role-Based Access Control** (User, Admin, Super Admin)
- **CSRF Protection** for cookie-based auth

### Polling

- **Create Polls** with multiple options, types, and categories
- **Voting** with single/multiple choice support
- **Vote Change** and removal
- **Duplicate Vote Prevention**
- **Poll Status Management** (draft, active, expired, closed)
- **Poll Analytics** with detailed insights

### Comments & Engagement

- **Add, Edit, Delete Comments** with soft delete
- **Reply to Comments** (one-level nesting)
- **Like/Unlike Comments**
- **Pin Comments** (poll owner only)
- **Report Comments** with moderation reasons

### Search & Discovery

- **Global Search** across polls, users, and categories
- **Poll Search** with filters and sorting
- **User Search** with text indexes
- **Trending Polls** with weighted scoring
- **Popular Polls** by votes, comments, or saves
- **Search Suggestions** and Search History
- **Recently Viewed Polls**

### Bookmarks

- **Save/Remove Polls** as bookmarks
- **View Saved Polls** with pagination and sorting
- **Bookmark Statistics**
- **Check Save Status**

### Notifications

- **Real-time Notifications** with Socket.IO ready design
- **Notification Preferences** (email, push, vote, comment, poll, system)
- **Mark as Read** / Mark All as Read
- **Email Notifications** for critical events
- **Unread Count** endpoint

### Analytics

- **Poll Overview** with metadata and stats
- **Live Results** with percentages and winning options
- **Time Analytics** (daily, weekly, monthly, hourly)
- **Voter Analytics** (unique, anonymous, registered)
- **Chart Data** for pie, bar, line, and area charts
- **Dashboard Analytics** for poll owners
- **Trending Analytics** with growth metrics

### Admin & Moderation

- **Admin Dashboard** with platform statistics
- **User Management** (view, update role, suspend, delete)
- **Poll Management** (delete, restore, feature, close)
- **Comment Management** (delete, restore)
- **Category Management** (CRUD operations)
- **Report Management** with moderation actions
- **Audit Logs** for all admin actions
- **System Settings** management

---

## Tech Stack

| Category        | Technology                                  |
| --------------- | ------------------------------------------- |
| Runtime         | Node.js 22+                                 |
| Framework       | Express.js 5.x                              |
| Database        | MongoDB with Mongoose 9.x                   |
| Authentication  | JWT, bcrypt                                 |
| Email Service   | Nodemailer with SMTP                        |
| Validation      | Zod                                         |
| Logging         | Pino + pino-http                            |
| Security        | Helmet, CORS, mongo-sanitize, cookie-parser |
| Rate Limiting   | express-rate-limit                          |
| File Upload     | Multer + Cloudinary                         |
| Package Manager | Yarn                                        |

---

## Project Structure

```
src/
├── app.js                      # Express app configuration
├── server.js                   # Server entry point with graceful shutdown
├── config/
│   ├── db.config.js            # MongoDB connection setup
│   ├── env.js                  # Centralized environment configuration
│   └── mail.config.js          # SMTP/Nodemailer configuration
├── middlewares/
│   ├── authenticate.middleware.js  # JWT authentication
│   ├── authorize.middleware.js     # Role-based authorization
│   ├── csrf.middleware.js          # CSRF token protection
│   ├── error.middleware.js         # Centralized error handling
│   ├── upload.js                   # Multer file upload config
│   └── validate.middleware.js      # Zod validation middleware
├── models/
│   ├── User.js                 # User schema with auth fields
│   ├── Poll.js                 # Poll schema with options and voting
│   ├── Vote.js                 # Vote schema with option tracking
│   ├── Comment.js              # Comment schema with nesting
│   ├── CommentLike.js          # Comment like tracking
│   ├── CommentReport.js        # Comment report tracking
│   ├── Bookmark.js             # User bookmark tracking
│   ├── Notification.js         # Notification schema
│   ├── Report.js               # Content report schema
│   ├── Category.js             # Poll categories
│   ├── AuditLog.js             # Admin action logging
│   ├── SearchHistory.js        # User search history
│   ├── RecentlyViewed.js       # Recently viewed polls
│   ├── RefreshToken.js         # Refresh token storage
│   ├── VerificationToken.js    # OTP verification tokens
│   └── PasswordResetToken.js   # Password reset tokens
├── modules/
│   ├── auth/                   # Authentication module
│   ├── user/                   # User profile module
│   ├── vote/                   # Voting module
│   ├── analytics/              # Poll analytics module
│   ├── comment/                # Comments module
│   ├── bookmark/               # Bookmarks module
│   ├── notification/           # Notifications module
│   ├── search/                 # Search & discovery module
│   ├── admin/                  # Admin panel module
│   └── report/                 # Reports & moderation module
├── services/
│   ├── jwt.service.js          # JWT token generation/verification
│   ├── mail.service.js         # Nodemailer email service
│   ├── mail.templates.js       # Email HTML templates
│   ├── otp.service.js          # OTP generation and verification
│   └── cloudinary.service.js   # Cloudinary image upload/delete
└── utils/
    ├── apiError.js             # Custom API error class
    ├── cookie.util.js          # HttpOnly Secure cookie management
    ├── generateOTP.js          # Cryptographically secure OTP generation
    ├── logger.js               # Pino logger instance
    ├── otp.util.js             # OTP hashing utilities
    ├── passwordStrength.js     # Password strength calculator
    ├── response.js             # Consistent API response formatter
    └── token.util.js           # Secure token generation/hashing
```

---

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- MongoDB 5.x or higher (or MongoDB Atlas)
- SMTP credentials (Gmail, SendGrid, etc.)
- Cloudinary account (for image uploads)

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
yarn health     # Check API health endpoint
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/pollify

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_change_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Security
BCRYPT_SALT_ROUNDS=12
OTP_SALT_ROUNDS=10
OTP_EXPIRY_IN_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
LOGIN_MAX_ATTEMPTS=5
LOGIN_LOCK_MINUTES=15

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=no-reply@pollify.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend
FRONTEND_URL=http://localhost:5173
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

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/verify-email` | No | Verify email with OTP |
| POST | `/auth/resend-verification` | No | Resend verification OTP |
| POST | `/auth/login` | No | Login with username/email + password |
| POST | `/auth/refresh-token` | No | Refresh access token |
| POST | `/auth/logout` | No | Logout and revoke refresh token |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |
| PATCH | `/auth/change-password` | Yes | Change password (logged in) |
| GET | `/auth/me` | Yes | Get current user profile |
| PATCH | `/auth/profile` | Yes | Update profile |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Yes | Get own profile |
| GET | `/users/:username` | No | Get public profile |
| PATCH | `/users/profile` | Yes | Update profile |
| POST | `/users/profile-image` | Yes | Upload profile image |
| DELETE | `/users/profile-image` | Yes | Delete profile image |
| DELETE | `/users` | Yes | Delete account |
| GET | `/users/stats` | Yes | Get account statistics |

### Votes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/votes/polls/:pollId/vote` | Yes | Cast vote |
| PATCH | `/votes/polls/:pollId/vote` | Yes | Change vote |
| DELETE | `/votes/polls/:pollId/vote` | Yes | Remove vote |
| GET | `/votes/polls/:pollId/my-vote` | Yes | Get my vote |
| GET | `/votes/polls/:pollId/voters` | No | Get voters |
| GET | `/votes/polls/:pollId/results` | No | Get poll results |
| GET | `/votes/polls/:pollId/stats` | Yes | Get poll statistics |
| GET | `/votes/me/votes` | Yes | Get user vote history |

### Poll Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics/polls/:pollId` | Yes | Complete poll analytics |
| GET | `/analytics/polls/:pollId/results` | No | Poll results with percentages |
| GET | `/analytics/polls/:pollId/chart` | No | Chart-ready data |
| GET | `/analytics/dashboard` | Yes | Owner dashboard analytics |
| GET | `/analytics/trending` | No | Trending polls |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/comments/polls/:pollId/comments` | Yes | Add comment |
| GET | `/comments/polls/:pollId/comments` | No | Get comments |
| PATCH | `/comments/:commentId` | Yes | Edit comment |
| DELETE | `/comments/:commentId` | Yes | Delete comment |
| POST | `/comments/:commentId/replies` | Yes | Reply to comment |
| POST | `/comments/:commentId/like` | Yes | Like comment |
| DELETE | `/comments/:commentId/like` | Yes | Unlike comment |
| PATCH | `/comments/:commentId/pin` | Yes | Pin comment |
| DELETE | `/comments/:commentId/pin` | Yes | Unpin comment |
| POST | `/comments/:commentId/report` | Yes | Report comment |
| GET | `/comments/polls/:pollId/analytics` | Yes | Comment analytics |

### Bookmarks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookmarks/:pollId` | Yes | Save poll |
| DELETE | `/bookmarks/:pollId` | Yes | Remove bookmark |
| GET | `/bookmarks/:pollId/status` | No | Check save status |
| GET | `/bookmarks` | Yes | Get my bookmarks |
| GET | `/bookmarks/stats` | Yes | Bookmark statistics |

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | List notifications |
| GET | `/notifications/unread-count` | Yes | Get unread count |
| GET | `/notifications/:id` | Yes | Get single notification |
| PATCH | `/notifications/:id/read` | Yes | Mark as read |
| PATCH | `/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/notifications/:id` | Yes | Delete notification |
| DELETE | `/notifications` | Yes | Delete all notifications |
| GET | `/notifications/preferences` | Yes | Get preferences |
| PATCH | `/notifications/preferences` | Yes | Update preferences |

### Search

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/search` | No | Global search |
| GET | `/search/polls` | No | Search polls |
| GET | `/search/users` | No | Search users |
| GET | `/search/categories` | No | Search categories |
| GET | `/search/trending` | No | Trending polls |
| GET | `/search/popular` | No | Popular polls |
| GET | `/search/latest` | No | Latest polls |
| GET | `/search/ending-soon` | No | Polls ending within 24h |
| GET | `/search/recommended` | Yes | Recommended polls |
| GET | `/search/recent` | Yes | Recently viewed polls |
| POST | `/search/recent/:pollId` | Yes | Track poll view |
| GET | `/search/history` | Yes | Search history |
| DELETE | `/search/history` | Yes | Delete all history |
| DELETE | `/search/history/:id` | Yes | Delete one history item |
| GET | `/search/suggestions` | No | Search suggestions |

### Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reports` | Yes | Create report |
| GET | `/reports/my` | Yes | Get my reports |
| GET | `/reports/:reportId` | Yes | Get report details |
| GET | `/reports/analytics` | Admin | Report analytics |
| PATCH | `/reports/:id/review` | Admin | Mark under review |
| PATCH | `/reports/:id/resolve` | Admin | Resolve with action |
| PATCH | `/reports/:id/reject` | Admin | Reject report |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard statistics |
| GET | `/admin/users` | Admin | User management |
| PATCH | `/admin/users/:id/role` | Super Admin | Update user role |
| PATCH | `/admin/users/:id/suspend` | Admin | Suspend user |
| PATCH | `/admin/users/:id/unsuspend` | Admin | Unsuspend user |
| DELETE | `/admin/users/:id` | Super Admin | Delete user |
| GET | `/admin/polls` | Admin | Poll management |
| DELETE | `/admin/polls/:pollId` | Admin | Delete poll |
| PATCH | `/admin/polls/:pollId/restore` | Admin | Restore poll |
| PATCH | `/admin/polls/:pollId/feature` | Super Admin | Feature poll |
| PATCH | `/admin/polls/:pollId/close` | Admin | Close poll |
| GET | `/admin/comments` | Admin | Comment management |
| DELETE | `/admin/comments/:id` | Admin | Delete comment |
| PATCH | `/admin/comments/:id/restore` | Admin | Restore comment |
| GET | `/admin/categories` | Admin | Category management |
| POST | `/admin/categories` | Super Admin | Create category |
| PATCH | `/admin/categories/:id` | Super Admin | Update category |
| DELETE | `/admin/categories/:id` | Super Admin | Delete category |
| PATCH | `/admin/categories/:id/restore` | Super Admin | Restore category |
| POST | `/admin/notifications` | Super Admin | Create notification |
| POST | `/admin/notifications/broadcast` | Super Admin | Broadcast notification |
| GET | `/admin/audit-logs` | Super Admin | Audit trail |
| GET | `/admin/analytics` | Admin | Admin analytics |
| PATCH | `/admin/settings` | Super Admin | System settings |

---

## Security Features

### Authentication & Authorization

- **JWT Access Tokens** (15 min) + **Refresh Tokens** (7 days) with rotation
- **HttpOnly Secure SameSite cookies** for token storage
- **bcrypt** password hashing with configurable salt rounds (default: 12)
- **Account lockout** after 5 failed login attempts
- **CSRF protection** via double-submit cookie pattern
- **Role-based access control** (User, Admin, Super Admin)

### Input Security

- **Zod validation** on all incoming requests
- **MongoDB sanitization** on body, query, and params
- **Magic-byte validation** for file uploads (prevents MIME spoofing)
- **File size limits** (2MB) enforced at Multer level
- **NoSQL injection protection** via mongo-sanitize

### Infrastructure Security

- **Helmet** for security headers (CSP, HSTS, X-Frame-Options)
- **CORS** with strict origin allowlist
- **Rate limiting** on all sensitive endpoints
- **Request size limits** (10kb JSON, 10kb URL-encoded)
- **Pino logger** with sensitive field redaction
- **Centralized error handling** without stack trace exposure in production

### Data Protection

- **TTL indexes** on all token collections for auto-cleanup
- **Soft delete** for comments and polls
- **Audit logging** for all admin actions
- **Original content preservation** on soft deletes

---

## Database Models

### User

```javascript
{
  _id, name, username, email, password (select: false),
  profileImage, bio, website, github, linkedin, twitter, location,
  role: "user" | "admin" | "moderator" | "super_admin",
  isVerified, isSuspended, lastActive,
  loginAttempts, lockedUntil, lastLogin, loginActivity (max 50),
  notificationPreferences, timestamps
}
```

### Poll

```javascript
{
  _id, title, description, options: [{ text, votes }],
  createdBy, status: "draft" | "active" | "expired" | "deleted",
  type: "single" | "multiple" | "anonymous",
  category, allowVoteChange, startsAt, expiresAt,
  totalVotes, lastVoteAt, savedCount, tags, timestamps
}
```

### Vote

```javascript
{
  _id, userId, pollId, selectedOptions: [String],
  isAnonymous, ipAddress, userAgent, timestamps
}
```

### Comment

```javascript
{
  _id, pollId, userId, parentCommentId (null for top-level),
  content, likesCount, repliesCount, isEdited, isPinned, isDeleted,
  originalContent (for audit trail), timestamps
}
```

### Notification

```javascript
{
  _id, recipientId, senderId, type, title, message,
  entityType, entityId, isRead, readAt, metadata, timestamps
}
```

### Report

```javascript
{
  _id, reporterId, targetType, targetId, reason, description,
  status, reviewedBy, reviewedAt, adminNotes, moderationAction, timestamps
}
```

### Bookmark

```javascript
{
  _id, userId, pollId, timestamps
}
```

### Category

```javascript
{
  _id, name, description, slug, isActive, pollCount, timestamps
}
```

### AuditLog

```javascript
{
  _id, adminId, action, targetType, targetId, details,
  ipAddress, userAgent, timestamps
}
```

---

## Rate Limits

| Endpoint Category | Limit | Window |
| ------------------ | ----- | ------ |
| Global API | 100 requests | 15 minutes |
| Auth endpoints | 5-10 requests | 15 minutes |
| Comment/Report creation | 20-30 requests | 15 minutes |
| Admin endpoints | 200 requests | 15 minutes |
| Search endpoints | 100 requests | 15 minutes |

---

## Error Codes

| Status Code | Meaning |
| ----------- | -------- |
| 200 | Success |
| 201 | Created |
| 202 | Accepted |
| 400 | Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 413 | Payload Too Large |
| 423 | Locked |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## CI/CD

The project uses GitHub Actions for continuous integration.

**Pipeline Steps:**

1. Checkout repository
2. Setup Node.js 22 with Yarn cache
3. Install dependencies
4. Run ESLint
5. Run format check
6. Run security audit
7. Upload source artifact

---

## Scripts

```bash
yarn dev        # Start with nodemon (development)
yarn start      # Start with node (production)
yarn lint       # Run ESLint
yarn lint:fix   # Auto-fix ESLint issues
yarn format     # Run Prettier
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint and Prettier configurations
- Use Conventional Commits for commit messages
- Follow Clean Architecture and SOLID principles
- Write modular, reusable, and testable code
- Ensure all CI checks pass before submitting PR

---

## License

This project is licensed under the MIT License.

---

## Author

Built by Muhammad Umar as part of the Pollify polling web application.

For questions or support, open an issue on GitHub.
