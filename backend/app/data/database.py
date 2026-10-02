from typing import Dict, List, Any
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

# Domain Tables: Support (Orders)
ORDERS_DB: Dict[str, Dict[str, Any]] = {
    "ORD-8821": {
        "id": "ORD-8821",
        "customer_id": "cust_gowtham",
        "customer_name": "Gowtham D",
        "item_name": "Kanjivaram Silk Saree",
        "price": 1499,
        "status": "delivered",
        "delivery_date": "Oct 1, 2026",
        "courier": "Express Courier",
        "can_refund": True
    },
    "ORD-8822": {
        "id": "ORD-8822",
        "customer_id": "cust_gowtham",
        "customer_name": "Gowtham D",
        "item_name": "Wireless Noise-Canceling Earbuds",
        "price": 2999,
        "status": "out_for_delivery",
        "expected_delivery": "Today by 4:00 PM",
        "courier": "BlueDart Express",
        "can_refund": False
    },
    "ORD-8823": {
        "id": "ORD-8823",
        "customer_id": "cust_gowtham",
        "customer_name": "Gowtham D",
        "item_name": "Cotton Formal Shirt (Blue)",
        "price": 899,
        "status": "processing",
        "expected_delivery": "Oct 4, 2026",
        "courier": "Delhivery",
        "can_refund": False
    }
}

# Domain Tables: Sales (Leads)
LEADS_DB: Dict[str, Dict[str, Any]] = {
    "cust_gowtham": {
        "customer_id": "cust_gowtham",
        "company": "Gowtham Tech Solutions",
        "seats": 50,
        "budget": "1.5 Lakhs/mo",
        "stage": "demo_scheduled",
        "demo_time": "Oct 3, 2026 at 3:00 PM IST",
        "rep": "Senior Account Exec (Rahul)"
    }
}

# Domain Tables: Booking (Appointments)
APPOINTMENTS_DB: Dict[str, Dict[str, Any]] = {
    "cust_gowtham": {
        "appointment_id": "APT-7721",
        "customer_name": "Gowtham D",
        "doctor": "Dr. Anitha (Cardiology Specialist)",
        "clinic": "Apollo Clinic, T-Nagar",
        "slot_time": "Oct 4, 2026 at 10:30 AM",
        "fee": "₹800",
        "status": "confirmed"
    }
}

# Domain Tables: HR (Recruitment Candidates)
CANDIDATES_DB: Dict[str, Dict[str, Any]] = {
    "cust_gowtham": {
        "candidate_id": "CAND-901",
        "name": "Gowtham D",
        "role": "Senior Full Stack Engineer",
        "tech_stack": "Python, React, FastAPI, MongoDB",
        "notice_period": "30 days",
        "expected_salary": "₹18 Lakhs/yr",
        "screening_score": 92,
        "status": "tech_screen_passed",
        "interview_time": "Oct 5, 2026 at 11:00 AM"
    }
}

def ensure_user_domain_data(customer_id: str, customer_name: str):
    """
    Ensures ANY user account (Gowtham D, Demo, or any newly registered user)
    has authentic starting baseline DB records across Support, Sales, Booking, and HR.
    """
    user_orders = [o for o in ORDERS_DB.values() if o["customer_id"] == customer_id]
    if not user_orders:
        ord1_id = f"ORD-{abs(hash(customer_id)) % 8000 + 1000}" if customer_id != "cust_gowtham" else "ORD-8821"
        ord2_id = f"ORD-{abs(hash(customer_id + '2')) % 8000 + 1000}" if customer_id != "cust_gowtham" else "ORD-8822"
        ord3_id = f"ORD-{abs(hash(customer_id + '3')) % 8000 + 1000}" if customer_id != "cust_gowtham" else "ORD-8823"
        
        ORDERS_DB[ord1_id] = {
            "id": ord1_id,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "item_name": "Kanjivaram Silk Saree",
            "price": 1499,
            "status": "delivered",
            "delivery_date": "Oct 1, 2026",
            "courier": "Express Courier",
            "can_refund": True
        }
        ORDERS_DB[ord2_id] = {
            "id": ord2_id,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "item_name": "Wireless Noise-Canceling Earbuds",
            "price": 2999,
            "status": "out_for_delivery",
            "expected_delivery": "Today by 4:00 PM",
            "courier": "BlueDart Express",
            "can_refund": False
        }
        ORDERS_DB[ord3_id] = {
            "id": ord3_id,
            "customer_id": customer_id,
            "customer_name": customer_name,
            "item_name": "Cotton Formal Shirt (Blue)",
            "price": 899,
            "status": "processing",
            "expected_delivery": "Oct 4, 2026",
            "courier": "Delhivery",
            "can_refund": False
        }

    if customer_id not in LEADS_DB:
        LEADS_DB[customer_id] = {
            "customer_id": customer_id,
            "company": f"{customer_name} Tech Solutions",
            "seats": 50,
            "budget": "1.5 Lakhs/mo",
            "stage": "demo_scheduled",
            "demo_time": "Oct 3, 2026 at 3:00 PM IST",
            "rep": "Senior Account Exec (Rahul)"
        }

    if customer_id not in APPOINTMENTS_DB:
        APPOINTMENTS_DB[customer_id] = {
            "appointment_id": "APT-7721",
            "customer_name": customer_name,
            "doctor": "Dr. Anitha (Cardiology Specialist)",
            "clinic": "Apollo Clinic, T-Nagar",
            "slot_time": "Oct 4, 2026 at 10:30 AM",
            "fee": "₹800",
            "status": "confirmed"
        }

    if customer_id not in CANDIDATES_DB:
        CANDIDATES_DB[customer_id] = {
            "candidate_id": "CAND-901",
            "name": customer_name,
            "role": "Senior Full Stack Engineer",
            "tech_stack": "Python, React, FastAPI, MongoDB",
            "notice_period": "30 days",
            "expected_salary": "₹18 Lakhs/yr",
            "screening_score": 92,
            "status": "tech_screen_passed",
            "interview_time": "Oct 5, 2026 at 11:00 AM"
        }

# Escalation Queue
ESCALATION_QUEUE: List[EscalationItem] = [
    EscalationItem(
        id="ESC-9081",
        session_id="sess_8912",
        workforce_id="wf_support",
        customer_name="Gowtham D",
        language="ta (Tamil)",
        reason="Refund amount (₹2,499) exceeds auto-approval limit (₹2,000)",
        status="pending",
        timestamp="10 mins ago",
        transcript=[
            {"speaker": "Customer", "text": "En saree torn aagi vandhuchu, order ORD-8822."},
            {"speaker": "Order Verification Worker", "text": "Order ORD-8822 verified: Earbuds delivered today."},
            {"speaker": "Customer", "text": "Photo attached. Need full refund ₹2,999."},
            {"speaker": "Refund Worker", "text": "Damage verified. Refund ₹2,999 exceeds threshold ₹2,000. Escalating to supervisor."}
        ],
        task_state={"order_id": "ORD-8822", "amount": 2999, "item": "Wireless Noise-Canceling Earbuds", "status": "approval_required"},
        image_attached="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400",
        suggested_action="Approve manual refund ₹2,999 or offer instant replacement voucher."
    )
]

# Real Knowledge Base Documents & Vectors
KNOWLEDGE_DOCS = [
    {
        "id": "kb_1",
        "name": "shipping_policy.pdf",
        "size": "142 KB",
        "chunks": 18,
        "status": "Indexed",
        "org_id": "org_sme_001",
        "text": "Standard shipping takes 3 to 5 business days. Express shipping delivers within 24 to 48 hours. Orders over ₹999 qualify for free shipping."
    },
    {
        "id": "kb_2",
        "name": "return_refund_sop_v2.docx",
        "size": "89 KB",
        "chunks": 12,
        "status": "Indexed",
        "org_id": "org_sme_001",
        "text": "Return policy window is 14 days from delivery date. Damaged items require a photo uploaded. Automated refunds up to ₹2,000 are processed instantly to original payment mode."
    },
    {
        "id": "kb_3",
        "name": "clinic_doctor_fees_2026.csv",
        "size": "512 KB",
        "chunks": 45,
        "status": "Indexed",
        "org_id": "org_sme_001",
        "text": "General Physician consultation fee is ₹500. Cardiology Specialist consultation fee is ₹800. Clinic timings are Monday to Saturday 9:00 AM to 8:00 PM."
    }
]
