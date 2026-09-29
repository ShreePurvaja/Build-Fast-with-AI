from typing import Dict
from app.models.schemas import WorkforceSpec, ManagerSpec, WorkerSpec, PermissionSpec

PRESET_TEMPLATES: Dict[str, WorkforceSpec] = {
    "support": WorkforceSpec(
        id="wf_support",
        workforce="Customer Support & Refunds",
        languages=["ta", "hi", "en"],
        manager=ManagerSpec(name="AI Support Manager", routing="intent", max_hops=4),
        workers=[
            WorkerSpec(
                id="query_worker",
                name="Query Worker",
                instructions="Answers product specifications, store timings, and policy questions from the knowledge base.",
                tools=[],
                kb=["shipping_policy", "return_policy"]
            ),
            WorkerSpec(
                id="order_check",
                name="Order Verification Worker",
                instructions="Queries Order DB using customer Order ID to check shipment status and delivery details.",
                tools=["orders"],
                kb=["delivery_sla"]
            ),
            WorkerSpec(
                id="refund",
                name="Refund Worker",
                instructions="Processes item refund via Payment Gateway after verifying damaged product photo and customer explicit confirmation.",
                tools=["pay"],
                permissions={"create_refund": PermissionSpec(approval="user_confirm", max_amount=2000)},
                require_confirmation=True
            ),
            WorkerSpec(
                id="escalation",
                name="Escalation Worker",
                instructions="Bundles full conversation transcript, damaged item photo, and order state into a human supervisor handoff ticket.",
                tools=["helpdesk"]
            )
        ],
        flow=["order_check", "refund", "escalation"],
        escalate_if=["amount > 2000", "user_requests_human", "repeated_failure"],
        published=True,
        voice_link="https://workforce.app/talk/wf_support"
    ),
    "sales": WorkforceSpec(
        id="wf_sales",
        workforce="Sales Lead Follow-up",
        languages=["hi", "en", "te"],
        manager=ManagerSpec(name="AI Sales Manager", routing="intent", max_hops=3),
        workers=[
            WorkerSpec(
                id="qualifier",
                name="Lead Qualifier",
                instructions="Asks budget range, user seat requirement, and expected start date to score lead priority.",
                tools=["crm"]
            ),
            WorkerSpec(
                id="scheduler",
                name="Demo Scheduler",
                instructions="Checks available sales team calendar slots and books interactive product demo.",
                tools=["cal"]
            ),
            WorkerSpec(
                id="crm_updater",
                name="CRM Updater",
                instructions="Writes structured call notes and deal stage updates into the CRM system.",
                tools=["crm"]
            ),
            WorkerSpec(
                id="followup",
                name="Follow-up Messaging Worker",
                instructions="Sends calendar invite and WhatsApp confirmation with demo link.",
                tools=["wa"]
            )
        ],
        flow=["qualifier", "scheduler", "crm_updater", "followup"],
        escalate_if=["budget > 100000", "enterprise_custom_request"],
        published=True,
        voice_link="https://workforce.app/talk/wf_sales"
    ),
    "booking": WorkforceSpec(
        id="wf_booking",
        workforce="Appointment Booking Desk",
        languages=["ta", "hi", "en"],
        manager=ManagerSpec(name="AI Front Desk Manager", routing="intent", max_hops=3),
        workers=[
            WorkerSpec(
                id="enquiry",
                name="Enquiry Worker",
                instructions="Provides clinic doctor availability, consultation fees, and address info.",
                tools=[]
            ),
            WorkerSpec(
                id="booking_worker",
                name="Booking Worker",
                instructions="Reserves patient appointment time slot in calendar system.",
                tools=["cal"]
            ),
            WorkerSpec(
                id="reminder",
                name="Reminder Worker",
                instructions="Dispatches SMS/WhatsApp reminders and handles reschedule requests.",
                tools=["wa"]
            ),
            WorkerSpec(
                id="escalation",
                name="Escalation Worker",
                instructions="Flags medical emergency or custom requests to staff queue.",
                tools=["helpdesk"]
            )
        ],
        flow=["enquiry", "booking_worker", "reminder"],
        escalate_if=["medical_emergency", "unclear_symptoms"],
        published=True,
        voice_link="https://workforce.app/talk/wf_booking"
    ),
    "hr": WorkforceSpec(
        id="wf_hr",
        workforce="Recruitment Screening",
        languages=["en", "hi"],
        manager=ManagerSpec(name="AI Recruiter Manager", routing="intent", max_hops=3),
        workers=[
            WorkerSpec(
                id="screener",
                name="Resume Screener Worker",
                instructions="Parses applicant skill set, tech stack experience, and checks role requirements.",
                tools=["ats"]
            ),
            WorkerSpec(
                id="interview_scheduler",
                name="Interview Scheduler Worker",
                instructions="Schedules tech screening call with engineering interviewer.",
                tools=["cal"]
            ),
            WorkerSpec(
                id="qa_worker",
                name="Candidate Q&A Worker",
                instructions="Answers work culture, CTC range, and office location questions.",
                tools=[]
            ),
            WorkerSpec(
                id="escalation",
                name="Hiring Manager Escalation",
                instructions="Passes top-tier candidates directly to VP of Engineering.",
                tools=["helpdesk"]
            )
        ],
        flow=["screener", "interview_scheduler", "qa_worker"],
        escalate_if=["salary_expectation > budget", "notice_period > 60_days"],
        published=True,
        voice_link="https://workforce.app/talk/wf_hr"
    )
}
