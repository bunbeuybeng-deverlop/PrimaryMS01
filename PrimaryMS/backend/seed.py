"""
Populate the PrimaryMS database with demo data.

Usage:
    python seed.py

Requires the schema to already exist (run `alembic upgrade head` first).
Safe to re-run: it checks for an existing admin user and exits early if
the database already looks seeded.
"""
import asyncio
import datetime as dt
import random

from sqlalchemy import insert, select

from app.core.config import settings
from app.core.security import hash_password
from app.database import AsyncSessionLocal, engine, Base
from app.models.attendance import Attendance, AttendanceStatus
from app.models.class_ import Class
from app.models.fee import Fee, FeeStatus
from app.models.parent import Parent
from app.models.score import ExamType, Score
from app.models.student import Gender, Student, student_class
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.models.timetable import DayOfWeek, Timetable
from app.models.user import User, UserRole

FIRST_NAMES = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Jamie",
    "Avery", "Quinn", "Drew", "Skyler", "Reese", "Emerson", "Rowan", "Finley",
    "Cameron", "Peyton", "Dakota", "Hayden",
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Lee", "Walker", "Hall", "Young",
    "Allen", "King", "Wright", "Scott", "Torres", "Nguyen",
]


def rand_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


async def seed() -> None:
    # Ensure tables exist even if Alembic hasn't been run yet (idempotent no-op if they do).
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        existing_admin = (
            await db.execute(select(User).where(User.username == settings.SEED_ADMIN_USERNAME))
        ).scalar_one_or_none()
        if existing_admin is not None:
            print(f"Database already seeded (admin user '{settings.SEED_ADMIN_USERNAME}' exists). Skipping.")
            return

        print("Seeding database...")

        # --- Admin user ---
        admin_user = User(
            username=settings.SEED_ADMIN_USERNAME,
            email=settings.SEED_ADMIN_EMAIL,
            hashed_password=hash_password(settings.SEED_ADMIN_PASSWORD),
            role=UserRole.admin,
            is_active=True,
        )
        db.add(admin_user)
        await db.flush()

        # --- Subjects (created before teachers reference them isn't required, but
        # teachers are needed before subjects/classes reference teacher_id) ---
        subject_names = [
            ("Mathematics", "MATH"),
            ("English Language Arts", "ELA"),
            ("Science", "SCI"),
            ("Social Studies", "SOC"),
            ("Art", "ART"),
            ("Physical Education", "PE"),
        ]

        # --- Teachers (5), each with a linked user account ---
        # Shortcut demo account: teacher / teacher123
        t_demo_user = User(
            username="teacher",
            email="teacher@primaryms.dev",
            hashed_password=hash_password("teacher123"),
            role=UserRole.teacher,
            is_active=True,
        )
        db.add(t_demo_user)
        await db.flush()
        demo_teacher = Teacher(
            user_id=t_demo_user.id,
            name="Demo Teacher",
            phone="555-0100",
            email="teacher@primaryms.dev",
            specialization="General",
            is_active=True,
        )
        db.add(demo_teacher)
        teachers: list[Teacher] = [demo_teacher]

        for i in range(1, 6):
            name = rand_name()
            username = f"teacher{i}"
            t_user = User(
                username=username,
                email=f"{username}@primaryms.dev",
                hashed_password=hash_password("teacher123"),
                role=UserRole.teacher,
                is_active=True,
            )
            db.add(t_user)
            await db.flush()

            teacher = Teacher(
                user_id=t_user.id,
                name=name,
                phone=f"555-01{i:02d}",
                email=f"{username}@primaryms.dev",
                specialization=random.choice(["Mathematics", "Literacy", "Science", "General", "Arts"]),
                is_active=True,
            )
            db.add(teacher)
            teachers.append(teacher)
        await db.flush()

        # --- Subjects, each assigned a teacher ---
        subjects: list[Subject] = []
        for idx, (name, code) in enumerate(subject_names):
            subject = Subject(
                name=name,
                code=code,
                description=f"{name} curriculum for primary grades.",
                teacher_id=teachers[idx % len(teachers)].id,
            )
            db.add(subject)
            subjects.append(subject)
        await db.flush()

        # --- Classes (4 homerooms), each with a homeroom teacher ---
        classes: list[Class] = []
        class_defs = [
            ("Grade 1A", "Grade 1"),
            ("Grade 2A", "Grade 2"),
            ("Grade 3A", "Grade 3"),
            ("Grade 3B", "Grade 3"),
        ]
        for idx, (name, grade_level) in enumerate(class_defs):
            class_obj = Class(
                name=name,
                grade_level=grade_level,
                teacher_id=teachers[idx % len(teachers)].id,
                academic_year="2026-2027",
            )
            db.add(class_obj)
            classes.append(class_obj)
        await db.flush()

        # --- Parents (10), each with a linked user account ---
        # Shortcut demo account: parent / parent123
        p_demo_user = User(
            username="parent",
            email="parent@primaryms.dev",
            hashed_password=hash_password("parent123"),
            role=UserRole.parent,
            is_active=True,
        )
        db.add(p_demo_user)
        await db.flush()
        demo_parent = Parent(
            user_id=p_demo_user.id,
            name="Demo Parent",
            phone="555-0200",
            email="parent@primaryms.dev",
            address="1 Demo Street",
        )
        db.add(demo_parent)
        parents: list[Parent] = [demo_parent]

        for i in range(1, 11):
            name = rand_name()
            username = f"parent{i}"
            p_user = User(
                username=username,
                email=f"{username}@primaryms.dev",
                hashed_password=hash_password("parent123"),
                role=UserRole.parent,
                is_active=True,
            )
            db.add(p_user)
            await db.flush()

            parent = Parent(
                user_id=p_user.id,
                name=name,
                phone=f"555-02{i:02d}",
                email=f"{username}@primaryms.dev",
                address=f"{100 + i} Maple Street",
            )
            db.add(parent)
            parents.append(parent)
        await db.flush()

        # --- Students (30), spread across classes and parents ---
        students: list[Student] = []
        for i in range(1, 31):
            home_class = classes[i % len(classes)]
            parent = parents[i % len(parents)]
            student = Student(
                name=rand_name(),
                date_of_birth=dt.date(2018, 1, 1) + dt.timedelta(days=random.randint(0, 1500)),
                gender=random.choice(list(Gender)),
                address=f"{200 + i} Oak Avenue",
                phone=None,
                photo=None,
                class_id=home_class.id,
                parent_id=parent.id,
                is_active=True,
            )
            db.add(student)
            students.append(student)
        await db.flush()

        # Enroll each student in their homeroom class via the M2M table too.
        # Inserted directly against the association table (rather than through
        # the ORM `student.classes` relationship) since assigning a lazy-loaded
        # collection outside an awaited load isn't safe under the async session.
        if students:
            await db.execute(
                insert(student_class),
                [{"student_id": s.id, "class_id": s.class_id} for s in students],
            )

        # --- Attendance: last 10 school days for every student ---
        today = dt.date.today()
        day_offset = 0
        days_recorded = 0
        while days_recorded < 10:
            day = today - dt.timedelta(days=day_offset)
            day_offset += 1
            if day.weekday() >= 5:  # skip weekends
                continue
            days_recorded += 1
            for student in students:
                status = random.choices(
                    list(AttendanceStatus),
                    weights=[85, 6, 6, 3],  # mostly present
                )[0]
                db.add(
                    Attendance(
                        student_id=student.id,
                        class_id=student.class_id,
                        date=day,
                        status=status,
                        note=None if status == AttendanceStatus.present else "Auto-generated demo record",
                    )
                )

        # --- Scores: each student gets a score per subject per exam type ---
        for student in students:
            for subject in subjects:
                for exam_type in [ExamType.quiz, ExamType.midterm]:
                    db.add(
                        Score(
                            student_id=student.id,
                            subject_id=subject.id,
                            exam_type=exam_type,
                            score=round(random.uniform(60, 100), 1),
                            max_score=100.0,
                            date=today - dt.timedelta(days=random.randint(1, 60)),
                        )
                    )

        # --- Fees: two fee records per student ---
        for student in students:
            due = today + dt.timedelta(days=15)
            db.add(
                Fee(
                    student_id=student.id,
                    amount=250.00,
                    description="Term tuition fee",
                    due_date=due,
                    paid_date=None,
                    status=FeeStatus.unpaid,
                )
            )
            past_due = today - dt.timedelta(days=20)
            paid = random.random() < 0.7
            db.add(
                Fee(
                    student_id=student.id,
                    amount=50.00,
                    description="Activity fee",
                    due_date=past_due,
                    paid_date=past_due - dt.timedelta(days=2) if paid else None,
                    status=FeeStatus.paid if paid else FeeStatus.overdue,
                )
            )

        # --- Timetable: a simple weekly schedule per class ---
        time_slots = [
            (dt.time(8, 0), dt.time(8, 45)),
            (dt.time(9, 0), dt.time(9, 45)),
            (dt.time(10, 0), dt.time(10, 45)),
            (dt.time(11, 0), dt.time(11, 45)),
        ]
        weekdays = [
            DayOfWeek.monday,
            DayOfWeek.tuesday,
            DayOfWeek.wednesday,
            DayOfWeek.thursday,
            DayOfWeek.friday,
        ]
        for class_obj in classes:
            for day in weekdays:
                for slot_idx, (start, end) in enumerate(time_slots):
                    subject = subjects[(slot_idx + weekdays.index(day)) % len(subjects)]
                    db.add(
                        Timetable(
                            class_id=class_obj.id,
                            subject_id=subject.id,
                            teacher_id=subject.teacher_id,
                            day_of_week=day,
                            start_time=start,
                            end_time=end,
                            room=f"Room {100 + class_obj.id}",
                        )
                    )

        await db.commit()

        print("Seed complete:")
        print(f"  - 1 admin       login: {settings.SEED_ADMIN_USERNAME} / {settings.SEED_ADMIN_PASSWORD}")
        print(f"  - {len(teachers)} teachers   login: teacher1..teacher{len(teachers)} / teacher123")
        print(f"  - {len(parents)} parents    login: parent1..parent{len(parents)} / parent123")
        print(f"  - {len(students)} students")
        print(f"  - {len(classes)} classes, {len(subjects)} subjects")
        print("  - attendance, scores, fees, and timetable records generated")


if __name__ == "__main__":
    asyncio.run(seed())
