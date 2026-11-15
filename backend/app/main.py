import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.services.seed_service import load_seed_data

# Import API routers
from app.api.v1.auth import router as auth_router
from app.api.v1.chat_ws import router as chat_router
from app.api.v1.interviews import router as interviews_router
from app.api.v1.vocabulary import router as vocabulary_router
from app.api.v1.writing import router as writing_router
from app.api.v1.pronunciation import router as pronunciation_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.seed import router as seed_router
from app.api.v1.feedback import router as feedback_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("speakup.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed data
    logger.info("Initializing SQLite database tables...")
    await init_db()
    async with AsyncSessionLocal() as session:
        await load_seed_data(session)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down SpeakUp backend server...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI English Coach and Interview Preparation Agent Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(chat_router, prefix=api_v1_prefix)
app.include_router(interviews_router, prefix=api_v1_prefix)
app.include_router(vocabulary_router, prefix=api_v1_prefix)
app.include_router(writing_router, prefix=api_v1_prefix)
app.include_router(pronunciation_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(seed_router, prefix=api_v1_prefix)
app.include_router(feedback_router, prefix=api_v1_prefix)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "llm_provider": settings.LLM_PROVIDER
    }

@app.get("/")
async def root():
    return {
        "message": "SpeakUp AI English Coach Backend is running.",
        "docs": "/docs",
        "health": "/health"
    }
