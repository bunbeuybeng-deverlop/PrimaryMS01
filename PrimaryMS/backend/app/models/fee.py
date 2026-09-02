import datetime as dt
import enum

from sqlalchemy import Date, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class FeeStatus(str, enum.Enum):
    unpaid = "unpaid"
    paid = "paid"
    overdue = "overdue"


class Fee(Base):
    __tablename__ = "fees"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id", ondelete="CASCADE"), index=True, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    due_date: Mapped[dt.date] = mapped_column(Date, nullable=False)
    paid_date: Mapped[dt.date | None] = mapped_column(Date, nullable=True)
    status: Mapped[FeeStatus] = mapped_column(Enum(FeeStatus, name="fee_status"), default=FeeStatus.unpaid, nullable=False)

    student = relationship("Student", lazy="joined")
