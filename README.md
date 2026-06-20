# Nutrivae HRMS

Nutrivae is an original, modern HR management SaaS starter covering people operations, leave, performance, recruitment, payroll-ready compensation, and HR analytics.

## Stack

- React, TypeScript, Vite, Tailwind CSS
- React Query, React Hook Form, Zod
- Node.js, Express, REST, JWT access and refresh tokens
- PostgreSQL and Prisma
- Vitest, React Testing Library, Supertest
- npm workspaces monorepo and Docker Compose

REST is used because the domain has clear resource boundaries, conventional caching/authorization behavior, and straightforward integration requirements. The API is versioned under `/api/v1`.

## Architecture

```text
projects/
  service-nutrivae-ui/ React SPA and UI design system
  service-nutrivae-api/ HTTP entry point and domain modules
packages/
  database/            Prisma schema, client, migrations, seed
  shared/              DTO types and Zod validation contracts
services/
  auth-service/        documented extraction boundary
  employee-service/
  leave-service/
  performance-service/
  recruitment-service/
  notification-service/
```

The backend starts as a modular monolith. Controllers (Express routes) validate DTOs and call domain/application workflows; persistence is isolated behind Prisma access. The module boundaries map one-to-one to future deployable services, without requiring a message broker or six databases during early product development.

## Quick start

Requirements: Node.js 22+, npm 10+, Docker.

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npm run db:generate
npm run db:bootstrap
npm run dev
```

If you prefer the Prisma command directly:

```bash
npx prisma migrate reset --schema packages/database/prisma/schema.prisma
```

This development command recreates the database and runs the seed. Do not use it against production data.

`db:bootstrap` is the recommended local recovery command when demo credentials stop working after a schema upgrade.

Open:

- Web app: http://localhost:5173
- API: http://localhost:4000
- Swagger: http://localhost:4000/docs
- Health check: http://localhost:4000/health

Demo login: `admin@nutrivae.com` / `Welcome123!`

## Deployable projects

- `projects/service-nutrivae-ui` builds independently with `npm run build -w service-nutrivae-ui`.
- `projects/service-nutrivae-api` builds independently with `npm run build -w service-nutrivae-api`.
- UI conventions are documented in `projects/service-nutrivae-ui/UI_STANDARDS.md`.

To run everything in containers:

```bash
docker compose up --build
```

Run verification:

```bash
npm run typecheck
npm test
npm run build
```

## Frontend routes

| Route          | Module                | Access                                        |
| -------------- | --------------------- | --------------------------------------------- |
| `/login`       | Authentication        | Public                                        |
| `/`            | HR overview           | Authenticated                                 |
| `/employees`   | People directory      | Authenticated; writes are Admin/HR            |
| `/leave`       | Balances and requests | Authenticated; approvals are Admin/HR/Manager |
| `/performance` | Goals and reviews     | Authenticated                                 |
| `/recruitment` | Jobs and candidates   | Authenticated                                 |
| `/payroll`     | Compensation/export   | Authenticated                                 |
| `/analytics`   | People analytics      | Authenticated                                 |

## API overview

| Method and path             | Purpose                         |
| --------------------------- | ------------------------------- |
| `POST /auth/login`          | Issue access and refresh tokens |
| `POST /auth/refresh`        | Renew an expired access token   |
| `POST /auth/logout`         | Revoke refresh token            |
| `GET /employees`            | Paginated employee search       |
| `POST /employees`           | Create employee (Admin/HR)      |
| `GET /employees/:id`        | Full employee profile           |
| `GET /leave`                | Role-scoped leave requests      |
| `POST /leave`               | Submit validated leave request  |
| `PATCH /leave/:id/decision` | Approve/reject transactionally  |
| `GET /dashboard/summary`    | Aggregated HR dashboard         |
| `GET /performance/goals`    | Goal portfolio                  |
| `GET /recruitment/jobs`     | Openings and candidate pipeline |

The complete interactive contract is available at `/docs`.

## Security notes

- Short-lived access tokens and revocable, hashed refresh tokens
- Role middleware for sensitive endpoints
- Zod input validation and normalized error responses
- Helmet, CORS, body limits, and auth rate limiting
- Password hashing with bcrypt
- Audit records for employee and leave mutations
- Transactional leave approval and balance updates
- Company-scoped data access with switchable workspaces
- Custom role profiles with granular permissions

For production, store refresh tokens in secure, `httpOnly`, same-site cookies; use a managed secret store; add CSRF protection where needed; and connect centralized logs/metrics. The JSON refresh-token transport in this starter keeps local and mobile-client integration simple.

## Database

The Prisma schema includes users, employees, departments, teams, job titles, documents, leave types/balances/requests, holidays, goals, reviews, job openings, candidates, salary history, refresh tokens, and audit logs.

Create production migrations with:

```bash
npm run db:migrate -- --name descriptive_change_name
```

## Environment

See `.env.example`. Never commit real secrets. Use unique 32+ byte JWT secrets in deployed environments.
