from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.database import Base, engine
from .routers import auth, quiz

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QuEstAI API",
    description="AI-powered exam question generator for Indian education system",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(quiz.router)


@app.get("/")
async def root():
    return {"message": "Welcome to QuEstAI API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
