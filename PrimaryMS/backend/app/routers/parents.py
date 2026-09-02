from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, require_admin, require_any
from app.models.parent import Parent
from app.schemas.parent import ParentCreate, ParentRead, ParentUpdate

router = APIRouter(prefix="/api/parents", tags=["parents"])

_LOAD = [selectinload(Parent.students)]


@router.get("/", response_model=list[ParentRead], dependencies=[Depends(require_any)])
async def list_parents(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Parent).options(*_LOAD)
    if q:
        stmt = stmt.where(Parent.name.ilike(f"%{q}%"))
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=ParentRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_parent(payload: ParentCreate, db: AsyncSession = Depends(get_db)):
    parent = Parent(**payload.model_dump())
    db.add(parent)
    await db.commit()
    stmt = select(Parent).where(Parent.id == parent.id).options(*_LOAD)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{parent_id}/", response_model=ParentRead, dependencies=[Depends(require_any)])
async def get_parent(parent_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Parent).where(Parent.id == parent_id).options(*_LOAD)
    result = await db.execute(stmt)
    parent = result.scalar_one_or_none()
    if parent is None:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent


@router.put("/{parent_id}/", response_model=ParentRead, dependencies=[Depends(require_admin)])
async def update_parent(parent_id: int, payload: ParentUpdate, db: AsyncSession = Depends(get_db)):
    parent = await db.get(Parent, parent_id)
    if parent is None:
        raise HTTPException(status_code=404, detail="Parent not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(parent, field, value)
    await db.commit()
    stmt = select(Parent).where(Parent.id == parent.id).options(*_LOAD)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{parent_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_parent(parent_id: int, db: AsyncSession = Depends(get_db)):
    parent = await db.get(Parent, parent_id)
    if parent is None:
        raise HTTPException(status_code=404, detail="Parent not found")
    await db.delete(parent)
    await db.commit()
