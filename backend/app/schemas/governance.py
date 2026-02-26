from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ProposalCreate(BaseModel):
    title: str = Field(..., max_length=300)
    description: str
    proposal_type: str = Field(..., pattern="^(rule_change|feature_request|agent_featured|benchmark_criteria)$")
    proposed_by: UUID


class ProposalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str
    proposal_type: str
    proposed_by: UUID
    status: str
    votes_for: int
    votes_against: int
    voting_deadline: datetime
    created_at: datetime
    updated_at: datetime


class ProposalListResponse(BaseModel):
    proposals: List[ProposalResponse]
    total: int
    page: int
    page_size: int


class VoteCreate(BaseModel):
    user_id: UUID
    vote_type: str = Field(..., pattern="^(for|against)$")
    weight: float = Field(default=1.0, ge=0.0)


class VoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    proposal_id: UUID
    user_id: UUID
    vote_type: str
    weight: float
    created_at: datetime


class VotingResultsResponse(BaseModel):
    proposal_id: UUID
    title: str
    status: str
    votes_for: int
    votes_against: int
    total_votes: int
    voting_deadline: datetime
