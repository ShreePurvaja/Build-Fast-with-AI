from typing import Dict, Any, Optional

class SlotStore:
    """Structured session memory store tracking slot values, confidence, and read-back confirmations."""
    
    def __init__(self):
        self.slots: Dict[str, Dict[str, Any]] = {}

    def set_slot(self, key: str, value: Any, confidence: float = 1.0, confirmed: bool = False):
        self.slots[key] = {
            "value": value,
            "confidence": confidence,
            "confirmed": confirmed
        }

    def get_slot_value(self, key: str) -> Optional[Any]:
        slot = self.slots.get(key)
        return slot["value"] if slot else None

    def is_confirmed(self, key: str) -> bool:
        slot = self.slots.get(key)
        return bool(slot and slot.get("confirmed"))

    def mark_confirmed(self, key: str):
        if key in self.slots:
            self.slots[key]["confirmed"] = True

    def get_readback_prompt(self, key: str, lang: str = "en") -> Optional[str]:
        """Generates clear spoken read-back prompt for unconfirmed key slots."""
        val = self.get_slot_value(key)
        if val is None or self.is_confirmed(key):
            return None
        
        if key == "order_id":
            num_spaced = " ".join(list(str(val)))
            if lang == "ta":
                return f"Order number {num_spaced} aama-va?"
            elif lang == "hi":
                return f"Kya aapka order number {num_spaced} hai?"
            return f"Order number {num_spaced}, is that correct?"

        elif key == "refund_amount":
            if lang == "ta":
                return f"Rs {val} refund panna confirm pannalama?"
            elif lang == "hi":
                return f"Kya aap ₹{val} refund confirm karte hain?"
            return f"Do you confirm refunding {val:,} rupees?"
            
        return f"Do you confirm {key} is {val}?"

    def to_dict(self) -> Dict[str, Any]:
        return {k: v["value"] for k, v in self.slots.items()}
