from fastapi import APIRouter, Query
from app.data.database import KNOWLEDGE_DOCS

router = APIRouter(prefix="/api/kb", tags=["Knowledge Base"])

@router.get("")
def get_knowledge_docs():
    return KNOWLEDGE_DOCS

@router.post("/upload")
def upload_knowledge_doc(file_name: str = Query("document.pdf")):
    new_doc = {
        "id": f"kb_{len(KNOWLEDGE_DOCS)+1}",
        "name": file_name,
        "size": "210 KB",
        "chunks": 24,
        "status": "Indexed & Vectorized (pgvector)",
        "org_id": "org_sme_001"
    }
    KNOWLEDGE_DOCS.append(new_doc)
    return new_doc
