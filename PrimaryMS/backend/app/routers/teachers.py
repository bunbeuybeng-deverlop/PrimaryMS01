from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin, require_any
from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherRead, TeacherUpdate

router = APIRouter(prefix="/api/teachers", tags=["teachers"])


@router.get("/", response_model=list[TeacherRead], dependencies=[Depends(require_any)])
async def list_teachers(
    db: AsyncSession = Depends(get_db),
    is_active: bool | None = Query(default=None),
    q: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Teacher)
    if is_active is not None:
        stmt = stmt.where(Teacher.is_active == is_active)
    if q:
        stmt = stmt.where(Teacher.name.ilike(f"%{q}%"))
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=TeacherRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_teacher(payload: TeacherCreate, db: AsyncSession = Depends(get_db)):
    teacher = Teacher(**payload.model_dump())
    db.add(teacher)
    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.get("/{teacher_id}/", response_model=TeacherRead, dependencies=[Depends(require_any)])
async def get_teacher(teacher_id: int, db: AsyncSession = Depends(get_db)):
    teacher = await db.get(Teacher, teacher_id)
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.put("/{teacher_id}/", response_model=TeacherRead, dependencies=[Depends(require_admin)])
async def update_teacher(teacher_id: int, payload: TeacherUpdate, db: AsyncSession = Depends(get_db)):
    teacher = await db.get(Teacher, teacher_id)
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(teacher, field, value)
    await db.commit()
    await db.refresh(teacher)
    return teacher


@router.delete("/{teacher_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_teacher(teacher_id: int, db: AsyncSession = Depends(get_db)):
    teacher = await db.get(Teacher, teacher_id)
    if teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    await db.delete(teacher)
    await db.commit()
