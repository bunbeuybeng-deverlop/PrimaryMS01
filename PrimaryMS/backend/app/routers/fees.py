from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db, require_admin, require_any
from app.models.fee import Fee, FeeStatus
from app.models.student import Student
from app.schemas.fee import FeeCreate, FeeRead, FeeUpdate

router = APIRouter(prefix="/api/fees", tags=["fees"])

_LOAD = [selectinload(Fee.student)]


@router.get("/", response_model=list[FeeRead], dependencies=[Depends(require_any)])
async def list_fees(
    db: AsyncSession = Depends(get_db),
    student_id: int | None = Query(default=None),
    status_filter: FeeStatus | None = Query(default=None, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Fee).options(*_LOAD)
    if student_id is not None:
        stmt = stmt.where(Fee.student_id == student_id)
    if status_filter is not None:
        stmt = stmt.where(Fee.status == status_filter)
    stmt = stmt.order_by(Fee.due_date.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=FeeRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
async def create_fee(payload: FeeCreate, db: AsyncSession = Depends(get_db)):
    fee = Fee(**payload.model_dump())
    db.add(fee)
    await db.commit()
    stmt = select(Fee).where(Fee.id == fee.id).options(*_LOAD)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.get("/{fee_id}/", response_model=FeeRead, dependencies=[Depends(require_any)])
async def get_fee(fee_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Fee).where(Fee.id == fee_id).options(*_LOAD)
    result = await db.execute(stmt)
    fee = result.scalar_one_or_none()
    if fee is None:
        raise HTTPException(status_code=404, detail="Fee not found")
    return fee


@router.put("/{fee_id}/", response_model=FeeRead, dependencies=[Depends(require_admin)])
async def update_fee(fee_id: int, payload: FeeUpdate, db: AsyncSession = Depends(get_db)):
    fee = await db.get(Fee, fee_id)
    if fee is None:
        raise HTTPException(status_code=404, detail="Fee not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(fee, field, value)
    await db.commit()
    stmt = select(Fee).where(Fee.id == fee.id).options(*_LOAD)
    result = await db.execute(stmt)
    return result.scalar_one()


@router.delete("/{fee_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_fee(fee_id: int, db: AsyncSession = Depends(get_db)):
    fee = await db.get(Fee, fee_id)
    if fee is None:
        raise HTTPException(status_code=404, detail="Fee not found")
    await db.delete(fee)
    await db.commit()
