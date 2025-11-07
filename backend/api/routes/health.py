from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="Health check")
def health_check():
    """Returns the operational status of the application."""
    return {"status": "ok"}