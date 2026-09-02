from pydantic import BaseModel, ConfigDict


class StudentNested(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str


class ParentBase(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    user_id: int | None = None


class ParentCreate(ParentBase):
    pass


class ParentUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    user_id: int | None = None


class ParentRead(ParentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    students: list[StudentNested] = []
