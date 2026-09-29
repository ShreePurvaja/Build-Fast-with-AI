import time
from fastapi import APIRouter
from app.models.schemas import IntakeRequest, IntakeResponse
from app.data.templates import PRESET_TEMPLATES
from app.data.database import WORKFORCES_DB

router = APIRouter(prefix="/api/intake", tags=["Intake"])

@router.post("", response_model=IntakeResponse)
def generate_workforce_from_intake(req: IntakeRequest):
    prompt_lower = req.prompt.lower()
    
    if any(k in prompt_lower for k in ["refund", "return", "order", "support", "complaint", "delivery", "saree"]):
        template_id = "support"
    elif any(k in prompt_lower for k in ["lead", "sales", "demo", "crm", "prospect", "enquiry"]):
        template_id = "sales"
    elif any(k in prompt_lower for k in ["appointment", "booking", "clinic", "doctor", "salon", "patient"]):
        template_id = "booking"
    elif any(k in prompt_lower for k in ["resume", "hiring", "interview", "candidate", "job", "hr"]):
        template_id = "hr"
    else:
        template_id = "support"

    base_spec = PRESET_TEMPLATES[template_id]
    new_id = f"wf_gen_{int(time.time())}"
    generated_spec = base_spec.model_copy(deep=True)
    generated_spec.id = new_id
    generated_spec.workforce = f"AI Workforce: {req.prompt[:35]}..." if len(req.prompt) > 35 else f"AI Workforce: {req.prompt}"
    generated_spec.published = False
    generated_spec.voice_link = f"https://workforce.app/talk/{new_id}"

    clarifying_questions = [
        "What is the maximum instant refund amount without human supervisor confirmation? (Default set to ₹2,000)",
        "Which regional Indic languages should be enabled for voice callers? (Default set to Tamil, Hindi, English)",
        "Should unconfirmed order checks fall back to human queue during off-hours?"
    ]

    assumptions = [
        "First target is Indian SMEs starting with order and customer support workflows.",
        "Voice link is prioritized for immediate web testing with Indic speech streaming.",
        "Write operations (like payment refund) require explicit customer confirmation."
    ]

    WORKFORCES_DB[new_id] = generated_spec

    return IntakeResponse(
        clarifying_questions=clarifying_questions,
        suggested_template_id=template_id,
        generated_spec=generated_spec,
        assumptions=assumptions
    )
