import re
import os
import json
import uuid
import random
import urllib.request
from typing import Optional, Dict, Any
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
    """Detects if user is speaking Tamil, Hindi, or English strictly based on text & script."""
    # Priority 1: Native Scripts
    if re.search(r'[\u0B80-\u0BFF]', text):  # Tamil script
        return "ta"
    if re.search(r'[\u0900-\u097F]', text):  # Devanagari / Hindi script
        return "hi"
    
    text_lower = text.lower()
    
    # Priority 2: English keywords (if user typed ASCII English, force "en")
    english_keywords = [
        "order", "where", "status", "delivery", "check", "refund", "appointment", 
        "doctor", "interview", "candidate", "lead", "demo", "price", "saree", 
        "earbuds", "shirt", "hi", "hello", "help", "book", "track", "cancel", "speak"
    ]
    if any(k in text_lower for k in english_keywords) and not any(k in text_lower for k in ["vandhuchu", "venum", "kedaikuma", "solunga", "chahiye", "mujhe"]):
        return "en"

    if any(k in text_lower for k in ["aagi", "vandhuchu", "venum", "kedaikuma", "solunga", "aama"]):
        return "ta"
    if any(k in text_lower for k in ["chahiye", "mujhe", "kaise", "batao", "bhai"]):
        return "hi"
        
    return hint if hint in ["en", "ta", "hi"] else "en"

def query_real_nvidia_llm(user_input: str, system_prompt: str, context: str, lang: str = "en") -> Optional[str]:
    """Executes real NVIDIA NIM LLM inference for voice turn synthesis."""
    key = os.getenv("NVIDIA_API_KEY") or os.getenv("NVIDIA_API") or os.getenv("NVDIA_API_KEY") or ""
    key = key.strip()
    if not key:
        return None

    lang_desc = "English" if lang == "en" else ("Tamil" if lang == "ta" else "Hindi")
    full_prompt = (
        f"{system_prompt}\n\n"
        f"REAL DATABASE & KNOWLEDGE CONTEXT:\n{context}\n\n"
        f"USER SPOKEN QUERY: \"{user_input}\"\n"
        f"TARGET LANGUAGE: {lang_desc}\n\n"
        f"CRITICAL VOICE AGENT CONSTRAINTS:\n"
        f"1. You are speaking directly over a live phone call. Be warm, natural, and helpful.\n"
        f"2. NEVER mention 'MongoDB', 'database', 'vector store', 'internal system', 'JSON', 'algorithm', or technical jargon.\n"
        f"3. Maximum 1 to 2 short sentences total. Ready for Text-to-Speech audio playback.\n"
        f"4. Respond directly in {lang_desc}.\n"
        f"5. DO NOT start with any greeting (such as 'Hello', 'Hi', 'Good morning', 'Good afternoon', 'Vanakkam', 'Namaste'). Jump straight to answering the user's question directly since you are already mid-conversation."
    )

    payload = json.dumps({
        "model": "meta/llama-3.2-11b-vision-instruct",
        "messages": [
            {"role": "system", "content": "You are a professional customer service voice AI assistant answering turn queries mid-call."},
            {"role": "user", "content": full_prompt}
        ],
        "max_tokens": 75,
        "temperature": 0.1
    }).encode("utf-8")

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "User-Agent": "VoiceAgentEngine/1.0"
    }

    try:
        r = urllib.request.Request("https://integrate.api.nvidia.com/v1/chat/completions", data=payload, headers=headers)
        with urllib.request.urlopen(r, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            ans = data["choices"][0]["message"]["content"].strip()
            if ans:
                ans = ans.strip('"\'')
                ans = re.sub(r'^(?:hello|hi|hey|good\s+(?:morning|afternoon|evening)|vanakkam|namaste)(?:\s+[a-z0-9_\-\.]+)?[\s,!\.-]+', '', ans, flags=re.IGNORECASE).strip()
                if ans:
                    ans = ans[0].upper() + ans[1:]
                return ans
    except Exception as e:
        print(f"[NVIDIA LLM Engine Notice] {e}")

    return None

@router.post("/turn")
def simulate_session_turn(req: SimulateTurnRequest):
    wf_id = req.workforce_id or "wf_support"
    text_input = req.user_input.strip()
    text_lower = text_input.lower()
    lang = detect_language(text_input, hint=req.language or "en")
    
    customer_id = req.customer_id if req.customer_id else "cust_gowtham"
    customer_name = req.customer_name if req.customer_name else "Gowtham D"

    # Ensure user has authentic baseline DB records
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

        raw_resp = f"Hi {customer_name}, I have created an escalation ticket and notified our supervisor team with your details." if lang == "en" else f"Vanakkam {customer_name}, human supervisor ticket create panni pass panniachu."
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

    # WORKFLOW 1: Customer Support & Refunds (wf_support / proj_support_01)
    if wf_id in ["wf_support", "proj_support_01"] or any(k in text_lower for k in ["order", "refund", "saree", "earbuds", "shirt", "item", "delivery", "track"]):
        if req.confirm_action:
            success, res = execute_tool_gateway(
                tenant_id="org_sme_001",
                customer_id=customer_id,
                tool_name="pay",
                args={"order_id": "ORD-8821", "action": "create_refund"},
                confirmed_by_user=True,
                auto_refund_limit=2000
            )
            raw_resp = f"Refund of ₹{res.get('amount', 1499)} initiated for {res.get('item', 'Kanjivaram Saree')}. Reference {res.get('refund_ref', 'RF-2291')}. Amount will reflect in 3 to 5 business days."
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

        # Query Database Records for Customer
        user_orders = [o for o in ORDERS_DB.values() if o["customer_id"] == customer_id]
        orders_context = f"Customer Name: {customer_name}. Account ID: {customer_id}.\nActive Orders:\n"
        for o in user_orders:
            orders_context += f"- Order {o['id']}: Item {o['item_name']}, Price ₹{o['price']}, Status {o['status']}, Delivery Info: {o.get('delivery_date') or o.get('expected_delivery')}.\n"

        llm_response = query_real_nvidia_llm(
            user_input=text_input,
            system_prompt="You are an order verification & support assistant for an e-commerce platform.",
            context=orders_context,
            lang=lang
        )

        if not llm_response:
            # Clean grounded response from DB context
            if "8821" in text_lower:
                llm_response = f"Order ORD-8821 for Kanjivaram Silk Saree was delivered on Oct 1 via Express Courier."
            elif "8822" in text_lower:
                llm_response = f"Order ORD-8822 for Wireless Noise-Canceling Earbuds is out for delivery today by 4:00 PM via BlueDart."
            elif "8823" in text_lower:
                llm_response = f"Order ORD-8823 for Cotton Formal Shirt is currently processing and expected on Oct 4."
            else:
                llm_response = f"You have 3 active orders: your Kanjivaram Saree was delivered, your Earbuds are out for delivery today, and your Formal Shirt is processing."

        return {
            "turn_index": 2,
            "speaker": "Order Verification Worker",
            "worker_id": "order_check",
            "text": format_voice_response(llm_response, lang=lang),
            "audio_filler": get_audio_filler("orders", lang=lang),
            "tool_used": "orders",
            "action_taken": "get_orders_by_customer",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 115
        }

    # WORKFLOW 2: Sales Lead Qualification & Booking (wf_sales / proj_sales_01)
    if wf_id in ["wf_sales", "proj_sales_01"] or any(k in text_lower for k in ["sales", "demo", "lead", "budget", "seats", "pricing"]):
        lead = LEADS_DB.get(customer_id, {})
        sales_context = (
            f"Customer Name: {customer_name}.\n"
            f"Lead Company: {lead.get('company', 'Tech Solutions')}.\n"
            f"Seats requested: {lead.get('seats', 50)} seats.\n"
            f"Monthly Budget: {lead.get('budget', '1.5 Lakhs/mo')}.\n"
            f"Demo Schedule: {lead.get('demo_time', 'Oct 3, 2026 at 3:00 PM IST')}.\n"
            f"Assigned Representative: {lead.get('rep', 'Senior Account Exec Rahul')}."
        )

        llm_response = query_real_nvidia_llm(
            user_input=text_input,
            system_prompt="You are a B2B SaaS sales lead qualification executive scheduling product demos.",
            context=sales_context,
            lang=lang
        )

        if not llm_response:
            llm_response = f"Your product demo for {lead.get('company', 'Tech Solutions')} is confirmed for {lead.get('demo_time')} with representative {lead.get('rep')}."

        return {
            "turn_index": 2,
            "speaker": "Demo Scheduler",
            "worker_id": "scheduler",
            "text": format_voice_response(llm_response, lang=lang),
            "audio_filler": get_audio_filler("cal", lang=lang),
            "tool_used": "cal",
            "action_taken": "get_lead_demo_schedule",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 120
        }

    # WORKFLOW 3: Patient OPD Appointment Booking (wf_booking / proj_booking_01)
    if wf_id in ["wf_booking", "proj_booking_01"] or any(k in text_lower for k in ["appointment", "doctor", "clinic", "opd", "consultation", "hospital", "raman", "anitha"]):
        apt = APPOINTMENTS_DB.get(customer_id, {})
        apt_context = (
            f"Patient Name: {customer_name}.\n"
            f"Appointment ID: {apt.get('appointment_id', 'APT-7721')}.\n"
            f"Doctor: {apt.get('doctor', 'Dr. Anitha (Cardiology Specialist)')}.\n"
            f"Clinic: {apt.get('clinic', 'Apollo Clinic, T-Nagar')}.\n"
            f"Scheduled Slot: {apt.get('slot_time', 'Oct 4, 2026 at 10:30 AM')}.\n"
            f"Consultation Fee: {apt.get('fee', '₹800')}.\n"
            f"Status: {apt.get('status', 'confirmed')}."
        )

        llm_response = query_real_nvidia_llm(
            user_input=text_input,
            system_prompt="You are a medical OPD clinic receptionist managing doctor appointment bookings.",
            context=apt_context,
            lang=lang
        )

        if not llm_response:
            llm_response = f"Your appointment with {apt.get('doctor')} at {apt.get('clinic')} is confirmed for {apt.get('slot_time')}."

        return {
            "turn_index": 2,
            "speaker": "Booking Worker",
            "worker_id": "booking_worker",
            "text": format_voice_response(llm_response, lang=lang),
            "audio_filler": get_audio_filler("cal", lang=lang),
            "tool_used": "cal",
            "action_taken": "get_appointment_details",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 110
        }

    # WORKFLOW 4: Recruitment Screening (wf_hr / proj_interviewer_02)
    if wf_id in ["wf_hr", "proj_interviewer_02"] or any(k in text_lower for k in ["resume", "job", "interview", "candidate", "role", "score", "screening"]):
        cand = CANDIDATES_DB.get(customer_id, {})
        hr_context = (
            f"Candidate Name: {customer_name}.\n"
            f"Candidate ID: {cand.get('candidate_id', 'CAND-901')}.\n"
            f"Applied Role: {cand.get('role', 'Senior Full Stack Engineer')}.\n"
            f"Tech Stack: {cand.get('tech_stack', 'Python, React, FastAPI, MongoDB')}.\n"
            f"ATS Screening Score: {cand.get('screening_score', 92)}%.\n"
            f"Status: {cand.get('status', 'tech_screen_passed')}.\n"
            f"Interview Time: {cand.get('interview_time', 'Oct 5, 2026 at 11:00 AM')}."
        )

        llm_response = query_real_nvidia_llm(
            user_input=text_input,
            system_prompt="You are an AI HR technical interviewer conducting candidate screening.",
            context=hr_context,
            lang=lang
        )

        if not llm_response:
            llm_response = f"Your application for {cand.get('role')} has passed technical screening with a score of {cand.get('screening_score')}%. Your interview is scheduled for {cand.get('interview_time')}."

        return {
            "turn_index": 2,
            "speaker": "Resume Screener Worker",
            "worker_id": "screener",
            "text": format_voice_response(llm_response, lang=lang),
            "audio_filler": get_audio_filler("ats", lang=lang),
            "tool_used": "ats",
            "action_taken": "get_candidate_status",
            "idempotency_key": idempotency_key,
            "approval_required": False,
            "escalated": False,
            "latency_ms": 125
        }

    # General Knowledge / RAG Query Node
    rag_context = (
        f"Knowledge Base Docs:\n"
        f"- Shipping SLA: Standard delivery takes 3 to 5 business days.\n"
        f"- Return Policy: Return and refund requests accepted within 7 days of delivery.\n"
        f"- Refund Limit: Instant auto-refund threshold is ₹2,000.\n"
        f"User Query: {text_input}"
    )

    llm_response = query_real_nvidia_llm(
        user_input=text_input,
        system_prompt="You are an AI customer support assistant answering general policy and shipping queries.",
        context=rag_context,
        lang=lang
    )

    if not llm_response:
        llm_response = f"Standard delivery takes 3 to 5 business days, and returns are accepted within 7 days of delivery."

    return {
        "turn_index": 1,
        "speaker": "Query Worker",
        "worker_id": "query_worker",
        "text": format_voice_response(llm_response, lang=lang),
        "audio_filler": get_audio_filler("default", lang=lang),
        "tool_used": None,
        "action_taken": "kb_similarity_search",
        "idempotency_key": idempotency_key,
        "approval_required": False,
        "escalated": False,
        "latency_ms": 100
    }


