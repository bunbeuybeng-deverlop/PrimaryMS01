import datetime as dt
import enum

from sqlalchemy import Boolean, Column, Date, Enum, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"


# Many-to-many: a student can be enrolled in multiple classes (e.g. electives),
# in addition to their primary homeroom class_id below.
student_class = Table(
    "student_class",
    Base.metadata,
    Column("student_id", ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
    Column("class_id", ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True),
)


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[Gender | None] = mapped_column(Enum(Gender, name="gender"), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    photo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    class_id: Mapped[int | None] = mapped_column(ForeignKey("classes.id", ondelete="SET NULL"), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("parents.id", ondelete="SET NULL"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    homeroom_class = relationship("Class", foreign_keys=[class_id], lazy="joined")
    parent = relationship("Parent", back_populates="students", lazy="joined")
    classes = relationship("Class", secondary=student_class, lazy="selectin")
