import re
import uuid
import random
from fastapi import APIRouter
from app.models.schemas import SimulateTurnRequest, EscalationItem
from app.data.database import (
    WORKFORCES_DB, ESCALATION_QUEUE, ORDERS_DB, LEADS_DB,
    APPOINTMENTS_DB, CANDIDATES_DB, KNOWLEDGE_DOCS, ensure_user_domain_data
)
from app.data.templates import PRESET_TEMPLATES
from app.engine.voice_formatter import format_voice_response
from app.engine.fillers import get_audio_filler
from app.engine.slots import SlotStore
from app.engine.gateway import execute_tool_gateway, generate_idempotency_key
from app.engine.graph_engine import detect_emergency

router = APIRouter(prefix="/api/simulate", tags=["Multi-Agent Runtime Engine"])

# Global session slots cache
SESSION_SLOTS_CACHE = {}

def detect_language(text: str, hint: str = "en") -> str:
    """Detects if user is speaking Tamil, Hindi, or English based on keywords and scripts."""
    # Check Unicode scripts
    if re.search(r'[\u0B80-\u0BFF]', text):  # Tamil script
        return "ta"
    if re.search(r'[\u0900-\u097F]', text):  # Devanagari / Hindi script
        return "hi"
    
    text_lower = text.lower()
    if any(k in text_lower for k in ["aagi", "vandhuchu", "venum", "kedaikuma", "aama", "solunga"]):
        return "ta"
    if any(k in text_lower for k in ["chahiye", "mujhe", "kaise", "batao", "hai", "bhai"]):
        return "hi"
        
    return "en"

@router.post("/turn")
def simulate_session_turn(req: SimulateTurnRequest):
    wf_id = req.workforce_id or "wf_support"
    text_input = req.user_input.strip()
    text_lower = text_input.lower()
    lang = detect_language(text_input, hint=req.language or "en")
    
    customer_id = req.customer_id if req.customer_id else "cust_gowtham"
    customer_name = req.customer_name if req.customer_name else "Gowtham D"

    # Ensure user has structured DB records across Support, Sales, Booking, and HR
    ensure_user_domain_data(customer_id, customer_name)

    slot_store = SESSION_SLOTS_CACHE.setdefault(req.session_id, SlotStore())
    idempotency_key = generate_idempotency_key("org_sme_001", wf_id, {"session_id": req.session_id, "text": text_input[:20]})

    # 1. Emergency Triage Check (Highest Priority)
    if detect_emergency(text_input):
        new_esc_id = f"ESC-{random.randint(9100, 9999)}"
        new_item = EscalationItem(
            id=new_esc_id,
            session_id=req.session_id,
            workforce_id=wf_id,
            customer_name=customer_name,
            language=lang,
            reason="URGENT MEDICAL EMERGENCY DETECTED",
            status="pending",
            timestamp="Just now",
            transcript=[{"speaker": "Customer", "text": req.user_input}],
            task_state={"emergency": True, "input": req.user_input},
            suggested_action="Immediate dispatch to emergency medical staff."
        )
        ESCALATION_QUEUE.insert(0, new_item)
        
        emergency_text = "If this is a medical emergency, please hang up and call 108 or 112 immediately. I have flagged your call for urgent staff connection."
        return {
            "turn_index": 99,
            "speaker": "Emergency Triage",
            "worker_id": "escalation",
            "text": format_voice_response(emergency_text, lang=lang),
            "tool_used": "helpdesk",
            "action_taken": "emergency_triage_override",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": True,
            "escalation_id": new_esc_id,
            "latency_ms": 60
        }

    # 2. Human Supervisor Escalation
    if any(k in text_lower for k in ["human", "agent", "supervisor", "speak to person", "complaint"]):
        new_esc_id = f"ESC-{random.randint(9100, 9999)}"
        new_item = EscalationItem(
            id=new_esc_id,
            session_id=req.session_id,
            workforce_id=wf_id,
            customer_name=customer_name,
            language=lang,
            reason="User requested human supervisor transfer",
            status="pending",
            timestamp="Just now",
            transcript=[{"speaker": "Customer", "text": req.user_input}],
            task_state={"user_request": req.user_input},
            suggested_action="Review transcript and connect live supervisor call."
        )
        ESCALATION_QUEUE.insert(0, new_item)

        raw_resp = f"Hi {customer_name}, I have created an escalation ticket and notified our supervisor team with your details." if lang == "en" else f"Vanakkam {customer_name}, human supervisor-kku ticket create panni pass panniachu."
        return {
            "turn_index": 5,
            "speaker": "Escalation Worker",
            "worker_id": "escalation",
            "text": format_voice_response(raw_resp, lang=lang),
            "audio_filler": get_audio_filler("helpdesk", lang=lang),
            "tool_used": "helpdesk",
            "action_taken": "create_handoff_ticket",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": True,
            "escalation_id": new_esc_id,
            "latency_ms": 140
        }

    # WORKFLOW 1: Customer Support & Refunds (wf_support)
    if wf_id == "wf_support" or "order" in text_lower or "refund" in text_lower or "saree" in text_lower:
        # Check Customer Confirmation Gate
        if req.confirm_action:
            success, res = execute_tool_gateway(
                tenant_id="org_sme_001",
                customer_id=customer_id,
                tool_name="pay",
                args={"order_id": "ORD-8821", "action": "create_refund"},
                confirmed_by_user=True,
                auto_refund_limit=2000
            )
            raw_resp = f"Refund started for {res.get('item', 'Kanjivaram Saree')}. Reference {res.get('refund_ref', 'RF-2291')}. Money will reflect in 3 to 5 business days."
            return {
                "turn_index": 4,
                "speaker": "Refund Worker",
                "worker_id": "refund",
                "text": format_voice_response(raw_resp, lang=lang),
                "audio_filler": get_audio_filler("pay", lang=lang),
                "tool_used": "pay",
                "action_taken": "create_refund",
                "idempotency_key": idempotency_key,
                "approval_required": False,
                "escalated": False,
                "latency_ms": 130
            }

        if req.image_url:
            raw_resp = "Damage verified from uploaded photo. Refund of 14 hundred and 99 rupees requires your confirmation. Shall I proceed?"
            return {
                "turn_index": 3,
                "speaker": "Refund Worker",
                "worker_id": "refund",
                "text": format_voice_response(raw_resp, lang=lang),
                "audio_filler": get_audio_filler("pay", lang=lang),
                "tool_used": "pay",
                "action_taken": "verify_damage_image",
                "approval_required": True,
                "idempotency_key": idempotency_key,
                "escalated": False,
                "latency_ms": 250
            }

        # Query Gowtham D's Orders Database
        user_orders = [o for o in ORDERS_DB.values() if o["customer_id"] == customer_id]
        if any(k in text_lower for k in ["order", "receive", "status", "delivery", "check", "track", "item"]):
            if "8821" in text_lower:
                ord_info = ORDERS_DB["ORD-8821"]
                raw_resp = f"Order ORD-8821 for {ord_info['item_name']} was delivered on {ord_info['delivery_date']} via {ord_info['courier']}."
            elif "8822" in text_lower:
                ord_info = ORDERS_DB["ORD-8822"]
                raw_resp = f"Order ORD-8822 for {ord_info['item_name']} is out for delivery. Expected {ord_info['expected_delivery']}."
            elif "8823" in text_lower:
                ord_info = ORDERS_DB["ORD-8823"]
                raw_resp = f"Order ORD-8823 for {ord_info['item_name']} is currently processing. Expected delivery {ord_info['expected_delivery']}."
            else:
                raw_resp = f"Hi {customer_name}, you have 3 active orders: Order ORD-8821 for Kanjivaram Saree was delivered yesterday. Order ORD-8822 for Earbuds is out for delivery today. Order ORD-8823 for Blue Formal Shirt is processing."
            
            return {
                "turn_index": 2,
                "speaker": "Order Verification Worker",
                "worker_id": "order_check",
                "text": format_voice_response(raw_resp, lang=lang),
                "audio_filler": get_audio_filler("orders", lang=lang),
                "tool_used": "orders",
                "action_taken": "get_orders_by_customer",
                "idempotency_key": idempotency_key,
                "approval_required": False,
                "escalated": False,
                "latency_ms": 105
            }

    # WORKFLOW 2: Sales Lead Follow-up (wf_sales)
    if wf_id == "wf_sales" or "sales" in text_lower or "demo" in text_lower or "lead" in text_lower or "budget" in text_lower:
        lead = LEADS_DB.get(customer_id, {})
        raw_resp = f"Hi {customer_name}, your product demo for {lead.get('company', 'Gowtham Tech')} ({lead.get('seats', 50)} seats) is scheduled for {lead.get('demo_time')}. Sales executive {lead.get('rep')} will host the call."
        return {
            "turn_index": 2,
            "speaker": "Demo Scheduler",
            "worker_id": "scheduler",
            "text": format_voice_response(raw_resp, lang=lang),
            "audio_filler": get_audio_filler("cal", lang=lang),
            "tool_used": "cal",
            "action_taken": "get_lead_demo_schedule",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 115
        }

    # WORKFLOW 3: Appointment Booking Desk (wf_booking)
    if wf_id == "wf_booking" or "appointment" in text_lower or "doctor" in text_lower or "clinic" in text_lower:
        apt = APPOINTMENTS_DB.get(customer_id, {})
        raw_resp = f"Hi {customer_name}, your appointment with {apt.get('doctor')} at {apt.get('clinic')} is confirmed for {apt.get('slot_time')}."
        return {
            "turn_index": 2,
            "speaker": "Booking Worker",
            "worker_id": "booking_worker",
            "text": format_voice_response(raw_resp, lang=lang),
            "audio_filler": get_audio_filler("cal", lang=lang),
            "tool_used": "cal",
            "action_taken": "get_appointment_details",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 110
        }

    # WORKFLOW 4: Recruitment Screening (wf_hr)
    if wf_id == "wf_hr" or "resume" in text_lower or "job" in text_lower or "interview" in text_lower or "candidate" in text_lower:
        cand = CANDIDATES_DB.get(customer_id, {})
        raw_resp = f"Hi {customer_name}, your application for {cand.get('role')} has passed technical screening with a score of {cand.get('screening_score')}%. Your interview is scheduled for {cand.get('interview_time')}."
        return {
            "turn_index": 2,
            "speaker": "Resume Screener Worker",
            "worker_id": "screener",
            "text": format_voice_response(raw_resp, lang=lang),
            "audio_filler": get_audio_filler("ats", lang=lang),
            "tool_used": "ats",
            "action_taken": "get_candidate_status",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 120
        }

    # Fallback Query Node
    raw_resp = f"Hi {customer_name}, I checked our knowledge base regarding '{req.user_input}'. Standard shipping takes 3 to 5 days, and return requests are accepted within 14 days of delivery."
    return {
        "turn_index": 1,
        "speaker": "Query Worker",
        "worker_id": "query_worker",
        "text": format_voice_response(raw_resp, lang=lang),
        "audio_filler": get_audio_filler("default", lang=lang),
        "tool_used": None,
        "action_taken": "kb_similarity_search",
        "idempotency_key": idempotency_key,
        "approval_required": False,
        "escalated": False,
        "latency_ms": 90
    }


