import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Uuid, JSON
from app.database.session import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    admin_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(100), nullable=False)
    details = Column(JSON, default=dict)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PlatformAnnouncement(Base):
    __tablename__ = "platform_announcements"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)
    announcement_type = Column(String(50), default="info")
    is_active = Column(Boolean, default=True)
    created_by = Column(Uuid, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class EmergencyKillSwitch(Base):
    __tablename__ = "emergency_kill_switches"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    target_type = Column(String(50), nullable=False)
    target_id = Column(Uuid, nullable=True)
    reason = Column(Text, nullable=False)
    activated_by = Column(Uuid, ForeignKey("users.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deactivated_at = Column(DateTime, nullable=True)
