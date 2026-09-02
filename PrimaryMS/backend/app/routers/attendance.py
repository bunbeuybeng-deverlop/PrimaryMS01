import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, require_admin_or_teacher, require_any
from app.models.attendance import Attendance, AttendanceStatus
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


@router.get("/", response_model=list[AttendanceRead], dependencies=[Depends(require_any)])
async def list_attendance(
    db: AsyncSession = Depends(get_db),
    student_id: int | None = Query(default=None),
    class_id: int | None = Query(default=None),
    status_filter: AttendanceStatus | None = Query(default=None, alias="status"),
    date_from: dt.date | None = Query(default=None),
    date_to: dt.date | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Attendance).options(
        selectinload(Attendance.student),
        selectinload(Attendance.class_),
    )
    if student_id is not None:
        stmt = stmt.where(Attendance.student_id == student_id)
    if class_id is not None:
        stmt = stmt.where(Attendance.class_id == class_id)
    if status_filter is not None:
        stmt = stmt.where(Attendance.status == status_filter)
    if date_from is not None:
        stmt = stmt.where(Attendance.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Attendance.date <= date_to)
    stmt = stmt.order_by(Attendance.date.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_or_teacher)])
async def create_attendance(payload: AttendanceCreate, db: AsyncSession = Depends(get_db)):
    record = Attendance(**payload.model_dump())
    db.add(record)
    await db.commit()
    # Reload with relationships
    stmt = select(Attendance).where(Attendance.id == record.id).options(
        selectinload(Attendance.student),
        selectinload(Attendance.class_),
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{attendance_id}/", response_model=AttendanceRead, dependencies=[Depends(require_any)])
async def get_attendance(attendance_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Attendance).where(Attendance.id == attendance_id).options(
        selectinload(Attendance.student),
        selectinload(Attendance.class_),
    )
    result = await db.execute(stmt)
    record = result.scalar_one_or_none()
    if record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return record


@router.put("/{attendance_id}/", response_model=AttendanceRead, dependencies=[Depends(require_admin_or_teacher)])
async def update_attendance(attendance_id: int, payload: AttendanceUpdate, db: AsyncSession = Depends(get_db)):
    record = await db.get(Attendance, attendance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)
    await db.commit()
    # Reload with relationships
    stmt = select(Attendance).where(Attendance.id == record.id).options(
        selectinload(Attendance.student),
        selectinload(Attendance.class_),
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{attendance_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_or_teacher)])
async def delete_attendance(attendance_id: int, db: AsyncSession = Depends(get_db)):
    record = await db.get(Attendance, attendance_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    await db.delete(record)
    await db.commit()
