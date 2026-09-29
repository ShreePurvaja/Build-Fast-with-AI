from typing import List
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import EscalationItem
from app.data.database import ESCALATION_QUEUE

router = APIRouter(prefix="/api/escalations", tags=["Escalations Inbox"])

@router.get("", response_model=List[EscalationItem])
def list_escalations():
    return ESCALATION_QUEUE

@router.post("/{esc_id}/resolve")
def resolve_escalation(esc_id: str, action: str = Query("resolve")):
    for item in ESCALATION_QUEUE:
        if item.id == esc_id:
            item.status = "resolved" if action == "resolve" else "taken_over"
            return {"status": "success", "escalation": item}
    raise HTTPException(status_code=404, detail="Escalation item not found")
