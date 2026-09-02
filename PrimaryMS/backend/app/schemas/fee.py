import datetime as dt

from pydantic import BaseModel, ConfigDict

from app.models.fee import FeeStatus


class StudentNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class FeeBase(BaseModel):
    student_id: int
    amount: float
    description: str | None = None
    due_date: dt.date
    paid_date: dt.date | None = None
    status: FeeStatus = FeeStatus.unpaid


class FeeCreate(FeeBase):
    pass


class FeeUpdate(BaseModel):
    student_id: int | None = None
    amount: float | None = None
    description: str | None = None
    due_date: dt.date | None = None
    paid_date: dt.date | None = None
    status: FeeStatus | None = None


class FeeRead(FeeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    student: StudentNested | None = None

