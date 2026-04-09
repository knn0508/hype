"""
FastAPI entry point for Abituriyent AI Career Guidance System.
"""
import os
from pathlib import Path
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import status, Depends

from database import (
    init_database,
    seed_database,
    get_all_attributes,
    get_attributes_for_group,
    get_majors_for_group,
    get_user_by_email,
    create_user,
    save_result,
    get_user_results,
)
from matcher import find_best_matches
from ai_service import generate_review
from user_models import UserCreate, UserResponse, Token
from auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta


# Initialize FastAPI app
app = FastAPI(
    title="Abituriyent AI",
    description="Career Guidance System for Azerbaijani University Applicants",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://abituriyent-ai.vercel.app",
        "https://hype-jjd12v1hp-nihadtaghiyev1-9395s-projects.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class AnalyzeRequest(BaseModel):
    exam_group: int
    attributes: Dict[str, int]


class AttributeBreakdown(BaseModel):
    user_score: int
    required_score: int
    difference: int


class MatchResult(BaseModel):
    major_name: str
    match_percentage: float
    attribute_breakdown: Dict[str, AttributeBreakdown]


class AnalyzeResponse(BaseModel):
    matches: List[MatchResult]
    ai_review: str


# Lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_database()
    seed_database()


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "message": "Abituriyent AI API is running",
        "version": "1.0.0"
    }


@app.get("/api/attributes")
async def get_attributes(group_id: Optional[int] = None) -> List[str]:
    """
    Get list of attribute keys for building the test form.

    Args:
        group_id: Optional exam group ID (1-5). If not provided, returns all attributes.

    Returns:
        List of attribute names
    """
    if group_id:
        if not 1 <= group_id <= 5:
            raise HTTPException(status_code=400, detail="Invalid exam group. Must be 1-5.")
        return get_attributes_for_group(group_id)
    return get_all_attributes()


@app.get("/api/groups/{group_id}/majors")
async def get_group_majors(group_id: int) -> List[Dict[str, Any]]:
    """
    Get all majors for a specific exam group.

    Args:
        group_id: Exam group ID (1-5)

    Returns:
        List of majors with their attributes
    """
    if not 1 <= group_id <= 5:
        raise HTTPException(status_code=400, detail="Invalid exam group. Must be 1-5.")

    return get_majors_for_group(group_id)


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_profile(request: AnalyzeRequest, current_user: Optional[dict] = Depends(get_current_user_optional)) -> AnalyzeResponse:
    """
    Analyze user profile and return matching majors with AI review.

    Args:
        request: User's exam group and attribute scores

    Returns:
        Top 5 matching majors and AI-generated career review
    """
    # Validate exam group
    if not 1 <= request.exam_group <= 5:
        raise HTTPException(status_code=400, detail="Invalid exam group. Must be 1-5.")

    # Validate attributes
    if not request.attributes:
        raise HTTPException(status_code=400, detail="Attributes cannot be empty.")

    # Validate attribute scores
    for attr, score in request.attributes.items():
        if not 1 <= score <= 5:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid score for {attr}. Must be 1-5."
            )

    # Get majors for the exam group
    majors = get_majors_for_group(request.exam_group)

    if not majors:
        raise HTTPException(
            status_code=404,
            detail=f"No majors found for exam group {request.exam_group}"
        )

    # Find best matches
    top_matches = find_best_matches(request.attributes, majors, top_n=5)

    # Generate AI review
    ai_review = generate_review(
        request.attributes,
        top_matches,
        request.exam_group
    )

    # Automatically save result if user is authenticated
    if current_user and current_user.get('id'):
        # Elements in top_matches might be dicts rather than Pydantic MatchResult objects
        top_major = top_matches[0].get("major_name", "Unknown") if top_matches else "Unknown"
        match_percent = top_matches[0].get("match_percentage", 0.0) if top_matches else 0.0
        
        # If it happens to be an object instead of a dict, handle that gracefully
        if top_matches and not isinstance(top_matches[0], dict):
            top_major = getattr(top_matches[0], "major_name", "Unknown")
            match_percent = getattr(top_matches[0], "match_percentage", 0.0)
            
        save_result(current_user['id'], request.exam_group, top_major, match_percent, ai_review)

    return AnalyzeResponse(
        matches=top_matches,
        ai_review=ai_review
    )


@app.post("/api/seed")
async def seed_db():
    """Manually trigger database seeding."""
    seed_database()
    return {"status": "ok", "message": "Database seeded successfully"}

@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    db_user = get_user_by_email(user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    new_user = create_user(user.name, user.email, hashed_password)
    
    if not new_user:
        raise HTTPException(status_code=500, detail="User creation failed")
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form_data.username) # OAuth2 form expects username (here, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


# Run with: uvicorn main:app --reload --host 0.0.0.0 --port 8000
