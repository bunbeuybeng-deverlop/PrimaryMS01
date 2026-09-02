"""initial schema

Revision ID: 24a166e2a27e
Revises:
Create Date: 2026-09-01 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "24a166e2a27e"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- enum types ---
    user_role_enum = postgresql.ENUM("admin", "teacher", "parent", name="user_role")
    gender_enum = postgresql.ENUM("male", "female", "other", name="gender")
    attendance_status_enum = postgresql.ENUM("present", "absent", "late", "excused", name="attendance_status")
    exam_type_enum = postgresql.ENUM("midterm", "final", "quiz", "assignment", name="exam_type")
    fee_status_enum = postgresql.ENUM("unpaid", "paid", "overdue", name="fee_status")
    day_of_week_enum = postgresql.ENUM(
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        name="day_of_week",
    )

    bind = op.get_bind()
    user_role_enum.create(bind, checkfirst=True)
    gender_enum.create(bind, checkfirst=True)
    attendance_status_enum.create(bind, checkfirst=True)
    exam_type_enum.create(bind, checkfirst=True)
    fee_status_enum.create(bind, checkfirst=True)
    day_of_week_enum.create(bind, checkfirst=True)

    # Column enum references with create_type=False so create_table doesn't re-create them
    user_role = postgresql.ENUM("admin", "teacher", "parent", name="user_role", create_type=False)
    gender = postgresql.ENUM("male", "female", "other", name="gender", create_type=False)
    attendance_status = postgresql.ENUM("present", "absent", "late", "excused", name="attendance_status", create_type=False)
    exam_type = postgresql.ENUM("midterm", "final", "quiz", "assignment", name="exam_type", create_type=False)
    fee_status = postgresql.ENUM("unpaid", "paid", "overdue", name="fee_status", create_type=False)
    day_of_week = postgresql.ENUM(
        "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
        name="day_of_week",
        create_type=False,
    )

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"])

    # --- teachers ---
    op.create_table(
        "teachers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("specialization", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_teachers_id", "teachers", ["id"])

    # --- parents ---
    op.create_table(
        "parents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(32), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("address", sa.String(500), nullable=True),
    )
    op.create_index("ix_parents_id", "parents", ["id"])

    # --- classes ---
    op.create_table(
        "classes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("grade_level", sa.String(50), nullable=True),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("academic_year", sa.String(20), nullable=True),
    )
    op.create_index("ix_classes_id", "classes", ["id"])

    # --- subjects ---
    op.create_table(
        "subjects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(32), nullable=True),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_subjects_id", "subjects", ["id"])
    op.create_index("ix_subjects_code", "subjects", ["code"], unique=True)

    # --- students ---
    op.create_table(
        "students",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("gender", gender, nullable=True),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("phone", sa.String(32), nullable=True),
        sa.Column("photo", sa.String(500), nullable=True),
        sa.Column("class_id", sa.Integer(), sa.ForeignKey("classes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("parent_id", sa.Integer(), sa.ForeignKey("parents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_students_id", "students", ["id"])

    # --- student_class (M2M) ---
    op.create_table(
        "student_class",
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("class_id", sa.Integer(), sa.ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True),
    )

    # --- attendance ---
    op.create_table(
        "attendance",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False),
        sa.Column("class_id", sa.Integer(), sa.ForeignKey("classes.id", ondelete="SET NULL"), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("status", attendance_status, nullable=False),
        sa.Column("note", sa.String(500), nullable=True),
    )
    op.create_index("ix_attendance_id", "attendance", ["id"])
    op.create_index("ix_attendance_date", "attendance", ["date"])
    op.create_index("ix_attendance_student_id", "attendance", ["student_id"])

    # --- scores ---
    op.create_table(
        "scores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False),
        sa.Column("subject_id", sa.Integer(), sa.ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("exam_type", exam_type, nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("max_score", sa.Float(), nullable=False, server_default="100"),
        sa.Column("date", sa.Date(), nullable=False),
    )
    op.create_index("ix_scores_id", "scores", ["id"])
    op.create_index("ix_scores_student_id", "scores", ["student_id"])
    op.create_index("ix_scores_subject_id", "scores", ["subject_id"])

    # --- fees ---
    op.create_table(
        "fees",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("paid_date", sa.Date(), nullable=True),
        sa.Column("status", fee_status, nullable=False, server_default="unpaid"),
    )
    op.create_index("ix_fees_id", "fees", ["id"])
    op.create_index("ix_fees_student_id", "fees", ["student_id"])

    # --- timetable ---
    op.create_table(
        "timetable",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("class_id", sa.Integer(), sa.ForeignKey("classes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("subject_id", sa.Integer(), sa.ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("day_of_week", day_of_week, nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("room", sa.String(50), nullable=True),
    )
    op.create_index("ix_timetable_id", "timetable", ["id"])
    op.create_index("ix_timetable_class_id", "timetable", ["class_id"])


def downgrade() -> None:
    op.drop_table("timetable")
    op.drop_table("fees")
    op.drop_table("scores")
    op.drop_table("attendance")
    op.drop_table("student_class")
    op.drop_table("students")
    op.drop_table("subjects")
    op.drop_table("classes")
    op.drop_table("parents")
    op.drop_table("teachers")
    op.drop_table("users")

    bind = op.get_bind()
    postgresql.ENUM(name="day_of_week").drop(bind, checkfirst=True)
    postgresql.ENUM(name="fee_status").drop(bind, checkfirst=True)
    postgresql.ENUM(name="exam_type").drop(bind, checkfirst=True)
    postgresql.ENUM(name="attendance_status").drop(bind, checkfirst=True)
    postgresql.ENUM(name="gender").drop(bind, checkfirst=True)
    postgresql.ENUM(name="user_role").drop(bind, checkfirst=True)
