# Deploy to cPanel (megajobnepal.com.np)

## Overview
- Frontend: Vite React app uploaded to `public_html`
- Backend: Node.js app mounted at `/api` via cPanel Node.js Application Manager
- Database: MySQL (cPanel) using `mysql2`

## Prerequisites
- cPanel access for megajobnepal.com.np
- MySQL user `megajob1_thakur_db` with privileges on DB `megajob1_megajobnepal` (as in your screenshot)

## Backend (Node.js API)
1. cPanel → Setup Node.js App → Create Application
   - Application Root: `api`
   - Application URL: `/api`
   - Node version: 16+/18+/20+
   - Startup file: `server.js`
2. Upload backend files into `~/api`
   - Include `server.js`, `routes/`, `controllers/`, `config/`, `utils/`, `package.json`
3. Click “Run NPM Install”
4. Environment Variables (cPanel → Environment Variables)
   - `NODE_ENV=production`
   - `PORT=3001`
   - `MYSQL_HOST=localhost`
   - `MYSQL_PORT=3306`
   - `MYSQL_USER=megajob1_thakur_db`
   - `MYSQL_PASSWORD=<your password>`
   - `MYSQL_DATABASE=megajob1_megajobnepal`
   - `MYSQL_SKIP_CREATE_DB=true`
   - `ALLOW_DEV_MEMORY_FALLBACK=false`
   - `FRONTEND_URL=https://megajobnepal.com.np`
   - `CORS_ORIGINS=https://megajobnepal.com.np`
   - `JWT_SECRET=<strong secret>`
   - Email (choose ONE of the following setups):
     - Generic SMTP (recommended for cPanel mailboxes):
       - `SMTP_HOST=mail.megajobnepal.com.np` (or your provider)
       - `SMTP_PORT=587`
       - `SMTP_SECURE=false`
       - `SMTP_USER=<your full mailbox, e.g., no-reply@megajobnepal.com.np>`
       - `SMTP_PASS=<your mailbox password>`
     - Gmail App Password (if you prefer Gmail):
       - `SMTP_HOST=smtp.gmail.com`
       - `SMTP_PORT=587`
       - `SMTP_SECURE=false`
       - `SMTP_USER=<your Gmail address>`
       - `SMTP_PASS=<your Gmail App Password>`
     - Legacy fallback (still works):
       - `EMAIL_USER=<same as SMTP_USER>`
       - `EMAIL_PASS=<same as SMTP_PASS>`
5. Create uploads dir (optional; auto-created on first upload)
   - `~/api/uploads/hero` (or rely on auto-create)
6. Restart app
7. Verify
   - `https://megajobnepal.com.np/api/status` returns JSON
   - `https://megajobnepal.com.np/uploads/` serves static files

## Frontend (Vite React)
1. Configure API URL
   - `frontend/.env.production` contains:
     - `VITE_API_URL=https://megajobnepal.com.np/api`
     - `VITE_APP_URL=https://megajobnepal.com.np`
2. Build locally
   - In `frontend`: `npm install` then `npm run build`
   - Outputs `frontend/dist/`
3. Upload to cPanel → File Manager → `public_html/`
   - Upload contents of `dist/` (index.html, assets/, etc.) into `public_html`
4. SPA routing (React Router)
   - Create `public_html/.htaccess`:
```
RewriteEngine On
RewriteBase /
RewriteRule ^api/ - [L]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule . /index.html [L]
```
5. Verify
   - Visit `https://megajobnepal.com.np/`
   - Navigate through pages; routes should work

## Hero Upload Flow
- Frontend calls: `POST /api/site/sections/homepage_hero/upload-image` with `FormData(image)`
- Backend saves to `uploads/hero` and returns a public URL
- Admin → Site → Site Management → Upload → Save Hero → Homepage reflects changes

## Troubleshooting
- White page on direct route: ensure `.htaccess` is set for SPA
- API 404: confirm Node app URL `/api` and restart app
- CORS blocked: set `FRONTEND_URL` and `CORS_ORIGINS` to your domain
- Upload 500: ensure `~/api/uploads` is writable; check server logs
 - Emails not sending: verify `SMTP_*` (or `EMAIL_*`) env vars and that your hosting provider allows outbound SMTP on the chosen port

## Notes
- Do not hardcode ports; cPanel assigns the port and proxies `/api`
- Environment variables in cPanel override `.env` values