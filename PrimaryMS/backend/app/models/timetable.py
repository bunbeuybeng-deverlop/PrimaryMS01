import datetime as dt
import enum

from sqlalchemy import Enum, ForeignKey, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DayOfWeek(str, enum.Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class Timetable(Base):
    __tablename__ = "timetable"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True, nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    teacher_id: Mapped[int | None] = mapped_column(ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True)
    day_of_week: Mapped[DayOfWeek] = mapped_column(Enum(DayOfWeek, name="day_of_week"), nullable=False)
    start_time: Mapped[dt.time] = mapped_column(Time, nullable=False)
    end_time: Mapped[dt.time] = mapped_column(Time, nullable=False)
    room: Mapped[str | None] = mapped_column(String(50), nullable=True)

    class_ = relationship("Class", lazy="joined")
    subject = relationship("Subject", lazy="joined")
    teacher = relationship("Teacher", lazy="joined")
