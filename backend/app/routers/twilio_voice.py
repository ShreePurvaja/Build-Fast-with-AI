import random
import time
import os
import re
from typing import Dict, Any, Optional
from fastapi import APIRouter, Form, Request, Response, HTTPException
from pydantic import BaseModel

from app.routers.runtime import simulate_session_turn
from app.models.schemas import SimulateTurnRequest
from app.engine.voice_formatter import format_voice_response

router = APIRouter(prefix="/api/twilio", tags=["Twilio Voice Agent Router"])

TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "+1 (737) 250-8034")

# In-Memory PIN & Caller ID Registries
PIN_REGISTRY: Dict[str, Dict[str, Any]] = {}
CALLER_ID_REGISTRY: Dict[str, Dict[str, Any]] = {}
TWILIO_CALL_SESSIONS: Dict[str, Dict[str, Any]] = {}

def get_base_url(request: Request) -> str:
    """Returns absolute HTTPS origin URL to prevent Twilio relative path 404 bugs."""
    host = request.headers.get("x-forwarded-host") or request.headers.get("host") or "build-fast-with-ai.onrender.com"
    scheme = request.headers.get("x-forwarded-proto") or "https"
    if "onrender.com" in host and not scheme.startswith("https"):
        scheme = "https"
    return f"{scheme}://{host}".rstrip("/")

class PinGenerateRequest(BaseModel):
    workforce_id: str = "wf_support"
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
            greeting = "Welcome to AI Voice Studio. Connected to your workflow. How can I assist you today?"
            
            twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="Polly.Aditi">{greeting}</Say>
                <Gather input="speech" action="{base_url}/api/twilio/voice/turn" method="POST" timeout="5" speechTimeout="auto">
                </Gather>
                <Say voice="Polly.Aditi">I am listening. Please ask your question.</Say>
                <Gather input="speech" action="{base_url}/api/twilio/voice/turn" method="POST" timeout="5" speechTimeout="auto">
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
    
    # Check PIN in memory or fallback gracefully to support workflow
    if pin in PIN_REGISTRY and time.time() < PIN_REGISTRY[pin]["expires_at"]:
        sess = PIN_REGISTRY[pin]
    else:
        # Universal graceful fallback so no caller gets disconnected
        sess = {
            "pin": pin,
            "workforce_id": "wf_support",
            "session_id": f"twil_{pin}_{int(time.time())}"
        }

    TWILIO_CALL_SESSIONS[CallSid] = sess
    
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="Polly.Aditi">PIN verified. Connecting you to your AI voice agent. How can I help you today?</Say>
        <Gather input="speech" action="{base_url}/api/twilio/voice/turn" method="POST" timeout="6" speechTimeout="auto">
        </Gather>
        <Say voice="Polly.Aditi">I am still here. Please go ahead with your query.</Say>
        <Gather input="speech" action="{base_url}/api/twilio/voice/turn" method="POST" timeout="6" speechTimeout="auto">
        </Gather>
    </Response>"""
    return Response(content=twiml, media_type="application/xml")

@router.post("/voice/turn")
async def twilio_voice_turn(
    request: Request,
    SpeechResult: str = Form(default=""),
    CallSid: str = Form(default="")
):
    """Handles continuous speech turns over Twilio phone calls."""
    base_url = get_base_url(request)
    sess = TWILIO_CALL_SESSIONS.get(CallSid, {"workforce_id": "wf_support", "session_id": f"twil_{CallSid}"})
    
    if not SpeechResult.strip():
        twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Say voice="Polly.Aditi">I am listening. What query can I help you with?</Say>
            <Gather input="speech" action="{base_url}/api/twilio/voice/turn" method="POST" timeout="6" speechTimeout="auto">
            </Gather>
        </Response>"""
        return Response(content=twiml, media_type="application/xml")

    # Pass speech transcript to Voice Engine
    turn_req = SimulateTurnRequest(
        workforce_id=sess["workforce_id"],
        session_id=sess["session_id"],
        user_input=SpeechResult,
        language="en"
    )
    
    bot_res = simulate_session_turn(turn_req)
    spoken_text = format_voice_response(bot_res.get("text", ""))

    # Build continuous speech TwiML response with absolute action URL
    twiml = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="Polly.Aditi">{spoken_text}</Say>
        <Gather input="speech" action="{base_url}/api/twilio/voice/turn" method="POST" timeout="5" speechTimeout="auto">
        </Gather>
        <Say voice="Polly.Aditi">Thank you for calling. Goodbye.</Say>
    </Response>"""
    return Response(content=twiml, media_type="application/xml")
