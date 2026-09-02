from pydantic import BaseModel, ConfigDict


class TeacherBase(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    specialization: str | None = None
    is_active: bool = True
    user_id: int | None = None


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    specialization: str | None = None
    is_active: bool | None = None
    user_id: int | None = None


class TeacherRead(TeacherBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
