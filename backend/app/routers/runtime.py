import uuid
import random
from fastapi import APIRouter
from app.models.schemas import SimulateTurnRequest, EscalationItem
from app.data.database import WORKFORCES_DB, ESCALATION_QUEUE
from app.data.templates import PRESET_TEMPLATES

router = APIRouter(prefix="/api/simulate", tags=["Multi-Agent Runtime Engine"])

@router.post("/turn")
def simulate_session_turn(req: SimulateTurnRequest):
    wf = WORKFORCES_DB.get(req.workforce_id, PRESET_TEMPLATES["support"])
    text_input = req.user_input.strip()
    text_lower = text_input.lower()
    
    is_tamil = "aagi" in text_lower or "vandhuchu" in text_lower or "venum" in text_lower or "kedaikuma" in text_lower or "aama" in text_lower or req.language == "ta"
    is_hindi = "chahiye" in text_lower or "mujhe" in text_lower or "kaise" in text_lower or "bata" in text_lower or req.language == "hi"

    idempotency_key = f"IK-{uuid.uuid4().hex[:8].upper()}"

    if req.confirm_action:
        return {
            "turn_index": 4,
            "speaker": "Refund Worker",
            "worker_id": "refund",
            "text": "Refund started via Payment Gateway. Reference RF-2291. Money will reflect in 3-5 business days." if not is_tamil else "Refund start aagiyuduchu. Reference RF-2291. 3-5 naatkul bank accounthil serum.",
            "tool_used": "pay",
            "action_taken": "create_refund",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 145,
            "indic_audio_url": "/audio/sample_ta_refund_success.mp3"
        }

    if req.image_url:
        return {
            "turn_index": 3,
            "speaker": "Refund Worker",
            "worker_id": "refund",
            "text": "Damage verified from uploaded photo (torn fabric edge). Refund of ₹1,499 requires your confirmation. Shall I proceed?" if not is_tamil else "Photo check panni damage confirm aachu. Rs 1,499 refund panna unga approval venum. Confirm pannalama?",
            "tool_used": "pay",
            "action_taken": "verify_damage_image",
            "approval_required": True,
            "idempotency_key": idempotency_key,
            "escalated": False,
            "latency_ms": 280
        }

    if any(k in text_lower for k in ["order", "4821", "status", "delivery", "check"]):
        return {
            "turn_index": 2,
            "speaker": "Order Verification Worker",
            "worker_id": "order_check",
            "text": "Order #4821 found in Order DB. Delivered 2 days ago via Express Courier. How can I assist with this item?" if not is_tamil else "Order #4821 check panniachu. 2 naalaikku munnadi deliver aagi irukku.",
            "tool_used": "orders",
            "action_taken": "get_order_by_id",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 110
        }

    if any(k in text_lower for k in ["human", "agent", "supervisor", "speak to person", "complaint"]):
        new_esc_id = f"ESC-{random.randint(9100, 9999)}"
        new_item = EscalationItem(
            id=new_esc_id,
            session_id=req.session_id,
            workforce_id=req.workforce_id,
            customer_name="Web Caller",
            language=req.language,
            reason="User requested human escalation directly",
            status="pending",
            timestamp="Just now",
            transcript=[{"speaker": "Customer", "text": req.user_input}],
            task_state={"user_request": req.user_input},
            suggested_action="Review transcript and connect live voice call."
        )
        ESCALATION_QUEUE.insert(0, new_item)

        return {
            "turn_index": 5,
            "speaker": "Escalation Worker",
            "worker_id": "escalation",
            "text": "I have created an escalation ticket and notified our human supervisor team with your full transcript state." if not is_tamil else "Unga query-ah human supervisor-kku pass panni ticket create panniachu.",
            "tool_used": "helpdesk",
            "action_taken": "create_handoff_ticket",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": True,
            "escalation_id": new_esc_id,
            "latency_ms": 160
        }

    return {
        "turn_index": 1,
        "speaker": "Query Worker",
        "worker_id": "query_worker",
        "text": f"I understand you are asking: '{req.user_input}'. Let me query our knowledge base and assist you step by step." if not is_tamil else f"Unga query: '{req.user_input}'. Delivery matrum return policy patri saari-aaga solgiren.",
        "tool_used": None,
        "action_taken": "kb_similarity_search",
        "idempotency_key": idempotency_key,
        "approval_required": False,
        "escalated": False,
        "latency_ms": 95
    }
