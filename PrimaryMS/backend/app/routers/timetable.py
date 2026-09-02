from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin, require_any
from app.models.timetable import DayOfWeek, Timetable
from app.schemas.timetable import TimetableCreate, TimetableRead, TimetableUpdate

router = APIRouter(prefix="/api/timetable", tags=["timetable"])


@router.get("/", response_model=list[TimetableRead], dependencies=[Depends(require_any)])
async def list_timetable(
    db: AsyncSession = Depends(get_db),
    class_id: int | None = Query(default=None),
    teacher_id: int | None = Query(default=None),
    day_of_week: DayOfWeek | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=200, ge=1, le=500),
):
    stmt = select(Timetable)
    if class_id is not None:
        stmt = stmt.where(Timetable.class_id == class_id)
    if teacher_id is not None:
        stmt = stmt.where(Timetable.teacher_id == teacher_id)
    if day_of_week is not None:
        stmt = stmt.where(Timetable.day_of_week == day_of_week)
    stmt = stmt.order_by(Timetable.day_of_week, Timetable.start_time).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=TimetableRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_timetable_entry(payload: TimetableCreate, db: AsyncSession = Depends(get_db)):
    entry = Timetable(**payload.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/{entry_id}/", response_model=TimetableRead, dependencies=[Depends(require_any)])
async def get_timetable_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    entry = await db.get(Timetable, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    return entry


@router.put("/{entry_id}/", response_model=TimetableRead, dependencies=[Depends(require_admin)])
async def update_timetable_entry(entry_id: int, payload: TimetableUpdate, db: AsyncSession = Depends(get_db)):
    entry = await db.get(Timetable, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.delete("/{entry_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_timetable_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    entry = await db.get(Timetable, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Timetable entry not found")
    await db.delete(entry)
    await db.commit()
