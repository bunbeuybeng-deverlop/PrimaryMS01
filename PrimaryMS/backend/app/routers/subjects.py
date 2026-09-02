from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin, require_any
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


@router.get("/", response_model=list[SubjectRead], dependencies=[Depends(require_any)])
async def list_subjects(
    db: AsyncSession = Depends(get_db),
    teacher_id: int | None = Query(default=None),
    q: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Subject)
    if teacher_id is not None:
        stmt = stmt.where(Subject.teacher_id == teacher_id)
    if q:
        stmt = stmt.where(Subject.name.ilike(f"%{q}%"))
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=SubjectRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_subject(payload: SubjectCreate, db: AsyncSession = Depends(get_db)):
    subject = Subject(**payload.model_dump())
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.get("/{subject_id}/", response_model=SubjectRead, dependencies=[Depends(require_any)])
async def get_subject(subject_id: int, db: AsyncSession = Depends(get_db)):
    subject = await db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


@router.put("/{subject_id}/", response_model=SubjectRead, dependencies=[Depends(require_admin)])
async def update_subject(subject_id: int, payload: SubjectUpdate, db: AsyncSession = Depends(get_db)):
    subject = await db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(subject, field, value)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.delete("/{subject_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_subject(subject_id: int, db: AsyncSession = Depends(get_db)):
    subject = await db.get(Subject, subject_id)
    if subject is None:
        raise HTTPException(status_code=404, detail="Subject not found")
    await db.delete(subject)
    await db.commit()
