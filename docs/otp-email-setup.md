# SMTP + OTP Email Setup Guide (cPanel)

This guide explains how to configure email (SMTP) for OTP verification on cPanel and how to test that it works with your backend.

## Overview
- Create a mailbox in cPanel (e.g., `no-reply@megajobnepal.com.np`).
- Retrieve SMTP details from cPanel (host, port, security).
- Add SMTP environment variables in cPanel’s Node.js App for the backend.
- Restart the app and test OTP send/verify endpoints.

## Prerequisites
- cPanel access for your domain.
- Node.js application created in cPanel → Setup Node.js App (Root: `api`, URL: `/api`, Startup file: `server.js`).
- Backend uploaded into the `api` directory.

## Step 1: Create the Mailbox in cPanel
1. Log into cPanel.
2. Go to `Email Accounts`.
3. Click `Create` and set:
   - Username: `no-reply` (recommended for transactional mail)
   - Domain: `megajobnepal.com.np`
   - Password: set a strong password and save it securely
4. Optionally test the mailbox via Webmail to confirm the password works.

## Step 2: Get SMTP Details from cPanel
1. In `Email Accounts`, find your mailbox → click `Connect Devices` or `Configure Mail Client`.
2. Note the outgoing server values:
   - `Outgoing Server (SMTP)`: typically `mail.megajobnepal.com.np`
   - Ports: `587` (STARTTLS) or `465` (SSL)
3. Recommended:
   - Use port `587` with STARTTLS → `SMTP_SECURE=false`
   - If you use port `465`, set `SMTP_SECURE=true`

## Step 3: Add SMTP Environment Variables (cPanel Node.js App)
1. Open cPanel → `Setup Node.js App`.
2. Select your app (Root: `api`, URL: `/api`).
3. Click `Environment Variables` and add:
   - `SMTP_HOST=mail.megajobnepal.com.np`
   - `SMTP_PORT=587`
   - `SMTP_SECURE=false`
   - `SMTP_USER=no-reply@megajobnepal.com.np`
   - `SMTP_PASS=<your mailbox password>`
4. Also ensure production vars are set (examples):
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://megajobnepal.com.np`
   - `CORS_ORIGINS=https://megajobnepal.com.np`
   - Database: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE=megajob1_megajobnepal`, `MYSQL_SKIP_CREATE_DB=true`, `ALLOW_DEV_MEMORY_FALLBACK=false`
5. Click `Save` and then `Restart App`.

## Step 4: Code References (already configured)
- `backend/utils/sendEmail.js` reads `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and falls back to `EMAIL_USER`/`EMAIL_PASS` if present.
- `backend/services/otpService.js` uses the same SMTP env variables and verifies the transporter at startup.

## Step 5: Test the OTP Flow
### API Endpoints
- Send OTP: `POST /api/auth/send-otp`
  - Body: `{ "email": "test@megajobnepal.com.np" }`
  - Expected: `{ "message": "OTP sent successfully" }`
- Verify OTP: `POST /api/auth/verify-otp`
  - Body: `{ "email": "test@megajobnepal.com.np", "otp": "123456" }`
  - Expected: `{ "message": "OTP verified successfully" }` if valid and not expired
- Signup with OTP: `POST /api/auth/signup`
  - Body includes `email`, `password`, `user_type`, `full_name`, `otp`, and optional `phone_number`/`company_data`.

### Frontend Flow (if using the app UI)
- Start signup with a new email → the app calls `/auth/send-otp` and emails the code.
- Enter the 6-digit OTP in the verification form → the app calls `/auth/verify-otp` or completes signup.

## Troubleshooting
- No email received:
  - Verify `SMTP_*` env vars are set correctly and restart the Node app.
  - Ensure your hosting provider allows outbound SMTP on `587` or `465`.
  - Check app logs in the Node.js App Manager for any transporter errors.
- Using port `465`:
  - Set `SMTP_SECURE=true`.
- Gmail instead of cPanel mail:
  - Use Gmail App Password (not your normal password):
    - `SMTP_HOST=smtp.gmail.com`
    - `SMTP_PORT=587`
    - `SMTP_SECURE=false`
    - `SMTP_USER=<your Gmail address>`
    - `SMTP_PASS=<your Gmail App Password>`

## Notes
- Restart the Node.js app after changing environment variables.
- OTP expiry defaults to 5–10 minutes depending on the endpoint logic.
- Deployment guide: see `docs/deploy-cpanel.md` for full backend/frontend deployment steps.