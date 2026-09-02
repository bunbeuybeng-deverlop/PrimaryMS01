import datetime as dt

from pydantic import BaseModel, ConfigDict

from app.models.attendance import AttendanceStatus


class StudentNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class ClassNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class AttendanceBase(BaseModel):
    student_id: int
    class_id: int | None = None
    date: dt.date
    status: AttendanceStatus
    note: str | None = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    student_id: int | None = None
    class_id: int | None = None
    date: dt.date | None = None
    status: AttendanceStatus | None = None
    note: str | None = None


class AttendanceRead(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    student: StudentNested | None = None
    class_: ClassNested | None = None

