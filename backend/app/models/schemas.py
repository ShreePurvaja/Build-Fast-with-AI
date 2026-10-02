from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class PermissionSpec(BaseModel):
    approval: str = "user_confirm"  # auto | user_confirm | deny
    max_amount: Optional[int] = 2000

class WorkerSpec(BaseModel):
    id: str
    name: str
    instructions: str
    tools: List[str] = []
    kb: List[str] = []
    permissions: Dict[str, PermissionSpec] = {}
    require_confirmation: bool = False

class ManagerSpec(BaseModel):
    name: str
    routing: str = "intent"
    max_hops: int = 4

class WorkforceSpec(BaseModel):
    id: str
    workforce: str
    languages: List[str] = ["ta", "hi", "en"]
    manager: ManagerSpec
    workers: List[WorkerSpec]
    flow: List[str] = []
    escalate_if: List[str] = []
    org_id: str = "org_sme_001"
    version: int = 1
    published: bool = False
    voice_link: Optional[str] = None

class IntakeRequest(BaseModel):
    prompt: str
    language_hint: Optional[str] = "en"
    org_id: str = "org_sme_001"

class IntakeResponse(BaseModel):
    clarifying_questions: List[str]
    suggested_template_id: str
    generated_spec: WorkforceSpec
    assumptions: List[str]

class ToolConnectRequest(BaseModel):
    tool_id: str
    api_key: Optional[str] = None
    use_demo: bool = True

class SimulateTurnRequest(BaseModel):
    workforce_id: str
    session_id: str
    user_input: str
    language: str = "en"
    customer_id: Optional[str] = "cust_gowtham"
    customer_name: Optional[str] = "Gowtham D"
    image_url: Optional[str] = None
    confirm_action: bool = False

class EscalationItem(BaseModel):
    id: str
    session_id: str
    workforce_id: str
    customer_name: str
    language: str
    reason: str
    status: str = "pending"  # pending | resolved | taken_over
    timestamp: str
    transcript: List[Dict[str, str]]
    task_state: Dict[str, Any]
    image_attached: Optional[str] = None
    suggested_action: str

class AnalyticsSummary(BaseModel):
    conversations_today: int
    completed_tasks: int
    escalated_to_humans: int
    failed_tool_calls: int
    avg_latency_ms: int
    estimated_cost_inr: float
    active_sessions: int
    indic_breakdown: Dict[str, int]
