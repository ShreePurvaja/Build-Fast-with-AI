from typing import List
from fastapi import APIRouter, HTTPException
from app.models.schemas import WorkforceSpec
from app.data.database import WORKFORCES_DB

router = APIRouter(prefix="/api/workforces", tags=["Workforces"])

@router.get("", response_model=List[WorkforceSpec])
def list_workforces(org_id: str = "org_sme_001"):
    return [wf for wf in WORKFORCES_DB.values() if wf.org_id == org_id]

@router.get("/{wf_id}", response_model=WorkforceSpec)
def get_workforce(wf_id: str):
    if wf_id not in WORKFORCES_DB:
        raise HTTPException(status_code=404, detail="Workforce spec not found")
    return WORKFORCES_DB[wf_id]

@router.put("/{wf_id}", response_model=WorkforceSpec)
def update_workforce(wf_id: str, updated_spec: WorkforceSpec):
    WORKFORCES_DB[wf_id] = updated_spec
    return updated_spec

@router.post("/{wf_id}/publish", response_model=WorkforceSpec)
def publish_workforce(wf_id: str):
    if wf_id not in WORKFORCES_DB:
        raise HTTPException(status_code=404, detail="Workforce spec not found")
    wf = WORKFORCES_DB[wf_id]
    wf.published = True
    wf.version += 1
    wf.voice_link = f"https://workforce.app/talk/{wf_id}"
    WORKFORCES_DB[wf_id] = wf
    return wf
