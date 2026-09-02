from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, require_admin_or_teacher, require_any
from app.models.score import ExamType, Score
from app.schemas.score import ScoreCreate, ScoreRead, ScoreUpdate

router = APIRouter(prefix="/api/scores", tags=["scores"])


@router.get("/", response_model=list[ScoreRead], dependencies=[Depends(require_any)])
async def list_scores(
    db: AsyncSession = Depends(get_db),
    student_id: int | None = Query(default=None),
    subject_id: int | None = Query(default=None),
    exam_type: ExamType | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
):
    stmt = select(Score)
    if student_id is not None:
        stmt = stmt.where(Score.student_id == student_id)
    if subject_id is not None:
        stmt = stmt.where(Score.subject_id == subject_id)
    if exam_type is not None:
        stmt = stmt.where(Score.exam_type == exam_type)
    stmt = stmt.order_by(Score.date.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().unique().all()


@router.post("/", response_model=ScoreRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin_or_teacher)])
async def create_score(payload: ScoreCreate, db: AsyncSession = Depends(get_db)):
    score = Score(**payload.model_dump())
    db.add(score)
    await db.commit()
    await db.refresh(score)
    return score


@router.get("/{score_id}/", response_model=ScoreRead, dependencies=[Depends(require_any)])
async def get_score(score_id: int, db: AsyncSession = Depends(get_db)):
    score = await db.get(Score, score_id)
    if score is None:
        raise HTTPException(status_code=404, detail="Score not found")
    return score


@router.put("/{score_id}/", response_model=ScoreRead, dependencies=[Depends(require_admin_or_teacher)])
async def update_score(score_id: int, payload: ScoreUpdate, db: AsyncSession = Depends(get_db)):
    score = await db.get(Score, score_id)
    if score is None:
        raise HTTPException(status_code=404, detail="Score not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(score, field, value)
    await db.commit()
    await db.refresh(score)
    return score


@router.delete("/{score_id}/", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin_or_teacher)])
async def delete_score(score_id: int, db: AsyncSession = Depends(get_db)):
    score = await db.get(Score, score_id)
    if score is None:
        raise HTTPException(status_code=404, detail="Score not found")
    await db.delete(score)
    await db.commit()
