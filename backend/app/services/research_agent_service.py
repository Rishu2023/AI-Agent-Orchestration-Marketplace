import uuid
import random
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.research import ResearchPaper, TrendingModel


_SIMULATED_PAPERS = [
    {
        "title": "Scaling Laws for Neural Language Models",
        "authors": ["J. Kaplan", "S. McCandlish", "T. Henighan"],
        "abstract": "We study empirical scaling laws for language model performance on the cross-entropy loss.",
        "source": "arxiv",
        "source_url": "https://arxiv.org/abs/2001.08361",
        "tags": ["scaling", "language-models", "transformers"],
        "relevance_score": 0.95,
    },
    {
        "title": "Constitutional AI: Harmlessness from AI Feedback",
        "authors": ["Y. Bai", "S. Kadavath", "S. Kundu"],
        "abstract": "We experiment with methods for training a harmless AI assistant through self-improvement.",
        "source": "arxiv",
        "source_url": "https://arxiv.org/abs/2212.08073",
        "tags": ["alignment", "safety", "RLHF"],
        "relevance_score": 0.92,
    },
    {
        "title": "Tree of Thoughts: Deliberate Problem Solving with Large Language Models",
        "authors": ["S. Yao", "D. Yu", "J. Zhao"],
        "abstract": "We introduce a framework for language model inference that enables exploration over coherent text.",
        "source": "arxiv",
        "source_url": "https://arxiv.org/abs/2305.10601",
        "tags": ["reasoning", "problem-solving", "LLM"],
        "relevance_score": 0.90,
    },
    {
        "title": "LoRA: Low-Rank Adaptation of Large Language Models",
        "authors": ["E. Hu", "Y. Shen", "P. Wallis"],
        "abstract": "We propose Low-Rank Adaptation for efficiently adapting large language models to downstream tasks.",
        "source": "arxiv",
        "source_url": "https://arxiv.org/abs/2106.09685",
        "tags": ["fine-tuning", "efficiency", "adaptation"],
        "relevance_score": 0.93,
    },
    {
        "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        "authors": ["P. Lewis", "E. Perez", "A. Piktus"],
        "abstract": "We explore a general-purpose fine-tuning recipe for retrieval-augmented generation.",
        "source": "arxiv",
        "source_url": "https://arxiv.org/abs/2005.11401",
        "tags": ["RAG", "retrieval", "knowledge"],
        "relevance_score": 0.91,
    },
]

_SIMULATED_MODELS = [
    {
        "name": "Llama-3-70B",
        "provider": "Meta",
        "description": "Open-source large language model with 70B parameters.",
        "source": "huggingface",
        "source_url": "https://huggingface.co/meta-llama/Llama-3-70B",
        "stars": 15200,
        "trend_score": 0.97,
    },
    {
        "name": "Mixtral-8x7B",
        "provider": "Mistral AI",
        "description": "Sparse mixture-of-experts model with strong performance.",
        "source": "huggingface",
        "source_url": "https://huggingface.co/mistralai/Mixtral-8x7B",
        "stars": 9800,
        "trend_score": 0.93,
    },
    {
        "name": "Qwen-2-72B",
        "provider": "Alibaba",
        "description": "Large multilingual language model with strong coding capabilities.",
        "source": "huggingface",
        "source_url": "https://huggingface.co/Qwen/Qwen2-72B",
        "stars": 7600,
        "trend_score": 0.89,
    },
    {
        "name": "CodeGemma-7B",
        "provider": "Google",
        "description": "Code-specialized language model built on Gemma architecture.",
        "source": "github",
        "source_url": "https://github.com/google/gemma",
        "stars": 5400,
        "trend_score": 0.85,
    },
]


def summarize_paper(paper: Dict[str, Any]) -> str:
    return (
        f"This paper titled '{paper['title']}' by {', '.join(paper.get('authors', []))} "
        f"investigates {paper.get('abstract', 'various aspects of AI research')}. "
        f"Key topics: {', '.join(paper.get('tags', []))}."
    )


def fetch_latest_papers(db: Session, source: Optional[str] = None, limit: int = 10) -> List[ResearchPaper]:
    papers_data = _SIMULATED_PAPERS
    if source:
        papers_data = [p for p in papers_data if p["source"] == source]

    created = []
    for data in papers_data[:limit]:
        existing = db.query(ResearchPaper).filter(ResearchPaper.title == data["title"]).first()
        if existing:
            created.append(existing)
            continue
        paper = ResearchPaper(
            title=data["title"],
            authors=data["authors"],
            abstract=data["abstract"],
            source=data["source"],
            source_url=data["source_url"],
            summary=summarize_paper(data),
            tags=data["tags"],
            relevance_score=data["relevance_score"],
        )
        db.add(paper)
        created.append(paper)

    db.commit()
    for p in created:
        db.refresh(p)
    return created


def fetch_trending_models(db: Session, limit: int = 10) -> List[TrendingModel]:
    created = []
    for data in _SIMULATED_MODELS[:limit]:
        existing = db.query(TrendingModel).filter(TrendingModel.name == data["name"]).first()
        if existing:
            created.append(existing)
            continue
        model = TrendingModel(
            name=data["name"],
            provider=data["provider"],
            description=data["description"],
            source=data["source"],
            source_url=data["source_url"],
            stars=data["stars"],
            trend_score=data["trend_score"],
        )
        db.add(model)
        created.append(model)

    db.commit()
    for m in created:
        db.refresh(m)
    return created


def auto_create_agent(db: Session, paper: ResearchPaper) -> Dict[str, Any]:
    paper.auto_agent_created = True
    db.commit()
    return {
        "name": f"Research Agent: {paper.title[:80]}",
        "description": paper.summary or paper.abstract or "",
        "tags": paper.tags or [],
        "source_paper_id": str(paper.id),
    }


def run_research_cycle(db: Session) -> Dict[str, Any]:
    papers = fetch_latest_papers(db)
    models = fetch_trending_models(db)

    agents_created = 0
    for paper in papers:
        if paper.relevance_score >= 0.93 and not paper.auto_agent_created:
            auto_create_agent(db, paper)
            agents_created += 1

    return {
        "papers_found": len(papers),
        "models_found": len(models),
        "agents_created": agents_created,
    }


def get_latest_papers(db: Session, limit: int = 20) -> List[ResearchPaper]:
    return (
        db.query(ResearchPaper)
        .order_by(ResearchPaper.created_at.desc())
        .limit(limit)
        .all()
    )


def get_paper_by_id(db: Session, paper_id: uuid.UUID) -> Optional[ResearchPaper]:
    return db.query(ResearchPaper).filter(ResearchPaper.id == paper_id).first()


def get_trending_models(db: Session, limit: int = 20) -> List[TrendingModel]:
    return (
        db.query(TrendingModel)
        .order_by(TrendingModel.trend_score.desc())
        .limit(limit)
        .all()
    )


def get_auto_created_agents(db: Session, limit: int = 20) -> List[ResearchPaper]:
    return (
        db.query(ResearchPaper)
        .filter(ResearchPaper.auto_agent_created.is_(True))
        .order_by(ResearchPaper.created_at.desc())
        .limit(limit)
        .all()
    )
