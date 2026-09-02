import datetime as dt

from pydantic import BaseModel, ConfigDict

from app.models.student import Gender


class ClassNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    grade_level: str | None = None


class ParentNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    phone: str | None = None
    email: str | None = None


class StudentBase(BaseModel):
    name: str
    date_of_birth: dt.date | None = None
    gender: Gender | None = None
    address: str | None = None
    phone: str | None = None
    photo: str | None = None
    class_id: int | None = None
    parent_id: int | None = None
    is_active: bool = True


class StudentCreate(StudentBase):
    class_ids: list[int] = []


class StudentUpdate(BaseModel):
    name: str | None = None
    date_of_birth: dt.date | None = None
    gender: Gender | None = None
    address: str | None = None
    phone: str | None = None
    photo: str | None = None
    class_id: int | None = None
    parent_id: int | None = None
    is_active: bool | None = None
    class_ids: list[int] | None = None


class StudentRead(StudentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    homeroom_class: ClassNested | None = None
    parent: ParentNested | None = None

