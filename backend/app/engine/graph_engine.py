import operator
from typing import Dict, Any, List, Optional, Tuple

OPS = {
    ">": operator.gt,
    ">=": operator.ge,
    "<": operator.lt,
    "<=": operator.le,
    "==": operator.eq,
    "!=": operator.ne
}

EMERGENCY_KEYWORDS = [
    "chest pain", "breathing difficulty", "severe bleeding", "unconscious",
    "heart attack", "stroke", "emergency", "ambulance", "dying"
]

def eval_rule(rule: Dict[str, Any], slots: Dict[str, Any], counters: Dict[str, int], tenant_config: Dict[str, Any]) -> bool:
    """Evaluates declarative graph edge conditions in Python code."""
    if "any" in rule:
        return any(eval_rule(r, slots, counters, tenant_config) for r in rule["any"])
    if "all" in rule:
        return all(eval_rule(r, slots, counters, tenant_config) for r in rule["all"])

    left = slots.get(rule["slot"]) if "slot" in rule else counters.get(rule.get("counter", ""), 0)
    right = rule["value"]
    
    if isinstance(right, str) and right.startswith("$tenant."):
        right = tenant_config.get(right[8:])
        
    return left is not None and OPS[rule["op"]](left, right)

def detect_emergency(text: str) -> bool:
    """Triage check for medical emergencies in voice streams."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in EMERGENCY_KEYWORDS)

class GraphEngine:
    def __init__(self, spec: Dict[str, Any]):
        self.spec = spec
        self.entry = spec.get("entry", "manager")
        self.fallback = spec.get("fallback_node", "escalation")
        self.max_hops = spec.get("limits", {}).get("max_hops", 4)

    def route_turn(
        self,
        current_node: str,
        user_input: str,
        slots: Dict[str, Any],
        hop_count: int,
        tenant_config: Dict[str, Any]
    ) -> Tuple[str, bool, Optional[str]]:
        """
        State Graph Router:
        1. Checks emergency triage keywords (immediate override).
        2. Enforces hop limit guardrail.
        3. Evaluates graph edge predicates.
        """
        # 1. Emergency Check (Highest Priority)
        if detect_emergency(user_input):
            return "escalation", True, "EMERGENCY: User expressed urgent medical emergency. Advised to call emergency services 108/112 immediately."

        # 2. Max Hops Guardrail
        if hop_count >= self.max_hops:
            return self.fallback, True, "Hop limit exceeded max hop threshold."

        # 3. Intent & Edge Rule Evaluation
        text_lower = user_input.lower()
        if "human" in text_lower or "agent" in text_lower or "supervisor" in text_lower:
            return self.fallback, True, "User explicitly requested human supervisor."

        if current_node == "manager":
            if any(k in text_lower for k in ["order", "status", "delivery"]):
                return "order_check", False, None
            elif any(k in text_lower for k in ["refund", "damaged", "return"]):
                return "refund", False, None
            elif any(k in text_lower for k in ["book", "appointment", "doctor"]):
                return "booking_worker", False, None
            elif any(k in text_lower for k in ["budget", "lead", "demo"]):
                return "qualifier", False, None
            elif any(k in text_lower for k in ["resume", "job", "interview"]):
                return "screener", False, None

        return current_node, False, None
