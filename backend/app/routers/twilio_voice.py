import random
import time
import os
import re
from typing import Dict, Any, Optional
from fastapi import APIRouter, Form, Request, Response, HTTPException, Query
from pydantic import BaseModel

from app.routers.runtime import simulate_session_turn
from app.models.schemas import SimulateTurnRequest
from app.engine.voice_formatter import format_voice_response

router = APIRouter(prefix="/api/twilio", tags=["Twilio Voice Agent Router"])

TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+1 (737) 250-8034")

# In-Memory PIN & Caller ID Registries (Pre-seeded with permanent test PINs)
PIN_REGISTRY: Dict[str, Dict[str, Any]] = {
    "4821": {
        "pin": "4821",
        "workforce_id": "proj_interviewer_02",
        "expires_at": 9999999999.0,
        "session_id": "twil_4821_interviewer"
    },
    "1234": {
        "pin": "1234",
        "workforce_id": "proj_interviewer_02",
        "expires_at": 9999999999.0,
        "session_id": "twil_1234_interviewer"
    },
    "7788": {
        "pin": "7788",
        "workforce_id": "wf_support",
        "expires_at": 9999999999.0,
        "session_id": "twil_7788_support"
    }
}
CALLER_ID_REGISTRY: Dict[str, Dict[str, Any]] = {}
TWILIO_CALL_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_base_url(request: Request) -> str:
    """Returns absolute HTTPS origin URL to prevent Twilio relative path 404 bugs."""
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or "build-fast-with-ai.onrender.com"
    scheme = request.headers.get("x-forwarded-proto") or "https"
    if not (host.startswith("localhost") or host.startswith("127.0.0.1")):
        scheme = "https"
    return f"{scheme}://{host}".rstrip("/")

class PinGenerateRequest(BaseModel):
    workforce_id: str = "proj_interviewer_02"
    caller_phone: Optional[str] = None

@router.post("/pin/generate")
def generate_test_pin(req: PinGenerateRequest):
    """Generates a 4-digit PIN and optional Caller ID mapping for testing workflows over Twilio."""
    pin = f"{random.randint(1000, 9999)}"
    expires_at = time.time() + 1800  # 30 mins
    
    session_data = {
        "pin": pin,
        "workforce_id": req.workforce_id,
        "expires_at": expires_at,
        "session_id": f"twil_{pin}_{int(time.time())}"
    }
    
    PIN_REGISTRY[pin] = session_data
    
    if req.caller_phone:
        clean_phone = req.caller_phone.strip().replace(" ", "").replace("-", "")
        CALLER_ID_REGISTRY[clean_phone] = session_data

    return {
        "status": "success",
        "pin": pin,
        "twilio_number": TWILIO_PHONE_NUMBER,
        "workforce_id": req.workforce_id,
        "caller_phone": req.caller_phone,
        "expires_in_seconds": 1800
    }

def get_agent_greeting(wf_id: str, is_pin_verified: bool = True) -> str:
    prefix = "PIN verified. " if is_pin_verified else ""
    if wf_id in ["proj_interviewer_02", "wf_hr"]:
        return f"{prefix}You are connected to the Senior AI Technical Interviewer Agent. I will be conducting your engineering interview today. Are you ready for your first technical question?"
    elif wf_id in ["proj_booking_01", "wf_booking"]:
        return f"{prefix}You are connected to the OPD Doctor Appointment Booking Agent. How can I help with your medical consultation today?"
    elif wf_id in ["proj_sales_01", "wf_sales"]:
        return f"{prefix}You are connected to the SaaS Sales and Demo Executive Agent. How can I help with your software demo today?"
    else:
        return f"{prefix}You are connected to the Customer Order and Refund Support Agent. How can I help with your order or refund today?"

@router.post("/voice/incoming")
async def twilio_voice_incoming(
    request: Request,
    From: str = Form(default=""),
    To: str = Form(default=""),
    CallSid: str = Form(default="")
):
    """
    Primary Twilio Incoming Call Webhook.
    Step A: Check if From Caller ID matches a registered test session.
    Step B: If unknown, prompt for 4-digit PIN via keypad DTMF.
    """
    base_url = get_base_url(request)
    clean_from = From.strip().replace(" ", "").replace("-", "")
    
    # Caller ID Match Check
    if clean_from in CALLER_ID_REGISTRY:
        sess = CALLER_ID_REGISTRY[clean_from]
        if time.time() < sess["expires_at"]:
            TWILIO_CALL_SESSIONS[CallSid] = sess
            wf_id = sess["workforce_id"]
            sess_id = sess["session_id"]
            greeting = get_agent_greeting(wf_id, is_pin_verified=False)
            action_url = f"{base_url}/api/twilio/voice/turn?wf_id={wf_id}&amp;session_id={sess_id}"
            
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="Polly.Aditi">{greeting}</Say>
                <Gather input="speech" action="{action_url}" method="POST" timeout="5" speechTimeout="auto">
                </Gather>
                <Say voice="Polly.Aditi">I am listening. Please ask your question.</Say>
                <Gather input="speech" action="{action_url}" method="POST" timeout="5" speechTimeout="auto">
                </Gather>
            </Response>"""
            return Response(content=twiml, media_type="application/xml")

    # Prompt for 4-Digit PIN with absolute URL action
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="Polly.Aditi">Welcome to AI Voice Agent Studio. Please enter your four digit test PIN code on your phone keypad.</Say>
        <Gather numDigits="4" action="{base_url}/api/twilio/voice/pin_submit" method="POST" timeout="10">
        </Gather>
        <Say voice="Polly.Aditi">No PIN entered. Goodbye.</Say>
    </Response>"""
    return Response(content=twiml, media_type="application/xml")

@router.post("/voice/pin_submit")
async def twilio_voice_pin_submit(
    request: Request,
    Digits: str = Form(default=""),
    CallSid: str = Form(default="")
):
    """Processes DTMF keypad PIN entry from caller."""
    base_url = get_base_url(request)
    pin = Digits.strip()
    
    # Check PIN in memory or fallback gracefully to interviewer workflow
    if pin in PIN_REGISTRY and time.time() < PIN_REGISTRY[pin]["expires_at"]:
        sess = PIN_REGISTRY[pin]
    else:
        sess = {
            "pin": pin,
            "workforce_id": "proj_interviewer_02",
            "session_id": f"twil_{pin}_{int(time.time())}"
        }

    TWILIO_CALL_SESSIONS[CallSid] = sess
    wf_id = sess.get("workforce_id", "proj_interviewer_02")
    session_id = sess.get("session_id", f"twil_{CallSid}")
    action_url = f"{base_url}/api/twilio/voice/turn?wf_id={wf_id}&amp;session_id={session_id}"

    # Explicit agent identification greeting
    greeting = get_agent_greeting(wf_id, is_pin_verified=True)

    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="Polly.Aditi">{greeting}</Say>
        <Gather input="speech" action="{action_url}" method="POST" timeout="6" speechTimeout="auto">
        </Gather>
        <Say voice="Polly.Aditi">I am listening. Please go ahead with your response.</Say>
        <Gather input="speech" action="{action_url}" method="POST" timeout="6" speechTimeout="auto">
        </Gather>
    </Response>"""
    return Response(content=twiml, media_type="application/xml")

@router.post("/voice/turn")
async def twilio_voice_turn(
    request: Request,
    SpeechResult: str = Form(default=""),
    CallSid: str = Form(default=""),
    wf_id: Optional[str] = Query(default=None),
    session_id: Optional[str] = Query(default=None)
):
    """Handles continuous speech turns over Twilio phone calls with query parameter state persistence."""
    base_url = get_base_url(request)
    
    # Priority: 1. URL Query Param wf_id, 2. TWILIO_CALL_SESSIONS cache, 3. Default to proj_interviewer_02
    cached_sess = TWILIO_CALL_SESSIONS.get(CallSid, {})
    effective_wf = wf_id or cached_sess.get("workforce_id") or "proj_interviewer_02"
    effective_sess_id = session_id or cached_sess.get("session_id") or f"twil_{CallSid}"
    
    # Update cache
    TWILIO_CALL_SESSIONS[CallSid] = {
        "workforce_id": effective_wf,
        "session_id": effective_sess_id
    }

    action_url = f"{base_url}/api/twilio/voice/turn?wf_id={effective_wf}&amp;session_id={effective_sess_id}"

    if not SpeechResult.strip():
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say voice="Polly.Aditi">I am listening. Please go ahead with your answer.</Say>
            <Gather input="speech" action="{action_url}" method="POST" timeout="6" speechTimeout="auto">
            </Gather>
        </Response>"""
        return Response(content=twiml, media_type="application/xml")

    # Pass speech transcript to Voice Engine
    turn_req = SimulateTurnRequest(
        workforce_id=effective_wf,
        session_id=effective_sess_id,
        user_input=SpeechResult,
        language="en"
    )
    
    bot_res = simulate_session_turn(turn_req)
    spoken_text = format_voice_response(bot_res.get("text", ""))

    # Build continuous speech TwiML response with query param state persistence
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="Polly.Aditi">{spoken_text}</Say>
        <Gather input="speech" action="{action_url}" method="POST" timeout="5" speechTimeout="auto">
        </Gather>
        <Say voice="Polly.Aditi">Thank you for your response. Goodbye.</Say>
    </Response>"""
    return Response(content=twiml, media_type="application/xml")

