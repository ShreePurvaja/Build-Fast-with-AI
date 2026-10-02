import os
from typing import Dict, Any, Optional

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/voice_platform_db")

# In-memory MongoDB collection simulation wrapper (works standalone without external Mongo server)
class LocalMongoCollection:
    def __init__(self, name: str):
        self.name = name
        self.docs: Dict[str, Dict[str, Any]] = {}

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self.docs.values():
            if all(doc.get(k) == v for k, v in query.items()):
                return doc
        return None

    async def insert_one(self, doc: Dict[str, Any]):
        doc_id = doc.get("_id", str(len(self.docs) + 1))
        doc["_id"] = doc_id
        self.docs[str(doc_id)] = doc
        return doc_id

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        doc = await self.find_one(query)
        if doc:
            if "$set" in update:
                doc.update(update["$set"])
        elif upsert:
            new_doc = {**query}
            if "$set" in update:
                new_doc.update(update["$set"])
            await self.insert_one(new_doc)

class VoicePlatformDatabase:
    def __init__(self):
        self.tenants = LocalMongoCollection("tenants")
        self.customers = LocalMongoCollection("customers")
        self.sessions = LocalMongoCollection("sessions")
        self.tool_calls = LocalMongoCollection("tool_calls")
        self.escalations = LocalMongoCollection("escalations")
        self.orders = LocalMongoCollection("orders")
        self.refunds = LocalMongoCollection("refunds")

db_instance = VoicePlatformDatabase()

async def get_database():
    return db_instance
