import datetime as dt
import enum

from sqlalchemy import Date, Enum, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ExamType(str, enum.Enum):
    midterm = "midterm"
    final = "final"
    quiz = "quiz"
    assignment = "assignment"


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), index=True, nullable=False)
    exam_type: Mapped[ExamType] = mapped_column(Enum(ExamType, name="exam_type"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    max_score: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    date: Mapped[dt.date] = mapped_column(Date, nullable=False)

    student = relationship("Student", lazy="joined")
    subject = relationship("Subject", lazy="joined")
