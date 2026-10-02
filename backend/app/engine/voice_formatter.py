import re

def strip_markdown(text: str) -> str:
    """Removes markdown syntax like bold, italics, headers, backticks, bullet points."""
    text = re.sub(r'[\*\#\_`~]', '', text)
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n+', ' ', text)
    return text.strip()

def format_currency_for_voice(text: str, lang: str = "en") -> str:
    """Converts ₹1499 / Rs 1499 into spoken words like '14 hundred and 99 rupees' or 'Rs 1,499'."""
    def replace_rupees(match):
        val = int(match.group(1))
        if val >= 1000 and val < 10000 and val % 100 != 0:
            hundreds = val // 100
            remainder = val % 100
            if lang == "ta":
                return f"{val} rubai"
            elif lang == "hi":
                return f"{val} rupaye"
            return f"{hundreds} hundred and {remainder} rupees"
        elif lang == "ta":
            return f"{val} rubai"
        elif lang == "hi":
            return f"{val} rupaye"
        return f"{val:,} rupees"

    text = re.sub(r'(?:₹|Rs\.?|INR)\s*(\d+)', replace_rupees, text, flags=re.IGNORECASE)
    return text

def chunk_digits_for_voice(text: str) -> str:
    """Chunks 4-digit order numbers like 4821 to '4 8 2 1' for clear phonetic speech synthesis."""
    def digit_replacer(match):
        num_str = match.group(1)
        if len(num_str) == 4 and not num_str.startswith("202"):  # avoid years like 2026
            return " ".join(list(num_str))
        return num_str
    
    return re.sub(r'\b(\d{4})\b', digit_replacer, text)

def format_voice_response(raw_text: str, lang: str = "en", max_sentences: int = 2) -> str:
    """
    Cleans raw LLM text into voice-first output:
    1. Removes markdown symbols.
    2. Formats currency values phonetically.
    3. Chunks order numbers for clear digit STT/TTS.
    4. Limits length to maximum 2 short sentences per turn.
    """
    clean = strip_markdown(raw_text)
    clean = format_currency_for_voice(clean, lang=lang)
    clean = chunk_digits_for_voice(clean)

    # Split into sentences
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', clean) if s.strip()]
    if len(sentences) > max_sentences:
        clean = " ".join(sentences[:max_sentences])
    
    return clean
