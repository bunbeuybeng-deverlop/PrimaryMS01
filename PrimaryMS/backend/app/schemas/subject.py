from pydantic import BaseModel, ConfigDict


class SubjectBase(BaseModel):
    name: str
    code: str | None = None
    description: str | None = None
    teacher_id: int | None = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    description: str | None = None
    teacher_id: int | None = None


class SubjectRead(SubjectBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
