# Pollify authentication API

Set the variables in `.env.example` before starting the service. JWT secrets must be distinct, random values of at least 32 characters.

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | No | Register an unverified user and send an OTP. Multipart supports optional `profileImage`. |
| POST | `/api/v1/auth/verify-email` | No | Verify `{ email, otp }`. |
| POST | `/api/v1/auth/resend-otp` | No | Resend an OTP after its cooldown. |
| POST | `/api/v1/auth/login` | No | Login with `{ identifier, password, rememberMe? }`; sets HttpOnly cookies. |
| POST | `/api/v1/auth/refresh-token` | Refresh cookie | Rotate refresh token and issue a new access token. |
| POST | `/api/v1/auth/logout` | Optional refresh cookie | Revoke the current refresh session and clear cookies. |
| POST | `/api/v1/auth/forgot-password` | No | Request password reset instructions without account enumeration. |
| POST | `/api/v1/auth/reset-password` | No | Reset using `{ token, password, confirmPassword }`. |
| PATCH | `/api/v1/auth/change-password` | Access token | Change password with current password confirmation. |
| GET | `/api/v1/auth/me` | Access token | Return the current user. |
| PATCH | `/api/v1/auth/profile` | Access token | Update name, username, and/or optional profile image. |

Pass an access token as `Authorization: Bearer <token>`; browser clients may instead use the HttpOnly access cookie. Refresh tokens are never returned in JSON and are stored only as hashes in MongoDB.
