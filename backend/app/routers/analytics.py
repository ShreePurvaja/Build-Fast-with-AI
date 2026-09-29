from fastapi import APIRouter
from app.models.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/analytics", tags=["Control Center Analytics"])

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary():
    return AnalyticsSummary(
        conversations_today=48,
        completed_tasks=41,
        escalated_to_humans=5,
        failed_tool_calls=2,
        avg_latency_ms=135,
        estimated_cost_inr=14.50,
        active_sessions=3,
        indic_breakdown={"Tamil (ta)": 22, "Hindi (hi)": 16, "Telugu (te)": 6, "English (en)": 4}
    )
