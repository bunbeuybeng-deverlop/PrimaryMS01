import datetime as dt

from pydantic import BaseModel, ConfigDict

from app.models.score import ExamType


class ScoreBase(BaseModel):
    student_id: int
    subject_id: int
    exam_type: ExamType
    score: float
    max_score: float = 100.0
    date: dt.date


class ScoreCreate(ScoreBase):
    pass


class ScoreUpdate(BaseModel):
    student_id: int | None = None
    subject_id: int | None = None
    exam_type: ExamType | None = None
    score: float | None = None
    max_score: float | None = None
    date: dt.date | None = None


class ScoreRead(ScoreBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
