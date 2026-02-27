import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.aacp import (
    MessageCreate,
    MessageResponse,
    MessageListResponse,
    ProtocolVersionResponse,
    ProtocolSpecResponse,
)
from app.services import aacp_service

router = APIRouter(prefix="/protocol", tags=["protocol"])


@router.get("/version", response_model=ProtocolVersionResponse)
def get_protocol_version():
    return ProtocolVersionResponse()


@router.get("/spec", response_model=ProtocolSpecResponse)
def get_protocol_spec():
    return ProtocolSpecResponse()


@router.post("/messages", response_model=MessageResponse, status_code=201)
def send_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db),
):
    message = aacp_service.send_message(
        db=db,
        sender_id=message_data.sender_agent_id,
        receiver_id=message_data.receiver_agent_id,
        content=message_data.content,
        message_type=message_data.message_type,
        correlation_id=message_data.correlation_id,
    )
    return MessageResponse.model_validate(message)


@router.get("/messages/{agent_id}", response_model=MessageListResponse)
def get_messages(agent_id: uuid.UUID, db: Session = Depends(get_db)):
    messages = aacp_service.get_messages(db, agent_id)
    return MessageListResponse(
        messages=[MessageResponse.model_validate(m) for m in messages],
        total=len(messages),
    )
