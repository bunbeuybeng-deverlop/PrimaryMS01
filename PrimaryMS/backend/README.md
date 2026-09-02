# PrimaryMS Backend

FastAPI + PostgreSQL REST API for the PrimaryMS school management system.

## Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

Copy-Item .env.example .env
# edit .env: set DATABASE_URL / DATABASE_URL_SYNC to your Postgres instance,
# and set SECRET_KEY to a long random string.
```

You need a running PostgreSQL instance with a database matching your `.env`
(e.g. `createdb primaryms`).

## Run migrations

```powershell
cd backend
alembic upgrade head
```

Run migrations from `backend` and ensure `DATABASE_URL_SYNC` in `backend\.env`
uses the intended PostgreSQL username, password, host, port, and database.
The application loads this file relative to the backend directory, so changing
the current working directory does not silently switch to the defaults.

This creates all tables, enums, and the `student_class` many-to-many table.

## Seed demo data

```bash
python seed.py
```

Creates:
- 1 admin (`admin` / `admin123`)
- 5 teachers (`teacher1`..`teacher5` / `teacher123`), each with a linked user account
- 10 parents (`parent1`..`parent10` / `parent123`), each with a linked user account
- 30 students distributed across 4 classes and 10 parents
- 6 subjects, a weekly timetable, 10 days of attendance, quiz+midterm scores, and fee records

The script is idempotent — it checks for an existing `admin` user and skips seeding if the DB already looks populated.

## Run the API

```bash
uvicorn app.main:app --reload
```

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health check: http://localhost:8000/api/health/

## Auth flow

1. `POST /api/auth/login/` with `{"username": ..., "password": ...}` → returns a JWT `access_token`.
2. Send `Authorization: Bearer <token>` on subsequent requests.
3. `GET /api/auth/me/` returns the current user.

Role-based access:
- **admin**: full access to everything, including `/fees/`, `/teachers/`, `/parents/`, `/classes/`, `/subjects/`.
- **teacher**: read/write on `/students/`, `/attendance/`, `/scores/`; read-only elsewhere it has access to.
- **parent**: read-only access to students/classes/subjects/attendance/scores/timetable it's permitted to view; no access to `/fees/`, `/teachers/`, `/parents/` management endpoints.

## Notes on schema decisions

- `students.class_id` is each student's **homeroom** class. The `student_class`
  join table additionally supports multi-class enrollment (electives, etc.) —
  the seed script enrolls each student in their homeroom via this table too.
- All enums (`role`, `gender`, `attendance status`, `exam_type`, `fee status`,
  `day_of_week`) are native Postgres enum types, matching the schema in the
  design doc.
- Passwords are hashed with `bcrypt` directly (not via `passlib`, which has a
  known incompatibility with `bcrypt>=4.0`'s version metadata).

## Project layout

```
backend/
├── app/
│   ├── main.py              FastAPI app, CORS, router mounts
│   ├── database.py          Async SQLAlchemy engine + session
│   ├── models/               SQLAlchemy ORM models
│   ├── schemas/               Pydantic request/response models
│   ├── routers/               API route handlers
│   └── core/                 config, security (JWT/bcrypt), deps (auth guards)
├── alembic/                  DB migrations
├── seed.py                   Demo data seed script
├── requirements.txt
└── .env.example
```
