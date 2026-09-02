from pydantic import BaseModel


class SummaryReport(BaseModel):
    total_students: int
    total_teachers: int
    total_parents: int
    total_classes: int
    total_subjects: int
    attendance_today_present: int
    attendance_today_absent: int
    fees_unpaid_total: float
    fees_overdue_count: int


class AttendanceStatItem(BaseModel):
    status: str
    count: int


class AttendanceReport(BaseModel):
    student_id: int | None = None
    class_id: int | None = None
    date_from: str | None = None
    date_to: str | None = None
    breakdown: list[AttendanceStatItem]
    total_records: int


class ScoreStatItem(BaseModel):
    subject_id: int
    subject_name: str
    average_score: float
    max_possible: float
    count: int


class ScoreReport(BaseModel):
    student_id: int | None = None
    class_id: int | None = None
    subjects: list[ScoreStatItem]
    overall_average: float
