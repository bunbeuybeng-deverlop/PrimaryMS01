import datetime as dt

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin, require_any
from app.models.attendance import Attendance, AttendanceStatus
from app.models.class_ import Class
from app.models.fee import Fee, FeeStatus
from app.models.parent import Parent
from app.models.score import Score
from app.models.student import Student
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.report import (
    AttendanceReport,
    AttendanceStatItem,
    ScoreReport,
    ScoreStatItem,
    SummaryReport,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("/summary/", response_model=SummaryReport, dependencies=[Depends(require_admin)])
async def get_summary(db: AsyncSession = Depends(get_db)):
    today = dt.date.today()

    total_students = (await db.execute(select(func.count()).select_from(Student).where(Student.is_active.is_(True)))).scalar_one()
    total_teachers = (await db.execute(select(func.count()).select_from(Teacher).where(Teacher.is_active.is_(True)))).scalar_one()
    total_parents = (await db.execute(select(func.count()).select_from(Parent))).scalar_one()
    total_classes = (await db.execute(select(func.count()).select_from(Class))).scalar_one()
    total_subjects = (await db.execute(select(func.count()).select_from(Subject))).scalar_one()

    present_today = (
        await db.execute(
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.date == today, Attendance.status == AttendanceStatus.present)
        )
    ).scalar_one()
    absent_today = (
        await db.execute(
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.date == today, Attendance.status == AttendanceStatus.absent)
        )
    ).scalar_one()

    unpaid_total = (
        await db.execute(
            select(func.coalesce(func.sum(Fee.amount), 0.0)).where(Fee.status != FeeStatus.paid)
        )
    ).scalar_one()
    overdue_count = (
        await db.execute(select(func.count()).select_from(Fee).where(Fee.status == FeeStatus.overdue))
    ).scalar_one()

    return SummaryReport(
        total_students=total_students,
        total_teachers=total_teachers,
        total_parents=total_parents,
        total_classes=total_classes,
        total_subjects=total_subjects,
        attendance_today_present=present_today,
        attendance_today_absent=absent_today,
        fees_unpaid_total=float(unpaid_total),
        fees_overdue_count=overdue_count,
    )


@router.get("/attendance/", response_model=AttendanceReport, dependencies=[Depends(require_any)])
async def get_attendance_report(
    db: AsyncSession = Depends(get_db),
    student_id: int | None = Query(default=None),
    class_id: int | None = Query(default=None),
    date_from: dt.date | None = Query(default=None),
    date_to: dt.date | None = Query(default=None),
):
    stmt = select(Attendance.status, func.count()).group_by(Attendance.status)
    if student_id is not None:
        stmt = stmt.where(Attendance.student_id == student_id)
    if class_id is not None:
        stmt = stmt.where(Attendance.class_id == class_id)
    if date_from is not None:
        stmt = stmt.where(Attendance.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Attendance.date <= date_to)

    result = await db.execute(stmt)
    rows = result.all()
    breakdown = [AttendanceStatItem(status=status.value, count=count) for status, count in rows]
    total = sum(item.count for item in breakdown)

    return AttendanceReport(
        student_id=student_id,
        class_id=class_id,
        date_from=date_from.isoformat() if date_from else None,
        date_to=date_to.isoformat() if date_to else None,
        breakdown=breakdown,
        total_records=total,
    )


@router.get("/scores/", response_model=ScoreReport, dependencies=[Depends(require_any)])
async def get_score_report(
    db: AsyncSession = Depends(get_db),
    student_id: int | None = Query(default=None),
    class_id: int | None = Query(default=None),
):
    stmt = (
        select(
            Subject.id,
            Subject.name,
            func.avg(Score.score),
            func.avg(Score.max_score),
            func.count(Score.id),
        )
        .join(Score, Score.subject_id == Subject.id)
        .group_by(Subject.id, Subject.name)
    )
    if student_id is not None:
        stmt = stmt.where(Score.student_id == student_id)
    if class_id is not None:
        stmt = stmt.join(Student, Student.id == Score.student_id).where(Student.class_id == class_id)

    result = await db.execute(stmt)
    rows = result.all()

    subjects = [
        ScoreStatItem(
            subject_id=subject_id,
            subject_name=name,
            average_score=round(float(avg_score or 0), 2),
            max_possible=round(float(avg_max or 0), 2),
            count=count,
        )
        for subject_id, name, avg_score, avg_max, count in rows
    ]

    overall_average = round(sum(s.average_score for s in subjects) / len(subjects), 2) if subjects else 0.0

    return ScoreReport(
        student_id=student_id,
        class_id=class_id,
        subjects=subjects,
        overall_average=overall_average,
    )
