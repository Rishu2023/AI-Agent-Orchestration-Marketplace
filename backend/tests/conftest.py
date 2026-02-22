import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database.session import Base, get_db
from app.main import app


# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def sample_agent_data():
    return {
        "name": "Test Research Agent",
        "description": "A test agent for research purposes that helps analyze data and papers.",
        "category": "research",
        "system_prompt": "You are a helpful research assistant.",
        "model_provider": "openai",
        "model_name": "gpt-4",
        "pricing_model": "free",
        "price": 0.0,
        "tags": ["test", "research"],
    }


@pytest.fixture
def sample_workflow_data():
    return {
        "name": "Test Workflow",
        "description": "A test workflow for running agents in sequence.",
        "steps": [
            {
                "name": "Step 1",
                "step_type": "agent",
                "position": 0,
                "config": {},
                "input_mapping": {},
                "output_mapping": {},
                "position_x": 0.0,
                "position_y": 0.0,
            },
            {
                "name": "Step 2",
                "step_type": "human_review",
                "position": 1,
                "config": {},
                "input_mapping": {},
                "output_mapping": {},
                "position_x": 200.0,
                "position_y": 0.0,
            },
        ],
        "variables": {"input_topic": "AI research"},
        "is_template": False,
        "is_public": False,
    }
