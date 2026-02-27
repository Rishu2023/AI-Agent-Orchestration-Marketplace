from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    sender_agent_id: UUID
    receiver_agent_id: UUID
    message_type: str = Field(default="request", pattern="^(request|response|notification)$")
    content: Dict[str, Any]
    correlation_id: Optional[str] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sender_agent_id: UUID
    receiver_agent_id: UUID
    message_type: str
    content: Dict[str, Any]
    correlation_id: Optional[str] = None
    status: str
    created_at: datetime
    processed_at: Optional[datetime] = None


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total: int


class ProtocolVersionResponse(BaseModel):
    protocol: str = "AACP"
    version: str = "1.0"


class ProtocolSpecResponse(BaseModel):
    protocol: str = "AACP"
    version: str = "1.0"
    description: str = "Agent-to-Agent Communication Protocol"
    message_types: List[str] = ["request", "response", "notification"]
    statuses: List[str] = ["pending", "delivered", "processed", "failed"]
    endpoints: Dict[str, str] = {
        "send_message": "POST /api/v1/protocol/messages",
        "get_messages": "GET /api/v1/protocol/messages/{agent_id}",
        "protocol_version": "GET /api/v1/protocol/version",
        "protocol_spec": "GET /api/v1/protocol/spec",
    }
