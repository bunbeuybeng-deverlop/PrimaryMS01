from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    attendance,
    auth,
    classes,
    fees,
    parents,
    reports,
    scores,
    students,
    subjects,
    teachers,
    timetable,
)

app = FastAPI(
    title="PrimaryMS API",
    description="REST API backend for the PrimaryMS school management system.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(parents.router)
app.include_router(classes.router)
app.include_router(subjects.router)
app.include_router(attendance.router)
app.include_router(scores.router)
app.include_router(fees.router)
app.include_router(timetable.router)
app.include_router(reports.router)


@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "service": "PrimaryMS API"}


@app.get("/api/health/", tags=["health"])
async def health_check():
    return {"status": "healthy"}
