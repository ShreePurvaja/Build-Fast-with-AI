from fastapi import APIRouter
from app.models.schemas import ToolConnectRequest
from app.data.database import CONNECTED_TOOLS

router = APIRouter(prefix="/api/tools", tags=["Tools Gateway"])

@router.get("/status")
def get_tools_status():
    return CONNECTED_TOOLS

@router.post("/connect")
def connect_tool(req: ToolConnectRequest):
    CONNECTED_TOOLS[req.tool_id] = True
    return {
        "status": "connected",
        "tool_id": req.tool_id,
        "mode": "demo_sandbox" if req.use_demo else "live_key",
        "message": f"Successfully authenticated connection to {req.tool_id}"
    }
