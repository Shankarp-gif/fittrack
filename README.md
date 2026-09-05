# FitTrack - Gym Activity and Fitness Management Platform

FitTrack is a full-stack fitness platform built for real workout tracking, profile-driven onboarding, exercise discovery, and secure account management.

This repository is organized as a monorepo:

- `apps/frontend` - React + Vite + TypeScript web app
- `apps/backend` - Spring Boot 3.5 + Java 21 REST API

## Core Features Implemented

- JWT auth flow: register, login, refresh token
- Secure password hashing with BCrypt
- Protected API routes with Spring Security
- Profile model + onboarding-ready fields
- Exercise library API with pagination and filters
- Optimized dashboard API (`GET /api/dashboard`)
- Global API error response format
- Flyway migration with seed data
- Responsive dark-first frontend shell
- Landing page + auth pages + dashboard + exercises page

## Tech Stack

### Frontend

- React
- Vite
- TypeScript
- React Router
- Axios
- Recharts (installed)
- Lucide React icons
- Vitest + Testing Library

### Backend

- Java 21+
- Spring Boot
- Spring Web
- Spring Data JPA
- Spring Security
- JWT (`jjwt`)
- Bean Validation
- PostgreSQL
- Flyway migrations
- OpenAPI/Swagger (`/swagger-ui/index.html`)

## Backend Architecture

`controller -> service -> repository -> entity`

Additional packages:

- `config`
- `security`
- `dto`
- `mapper`
- `exception`

## Environment Variables

Copy `.env.example` and adjust values for your environment.

Key variables:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET` (base64)
- `JWT_ACCESS_EXP_MIN`
- `VITE_API_URL`

## Default Demo Credentials

- Email: `demo@fittrack.app`
- Password: `admin`

## Local Startup

### 1) Frontend

```powershell
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack\apps\frontend"
npm install
npm run dev
```

### 2) Backend (default local profile)

```powershell
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack\apps\backend"
.\mvnw.cmd spring-boot:run
```

### 3) Backend with PostgreSQL `fitness` database

If you want the backend connected to PostgreSQL instead of the local H2 database, use PostgreSQL on port `5433` with a database named `fitness`.

```powershell
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack\apps\backend"
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5433/fitness"
$env:DB_USERNAME="admin"
$env:DB_PASSWORD="admin"
.\mvnw.cmd spring-boot:run
```

Or, if you already have PostgreSQL running locally with a database named `fitness`, set:

```powershell
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DB_URL="jdbc:postgresql://localhost:5433/fitness"
$env:DB_USERNAME="admin"
$env:DB_PASSWORD="admin"
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack\apps\backend"
.\mvnw.cmd spring-boot:run
```

## Docker Startup

```powershell
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack"
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:1111`
- Swagger UI: `http://localhost:1111/swagger-ui/index.html`

## Testing

### Frontend

```powershell
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack\apps\frontend"
npm run test
```

### Backend

```powershell
cd "C:\Users\shank\Downloads\GymTrackPro\fittrack\apps\backend"
.\mvnw.cmd test
```

## API Highlights

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/exercises`
- `GET /api/dashboard`

## Deployment Notes

- Set production secrets via environment variables only
- Use `SPRING_PROFILES_ACTIVE=prod` for backend
- Deploy frontend as static assets and point `VITE_API_URL` to your backend URL

## Next Build Phases

- Workout creation + execution player
- Goals and achievements engine
- Activity calendar + cardio tracking
- Trainer/Admin modules
- Notification center and additional analytics charts
