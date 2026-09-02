from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, require_admin, require_any
from app.models.class_ import Class
from app.schemas.class_ import ClassCreate, ClassRead, ClassUpdate

router = APIRouter(prefix="/api/classes", tags=["classes"])

_LOAD = [selectinload(Class.teacher)]


@router.get("/", response_model=list[ClassRead], dependencies=[Depends(require_any)])
async def list_classes(
    db: AsyncSession = Depends(get_db),
    academic_year: str | None = Query(default=None),
    teacher_id: int | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Class).options(*_LOAD)
    if academic_year:
        stmt = stmt.where(Class.academic_year == academic_year)
    if teacher_id is not None:
        stmt = stmt.where(Class.teacher_id == teacher_id)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=ClassRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_class(payload: ClassCreate, db: AsyncSession = Depends(get_db)):
    class_obj = Class(**payload.model_dump())
    db.add(class_obj)
    await db.commit()
    stmt = select(Class).where(Class.id == class_obj.id).options(*_LOAD)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{class_id}/", response_model=ClassRead, dependencies=[Depends(require_any)])
async def get_class(class_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Class).where(Class.id == class_id).options(*_LOAD)
    result = await db.execute(stmt)
    class_obj = result.scalar_one_or_none()
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")
    return class_obj


@router.put("/{class_id}/", response_model=ClassRead, dependencies=[Depends(require_admin)])
async def update_class(class_id: int, payload: ClassUpdate, db: AsyncSession = Depends(get_db)):
    class_obj = await db.get(Class, class_id)
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(class_obj, field, value)
    await db.commit()
    stmt = select(Class).where(Class.id == class_obj.id).options(*_LOAD)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{class_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_class(class_id: int, db: AsyncSession = Depends(get_db)):
    class_obj = await db.get(Class, class_id)
    if class_obj is None:
        raise HTTPException(status_code=404, detail="Class not found")
    await db.delete(class_obj)
    await db.commit()
