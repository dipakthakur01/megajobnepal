## Running locally

- Frontend
  - `cd frontend`
  - `npm install`
  - `npm run dev` → Vite at `http://localhost:5173/`
  - Vite proxies `/api` and `/uploads` to `http://localhost:3005`

- Backend
  - `cd backend`
  - `npm install`
  - Recommended (to avoid .env overriding shell): in PowerShell
    - `$env:NODE_ENV='production' ; $env:PORT='3005'`
  - `npm run dev` → Express at `http://localhost:3005`
  - If MySQL isn’t running locally, backend falls back to in‑memory storage by default.

- Health endpoints
  - Backend: `http://localhost:3005/health`, `http://localhost:3005/api/status`
  - Static uploads: `http://localhost:3005/uploads/`

## cPanel notes (for hosting later)

- Frontend
  - Upload `frontend/dist/` contents to your domain’s document root (e.g., `public_html`).
  - Ensure `public_html/.htaccess` exempts `/api` and `/uploads`, then routes SPA paths to `index.html`.

- Backend
  - Use cPanel → Setup Node.js App
    - Application Root: `/home3/<user>/api`
    - Application URL: `/api`
    - Startup file: `server.js`
  - Place backend code in `/home3/<user>/api` (outside `public_html`).
  - Add environment variables (MySQL and SMTP) in the Node.js App Manager.
  - Create `public_html/api/.htaccess` with Passenger directives (see `docs/public_html_api.htaccess`).

For full deployment steps, see `docs/deploy-cpanel.md`.
  