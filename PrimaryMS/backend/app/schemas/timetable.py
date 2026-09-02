import datetime as dt

from pydantic import BaseModel, ConfigDict

from app.models.timetable import DayOfWeek


class TimetableBase(BaseModel):
    class_id: int
    subject_id: int
    teacher_id: int | None = None
    day_of_week: DayOfWeek
    start_time: dt.time
    end_time: dt.time
    room: str | None = None


class TimetableCreate(TimetableBase):
    pass


class TimetableUpdate(BaseModel):
    class_id: int | None = None
    subject_id: int | None = None
    teacher_id: int | None = None
    day_of_week: DayOfWeek | None = None
    start_time: dt.time | None = None
    end_time: dt.time | None = None
    room: str | None = None


class TimetableRead(TimetableBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
