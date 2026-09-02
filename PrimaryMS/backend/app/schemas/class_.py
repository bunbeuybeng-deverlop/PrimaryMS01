from pydantic import BaseModel, ConfigDict


class TeacherNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    specialization: str | None = None


class ClassBase(BaseModel):
    name: str
    grade_level: str | None = None
    teacher_id: int | None = None
    academic_year: str | None = None


class ClassCreate(ClassBase):
    pass


class ClassUpdate(BaseModel):
    name: str | None = None
    grade_level: str | None = None
    teacher_id: int | None = None
    academic_year: str | None = None


class ClassRead(ClassBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    teacher: TeacherNested | None = None

