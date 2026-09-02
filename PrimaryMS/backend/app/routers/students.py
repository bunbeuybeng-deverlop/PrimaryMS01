from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, require_admin_or_teacher, require_any
from app.models.class_ import Class
from app.models.student import Student
from app.schemas.student import StudentCreate, StudentRead, StudentUpdate

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("/", response_model=list[StudentRead], dependencies=[Depends(require_any)])
async def list_students(
    db: AsyncSession = Depends(get_db),
    class_id: int | None = Query(default=None),
    parent_id: int | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    q: str | None = Query(default=None, description="Search by name"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Student).options(
        selectinload(Student.homeroom_class),
        selectinload(Student.parent),
    )
    if class_id is not None:
        stmt = stmt.where(Student.class_id == class_id)
    if parent_id is not None:
        stmt = stmt.where(Student.parent_id == parent_id)
    if is_active is not None:
        stmt = stmt.where(Student.is_active == is_active)
    if q:
        stmt = stmt.where(Student.name.ilike(f"%{q}%"))
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=StudentRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_or_teacher)])
async def create_student(payload: StudentCreate, db: AsyncSession = Depends(get_db)):
    data = payload.model_dump(exclude={"class_ids"})
    student = Student(**data)

    if payload.class_ids:
        result = await db.execute(select(Class).where(Class.id.in_(payload.class_ids)))
        student.classes = result.scalars().all()

    db.add(student)
    await db.commit()

    # Reload with relationships
    stmt = select(Student).where(Student.id == student.id).options(
        selectinload(Student.homeroom_class),
        selectinload(Student.parent),
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{student_id}/", response_model=StudentRead, dependencies=[Depends(require_any)])
async def get_student(student_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Student).where(Student.id == student_id).options(
        selectinload(Student.homeroom_class),
        selectinload(Student.parent),
    )
    result = await db.execute(stmt)
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}/", response_model=StudentRead, dependencies=[Depends(require_admin_or_teacher)])
async def update_student(student_id: int, payload: StudentUpdate, db: AsyncSession = Depends(get_db)):
    student = await db.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = payload.model_dump(exclude_unset=True, exclude={"class_ids"})
    for field, value in update_data.items():
        setattr(student, field, value)

    if payload.class_ids is not None:
        result = await db.execute(select(Class).where(Class.id.in_(payload.class_ids)))
        student.classes = result.scalars().all()

    await db.commit()

    # Reload with relationships
    stmt = select(Student).where(Student.id == student.id).options(
        selectinload(Student.homeroom_class),
        selectinload(Student.parent),
    )
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{student_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_or_teacher)])
async def delete_student(student_id: int, db: AsyncSession = Depends(get_db)):
    student = await db.get(Student, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    await db.delete(student)
    await db.commit()
