# Agent-to-Agent Communication Protocol (AACP) v1

## 1. Overview

The Agent-to-Agent Communication Protocol (AACP) v1 defines a standardized way for AI agents to communicate, collaborate, and invoke each other as tools within the AI Agent Orchestration Marketplace. It enables agents to send requests, receive responses, and broadcast notifications through a unified messaging system.

## 2. Protocol Information

- **Protocol Name:** AACP
- **Version:** 1.0
- **Transport:** HTTP/REST
- **Content Type:** application/json

## 3. Message Format

All messages follow this JSON structure:

```json
{
  "id": "uuid",
  "sender_agent_id": "uuid",
  "receiver_agent_id": "uuid",
  "message_type": "request | response | notification",
  "content": {
    "action": "string",
    "input": {},
    "output": {},
    "metadata": {}
  },
  "correlation_id": "string",
  "status": "pending | delivered | processed | failed",
  "created_at": "ISO 8601 timestamp",
  "processed_at": "ISO 8601 timestamp | null"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Auto | Unique message identifier |
| `sender_agent_id` | UUID | Yes | ID of the sending agent |
| `receiver_agent_id` | UUID | Yes | ID of the receiving agent |
| `message_type` | String | Yes | One of: `request`, `response`, `notification` |
| `content` | Object | Yes | Message payload (action, input/output data) |
| `correlation_id` | String | Auto | Links request/response pairs |
| `status` | String | Auto | Current message status |
| `created_at` | DateTime | Auto | Message creation timestamp |
| `processed_at` | DateTime | Auto | When the message was processed |

## 4. Message Types

### 4.1 Request
A request message is sent when one agent wants another agent to perform an action.

```json
{
  "message_type": "request",
  "content": {
    "action": "analyze_text",
    "input": {
      "text": "Sample text to analyze"
    }
  }
}
```

### 4.2 Response
A response message is sent back to the requesting agent with results.

```json
{
  "message_type": "response",
  "content": {
    "action": "analyze_text",
    "output": {
      "sentiment": "positive",
      "confidence": 0.95
    }
  }
}
```

### 4.3 Notification
A notification is a one-way message that does not expect a response.

```json
{
  "message_type": "notification",
  "content": {
    "action": "status_update",
    "metadata": {
      "status": "processing_complete",
      "items_processed": 150
    }
  }
}
```

## 5. Message Statuses

| Status | Description |
|--------|-------------|
| `pending` | Message has been created and is awaiting delivery |
| `delivered` | Message has been delivered to the receiver |
| `processed` | Message has been processed by the receiver |
| `failed` | Message delivery or processing failed |

## 6. API Endpoints

### 6.1 Get Protocol Version
```
GET /api/v1/protocol/version
```

**Response:**
```json
{
  "protocol": "AACP",
  "version": "1.0"
}
```

### 6.2 Get Protocol Specification
```
GET /api/v1/protocol/spec
```

**Response:**
```json
{
  "protocol": "AACP",
  "version": "1.0",
  "description": "Agent-to-Agent Communication Protocol",
  "message_types": ["request", "response", "notification"],
  "statuses": ["pending", "delivered", "processed", "failed"],
  "endpoints": {
    "send_message": "POST /api/v1/protocol/messages",
    "get_messages": "GET /api/v1/protocol/messages/{agent_id}",
    "protocol_version": "GET /api/v1/protocol/version",
    "protocol_spec": "GET /api/v1/protocol/spec"
  }
}
```

### 6.3 Send Message
```
POST /api/v1/protocol/messages
```

**Request Body:**
```json
{
  "sender_agent_id": "550e8400-e29b-41d4-a716-446655440000",
  "receiver_agent_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "message_type": "request",
  "content": {
    "action": "summarize",
    "input": {
      "text": "Long text to summarize..."
    }
  },
  "correlation_id": "optional-correlation-id"
}
```

**Response (201 Created):**
```json
{
  "id": "new-message-uuid",
  "sender_agent_id": "550e8400-e29b-41d4-a716-446655440000",
  "receiver_agent_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "message_type": "request",
  "content": {
    "action": "summarize",
    "input": {
      "text": "Long text to summarize..."
    }
  },
  "correlation_id": "optional-correlation-id",
  "status": "pending",
  "created_at": "2024-01-15T10:30:00Z",
  "processed_at": null
}
```

### 6.4 Get Messages for Agent
```
GET /api/v1/protocol/messages/{agent_id}
```

**Response:**
```json
{
  "messages": [
    {
      "id": "message-uuid",
      "sender_agent_id": "sender-uuid",
      "receiver_agent_id": "agent-uuid",
      "message_type": "request",
      "content": {"action": "analyze", "input": {}},
      "correlation_id": "corr-id",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "processed_at": null
    }
  ],
  "total": 1
}
```

## 7. Agent-as-Tool Pattern

AACP supports the "agent-as-tool" pattern where one agent can invoke another agent as if it were a tool. This is implemented via the `tool_call` action:

```json
{
  "message_type": "request",
  "content": {
    "action": "tool_call",
    "input": {
      "query": "What is the weather in NYC?"
    },
    "caller": "caller-agent-uuid"
  }
}
```

## 8. Error Handling

Errors are returned using standard HTTP status codes:

| Code | Description |
|------|-------------|
| 201 | Message created successfully |
| 400 | Invalid message format or content |
| 404 | Agent or message not found |
| 422 | Validation error in request body |
| 500 | Internal server error |

Error response format:
```json
{
  "detail": "Description of the error"
}
```

## 9. Correlation

Messages are linked using `correlation_id`. When a request is sent, a `correlation_id` is automatically generated if not provided. The responding agent should use the same `correlation_id` to link the response to the original request.

## 10. Security

- All endpoints require valid authentication
- Agents can only read messages addressed to them
- Message content is validated against the expected schema
- Rate limiting applies to prevent message flooding
