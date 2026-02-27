import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.aacp import AgentMessage
from app.schemas.aacp import MessageCreate


def send_message(
    db: Session,
    sender_id: uuid.UUID,
    receiver_id: uuid.UUID,
    content: dict,
    message_type: str = "request",
    correlation_id: Optional[str] = None,
) -> AgentMessage:
    message = AgentMessage(
        sender_agent_id=sender_id,
        receiver_agent_id=receiver_id,
        message_type=message_type,
        content=content,
        correlation_id=correlation_id or str(uuid.uuid4()),
        status="pending",
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_messages(db: Session, agent_id: uuid.UUID) -> List[AgentMessage]:
    return (
        db.query(AgentMessage)
        .filter(AgentMessage.receiver_agent_id == agent_id)
        .order_by(AgentMessage.created_at.desc())
        .all()
    )


def process_message(db: Session, message_id: uuid.UUID) -> Optional[AgentMessage]:
    message = db.query(AgentMessage).filter(AgentMessage.id == message_id).first()
    if not message:
        return None
    message.status = "processed"
    message.processed_at = datetime.utcnow()
    db.commit()
    db.refresh(message)
    return message


def call_agent_as_tool(
    db: Session,
    caller_agent_id: uuid.UUID,
    target_agent_id: uuid.UUID,
    input_data: dict,
) -> AgentMessage:
    content = {
        "action": "tool_call",
        "input": input_data,
        "caller": str(caller_agent_id),
    }
    request_msg = send_message(
        db=db,
        sender_id=caller_agent_id,
        receiver_id=target_agent_id,
        content=content,
        message_type="request",
    )
    return request_msg
