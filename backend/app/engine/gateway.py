import hashlib
import uuid
from typing import Dict, Any, Tuple
from app.data.database import ORDERS_DB, LEADS_DB, APPOINTMENTS_DB, CANDIDATES_DB

EXECUTED_IDEMPOTENCY_KEYS: Dict[str, Dict[str, Any]] = {}

def generate_idempotency_key(tenant_id: str, tool_name: str, args: Dict[str, Any]) -> str:
    """Generates a deterministic SHA256 key for tool calls to prevent duplicate execution."""
    raw = f"{tenant_id}|{tool_name}|" + "|".join(f"{k}={args[k]}" for k in sorted(args.keys()))
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def execute_tool_gateway(
    tenant_id: str,
    customer_id: str,
    tool_name: str,
    args: Dict[str, Any],
    confirmed_by_user: bool = False,
    auto_refund_limit: int = 2000
) -> Tuple[bool, Dict[str, Any]]:
    """
    Tool Gateway enforcing:
    1. Resource Ownership Check (Customer ID)
    2. Exact Item Price DB Lookup (Never trust LLM text for refund amount)
    3. Idempotency Key Replay Protection
    4. Business Threshold Escalation Gate (amount > limit)
    5. User Read-Back Confirmation Gate
    """
    idempotency_key = generate_idempotency_key(tenant_id, tool_name, args)
    
    # Check Idempotency Replay
    if idempotency_key in EXECUTED_IDEMPOTENCY_KEYS:
        return True, {
            "status": "replayed",
            "idempotency_key": idempotency_key,
            "result": EXECUTED_IDEMPOTENCY_KEYS[idempotency_key]
        }

    # Support / Refund Tool Rules
    if tool_name == "pay" or args.get("action") == "create_refund":
        order_id = str(args.get("order_id", "ORD-8821"))
        order_record = ORDERS_DB.get(order_id)
        
        if not order_record:
            return False, {"error": "order_not_found", "message": f"Order {order_id} not found in database."}
            
        # Auth Check
        if order_record["customer_id"] != customer_id:
            return False, {"error": "unauthorized", "message": f"Access Denied: Order {order_id} does not belong to {customer_id}."}

        exact_amount = order_record["price"]
        args["amount"] = exact_amount
        args["item_name"] = order_record["item_name"]

        # Check Auto-Approval Threshold Rule (max 2000 INR)
        if exact_amount > auto_refund_limit:
            return False, {
                "action": "escalate",
                "reason": "amount_exceeds_auto_limit",
                "amount": exact_amount,
                "limit": auto_refund_limit,
                "message": f"Refund amount ₹{exact_amount} for {order_record['item_name']} exceeds auto-approval limit of ₹{auto_refund_limit}."
            }

        # Read-Back Confirmation Gate
        if not confirmed_by_user:
            return False, {
                "action": "need_confirmation",
                "idempotency_key": idempotency_key,
                "amount": exact_amount,
                "item_name": order_record["item_name"],
                "message": f"Please confirm refund of ₹{exact_amount} for {order_record['item_name']}."
            }

        # Execute Refund
        refund_ref = f"RF-{uuid.uuid4().hex[:6].upper()}"
        res_payload = {
            "refund_ref": refund_ref,
            "amount": exact_amount,
            "item": order_record["item_name"],
            "status": "processed",
            "estimated_days": "3-5 business days"
        }
        EXECUTED_IDEMPOTENCY_KEYS[idempotency_key] = res_payload
        return True, res_payload

    # Default tool pass-through
    return True, {"status": "success", "tool": tool_name, "args": args}
