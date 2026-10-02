from typing import Dict

FILLER_PHRASES: Dict[str, Dict[str, str]] = {
    "orders": {
        "en": "One moment, checking our order database for you...",
        "ta": "Oru nimidam, unga order details check panni solgiren...",
        "hi": "Ek minute, aapka order record check kar raha hoon..."
    },
    "pay": {
        "en": "Processing that payment refund with our gateway now...",
        "ta": "Refund details process aagiduchu, confirm pannugiren...",
        "hi": "Refund process kiya jaa raha hai, kripya prateeksha karein..."
    },
    "cal": {
        "en": "Checking available calendar slots for you...",
        "ta": "Available calendar time slots check pannuren...",
        "hi": "Calendar slots check kar raha hoon..."
    },
    "crm": {
        "en": "Updating your lead file in our system...",
        "ta": "Unga details update panni konda irukiren...",
        "hi": "Aapki jankari system me darj kar raha hoon..."
    },
    "ats": {
        "en": "Parsing your resume against role requirements...",
        "ta": "Unga resume-ah role requirement kooda check pannuren...",
        "hi": "Aapka resume requirement ke saath match kar raha hoon..."
    },
    "helpdesk": {
        "en": "Creating a supervisor handoff ticket for you...",
        "ta": "Human supervisor-kku ticket create panni pass pannuren...",
        "hi": "Supervisor ke liye ticket banaya jaa raha hai..."
    },
    "default": {
        "en": "Let me look that up for you...",
        "ta": "Sari, parthu solgiren...",
        "hi": "Thoda intezar kijiye, dekh raha hoon..."
    }
}

def get_audio_filler(tool_name: str, lang: str = "en") -> str:
    """Returns a natural spoken audio filler phrase to eliminate dead silence during tool API calls."""
    tool_fillers = FILLER_PHRASES.get(tool_name, FILLER_PHRASES["default"])
    return tool_fillers.get(lang, tool_fillers.get("en", "Let me check that for you..."))
