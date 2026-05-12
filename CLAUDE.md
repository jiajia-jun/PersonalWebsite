# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
go mod download          # Install dependencies
go run main.go           # Start server on localhost:8080
go build -o main.exe     # Compile to binary
```

There are no tests yet.

## Architecture

Personal showcase website built with Gin (Go). Module name: `Goland`.

**Public site (no login required):**
- `/` — Single-page scrolling showcase (Hero → About → Contact)
- `/admin` — Admin login + profile editor (JWT-protected)

**Layers:**
- `api/` — HTTP handlers and router (`BuildRouter_handler.go`)
  - `Auth_handler.go` — Login handler
  - `UpdatePassword_handler.go` — Password change handler
  - `Profile_handler.go` — `GetPublicProfile` (public GET), `UpdateProfile` (protected PUT), `CheckAdminAuth` (protected GET)
- `middleware/` — JWT auth (`auth.go`) and request logging (`logger.go`, wired in router)
- `dao/` — Two data access layers:
  - `userdata.go` — User credentials: `map[string]string` persisted to `E:\test\userdata.json`
  - `profiledata.go` — Profile info: `model.Profile` struct persisted to `./data/profile.json`
- `model/` — `User` and `Profile` structs
- `utils/` — JWT token generation/parsing (HS256, 2-hour expiry)

**Router structure:**
- Public HTML: `GET /` → `index.html`, `GET /admin` → `admin.html`
- Public API: `GET /api/profile`, `POST /api/login`, `POST /api/updatepassword`
- Protected API (`/api` group with `AuthMiddleware()`): `PUT /api/profile`, `GET /api/admin/check`

**JWT flow:** Login → server returns token → client stores in localStorage → `Authorization: Bearer <token>` → `AuthMiddleware` validates and injects `username` into Gin context.

## Important: Hardcoded Paths

- User data JSON: `E:\test\userdata.json` (auto-created on first run if missing)
- Profile data JSON: `./data/profile.json` (relative to working directory, auto-created with defaults)

The admin account must be created manually by adding an entry to `E:\test\userdata.json`, e.g., `{"admin": "yourpassword"}`.

## Frontend

- `static/index.html` + `home.js` + `showcase.css` — Public showcase (fetches `/api/profile`, typewriter effect, IntersectionObserver scroll animations)
- `static/admin.html` + `admin.js` — Admin panel: login view + profile editor view, toggled by JWT presence
- `static/docsy-styles.css` — Design system CSS variables shared across pages
- `static/styles.css` — Reset, animations, form/card styles used by admin page
