from typing import Dict, List
from app.models.schemas import WorkforceSpec, EscalationItem
from app.data.templates import PRESET_TEMPLATES

# In-Memory DB Stores
WORKFORCES_DB: Dict[str, WorkforceSpec] = {**PRESET_TEMPLATES}

CONNECTED_TOOLS: Dict[str, bool] = {
    "orders": True,
    "pay": True,
    "helpdesk": True,
    "crm": True,
    "cal": True,
    "wa": True,
    "ats": True
}

ESCALATION_QUEUE: List[EscalationItem] = [
    EscalationItem(
        id="ESC-9081",
        session_id="sess_8912",
        workforce_id="wf_support",
        customer_name="Kavitha (Chennai)",
        language="ta (Tamil)",
        reason="Refund amount (₹2,499) exceeds auto-approval limit (₹2,000)",
        status="pending",
        timestamp="10 mins ago",
        transcript=[
            {"speaker": "Customer", "text": "En saree torn aagi vandhuchu, order 4821."},
            {"speaker": "Order Verification Worker", "text": "Order 4821 verified: Kanjivaram Silk Saree delivered 2 days ago."},
            {"speaker": "Customer", "text": "Photo attached. Need full refund ₹2,499."},
            {"speaker": "Refund Worker", "text": "Damage verified. Refund ₹2,499 exceeds threshold ₹2,000. Escalating to supervisor."}
        ],
        task_state={"order_id": "4821", "amount": 2499, "item": "Kanjivaram Silk Saree", "status": "approval_required"},
        image_attached="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
        suggested_action="Approve manual refund ₹2,499 or offer instant replacement voucher."
    ),
    EscalationItem(
        id="ESC-9082",
        session_id="sess_8915",
        workforce_id="wf_sales",
        customer_name="Rajesh Sharma (Delhi)",
        language="hi (Hinglish)",
        reason="Enterprise custom pricing request (> 100 seats)",
        status="pending",
        timestamp="25 mins ago",
        transcript=[
            {"speaker": "Customer", "text": "Mujhe 150 users ke liye custom CRM integration chahiye with SLA guarantees."},
            {"speaker": "Lead Qualifier", "text": "Scored as High Value Enterprise deal (> 100 seats). Routing to Senior Account Exec."}
        ],
        task_state={"seats": 150, "budget": "2.5 Lakhs/mo", "crm": "Custom Salesforce"},
        suggested_action="Schedule 1-on-1 enterprise discovery call with Account Executive."
    )
]

KNOWLEDGE_DOCS = [
    {"id": "kb_1", "name": "shipping_policy.pdf", "size": "142 KB", "chunks": 18, "status": "Indexed", "org_id": "org_sme_001"},
    {"id": "kb_2", "name": "return_refund_sop_v2.docx", "size": "89 KB", "chunks": 12, "status": "Indexed", "org_id": "org_sme_001"},
    {"id": "kb_3", "name": "product_catalog_2026.csv", "size": "512 KB", "chunks": 45, "status": "Indexed", "org_id": "org_sme_001"}
]
