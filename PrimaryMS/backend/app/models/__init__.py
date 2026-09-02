from app.models.user import User
from app.models.parent import Parent
from app.models.teacher import Teacher
from app.models.class_ import Class
from app.models.student import Student, student_class
from app.models.subject import Subject
from app.models.attendance import Attendance
from app.models.score import Score
from app.models.fee import Fee
from app.models.timetable import Timetable

__all__ = [
    "User",
    "Parent",
    "Teacher",
    "Class",
    "Student",
    "student_class",
    "Subject",
    "Attendance",
    "Score",
    "Fee",
    "Timetable",
]
