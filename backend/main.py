import json
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import init_db, AsyncSessionLocal
from routers.agents import router as agents_router
from routers.workflows import router as workflows_router
from routers.executions import router as executions_router
from routers.marketplace import router as marketplace_router
from routers.users import router as users_router

app = FastAPI(
    title=settings.app_name,
    description="A marketplace for AI agents and workflows",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents_router)
app.include_router(workflows_router)
app.include_router(executions_router)
app.include_router(marketplace_router)
app.include_router(users_router)

# Also expose execute on the agent route for convenience
from routers.executions import run_agent
from fastapi import Depends
from database import get_db
from auth import get_current_user
from schemas.execution import ExecutionCreate, ExecutionResponse

app.add_api_route(
    "/api/v1/agents/{agent_id}/execute",
    run_agent,
    methods=["POST"],
    response_model=ExecutionResponse,
    tags=["agents"],
)


async def seed_data():
    """Seed database with sample agents."""
    from models.user import User
    from models.agent import Agent
    from auth import hash_password
    from sqlalchemy import select

    async with AsyncSessionLocal() as db:
        # Check if data already seeded
        result = await db.execute(select(User).where(User.email == "demo@example.com"))
        if result.scalar_one_or_none():
            return

        # Create demo user
        demo_user = User(
            email="demo@example.com",
            name="Demo User",
            hashed_password=hash_password("demo1234"),
        )
        db.add(demo_user)
        await db.flush()

        # Create sample agents
        sample_agents = [
            {
                "name": "Customer Support Bot",
                "description": "AI-powered customer support agent that handles FAQs, ticket creation, and escalation with empathy and precision.",
                "category": "Customer Support",
                "pricing_type": "per_use",
                "price": 0.05,
                "system_prompt": "You are a helpful customer support agent. Be empathetic, concise, and solution-focused.",
                "tools_config": json.dumps(["search_knowledge_base", "create_ticket", "escalate"]),
                "is_published": True,
                "is_featured": True,
                "rating": 4.8,
                "review_count": 124,
                "execution_count": 3200,
            },
            {
                "name": "Data Analyst Pro",
                "description": "Analyzes datasets, generates insights, creates visualizations, and produces comprehensive reports.",
                "category": "Data Analysis",
                "pricing_type": "subscription",
                "price": 29.99,
                "system_prompt": "You are an expert data analyst. Analyze data thoroughly and present insights clearly with actionable recommendations.",
                "tools_config": json.dumps(["query_database", "generate_chart", "export_report"]),
                "is_published": True,
                "is_featured": True,
                "rating": 4.6,
                "review_count": 89,
                "execution_count": 1850,
            },
            {
                "name": "Code Review Assistant",
                "description": "Reviews code for bugs, security issues, performance improvements, and best practices across multiple languages.",
                "category": "Code Assistant",
                "pricing_type": "free",
                "price": 0.0,
                "system_prompt": "You are an expert code reviewer. Review code for correctness, security, performance, and maintainability.",
                "tools_config": json.dumps(["analyze_code", "run_linter", "check_security"]),
                "is_published": True,
                "is_featured": True,
                "rating": 4.9,
                "review_count": 203,
                "execution_count": 5600,
            },
            {
                "name": "Content Creator",
                "description": "Creates high-quality blog posts, social media content, ad copy, and marketing materials tailored to your brand.",
                "category": "Content Creation",
                "pricing_type": "per_use",
                "price": 0.10,
                "system_prompt": "You are a creative content writer. Create engaging, SEO-optimized content that resonates with the target audience.",
                "is_published": True,
                "is_featured": False,
                "rating": 4.5,
                "review_count": 67,
                "execution_count": 2100,
            },
            {
                "name": "Research Assistant",
                "description": "Conducts thorough research on any topic, synthesizes information from multiple sources, and produces structured reports.",
                "category": "Research",
                "pricing_type": "per_use",
                "price": 0.08,
                "system_prompt": "You are a meticulous researcher. Gather comprehensive information, verify facts, and present balanced, well-cited analyses.",
                "is_published": True,
                "is_featured": True,
                "rating": 4.7,
                "review_count": 156,
                "execution_count": 4300,
            },
            {
                "name": "Legal Document Reviewer",
                "description": "Reviews contracts, terms of service, and legal documents for potential risks and key clauses.",
                "category": "Legal",
                "pricing_type": "subscription",
                "price": 49.99,
                "system_prompt": "You are a legal document analyst. Identify key clauses, potential risks, and provide plain-language summaries.",
                "is_published": True,
                "is_featured": False,
                "rating": 4.4,
                "review_count": 42,
                "execution_count": 780,
            },
        ]

        for agent_data in sample_agents:
            agent = Agent(**agent_data, creator_id=demo_user.id)
            db.add(agent)

        await db.commit()


@app.on_event("startup")
async def startup():
    await init_db()
    await seed_data()


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.app_name}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
