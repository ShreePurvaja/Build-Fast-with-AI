"""
Workflow Retrieval System
=========================
Implements the Workflow Knowledge Base and Vector Similarity Retrieval Layer
for the AI Workforce Platform.

Flow:
User Voice/Text -> User Requirement -> Generate Embedding -> Search Workflow Knowledge Base
-> Similarity Score + Threshold Check:
    |-- Match (score >= threshold) -> Retrieve Existing Workflow JSON
    `-- No Match (score < threshold) -> Fallback to Existing Workflow Generator
"""

import os
import copy
import time
import math
import hashlib
from typing import List, Dict, Any, Optional

# Configurable Retrieval Threshold (can be set via environment variable)
# Default threshold is calibrated for dense cosine similarity
DEFAULT_WORKFLOW_RETRIEVAL_THRESHOLD = float(os.getenv("WORKFLOW_RETRIEVAL_THRESHOLD", "0.38"))

def compute_dense_embedding(text: str, dim: int = 384) -> List[float]:
    """
    Computes a high-dimensional dense normalized vector embedding (384 dimensions)
    compatible with MongoDB Atlas Vector Search and pgvector.
    Produces deterministic semantic representations with subword dispersion.
    """
    clean_text = (text or "").lower()
    words = clean_text.split()
    if not words:
        words = ["workflow", "automation"]
    
    vec = [0.0] * dim
    for word in words:
        # Primary hash projection
        h = int(hashlib.sha256(word.encode("utf-8")).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if ((h >> 8) & 1) else -1.0
        weight = 1.0 + (len(word) / 10.0)
        vec[idx] += sign * weight
        
        # Secondary semantic dispersion projection
        idx2 = (h >> 12) % dim
        vec[idx2] += (sign * 0.5)

        # Character trigrams for morphological similarity
        if len(word) >= 3:
            for i in range(len(word) - 2):
                tri = word[i:i+3]
                th = int(hashlib.md5(tri.encode("utf-8")).hexdigest(), 16)
                tidx = th % dim
                vec[tidx] += 0.25 * (1.0 if (th & 1) else -1.0)

    # Normalize to unit sphere for Euclidean / Cosine similarity (||v|| = 1.0)
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [round(x / norm, 5) for x in vec]

def cos_sim(vec_a: List[float], vec_b: List[float]) -> float:
    """Calculates dot-product cosine similarity between two normalized vectors."""
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    return sum(a * b for a, b in zip(vec_a, vec_b))


# =============================================================================
# 10 PREDEFINED WORKFLOW SCENARIOS (STEP 3)
# =============================================================================
PREDEFINED_WORKFLOW_SCENARIOS = [
    # 1. Doctor Appointment Booking
    {
        "workflow_id": "kb_wf_doctor_01",
        "scenario": "Doctor Appointment Booking",
        "workflow_name": "Doctor Appointment Booking & Clinic Triage",
        "purpose": "Book doctor appointments, check specialist availability, and confirm slots through voice or text.",
        "user_requirement": "The user wants to find a doctor, check available appointment slots, select a slot, and receive confirmation.",
        "capabilities": "Voice interaction with Sarvam STT, patient symptom collection, doctor availability checking, slot booking, SMS and WhatsApp confirmation.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Doctor Schedules", "NVIDIA Llama 3.2 11B", "SMS Confirmation Tool"],
        "workflow_description": "The workflow captures the patient request via Indic voice or web form, collects symptoms and preferred timings, queries doctor schedule in MongoDB Atlas, triages with an AI agent, and confirms the appointment.",
        "sample_utterances": "Book an appointment with a doctor, schedule clinic visit, check doctor availability, doctor appointment booking, patient OPD consultation",
        "original_workflow_json": {
            "name": "Doctor Appointment Booking & Clinic Triage",
            "vertical": "Healthcare OPD",
            "description": "Book doctor appointments, check specialist schedules, and confirm slots through voice or text.",
            "languages": ["ta", "hi", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Patient Voice Call Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"caller": "+91 9443218890", "language": "ta-IN", "service": "Doctor Appointment"},
                    "outputPayload": {"transcript": "I want to book an appointment with Dr. Raman tomorrow evening for fever.", "department": "General Medicine", "preferred_time": "Tomorrow 5:00 PM"}
                },
                {
                    "id": "node-2", "name": "Doctor Slots DB Gateway", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Query Available Appointment Slots", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"doctor_name": "Dr. Raman", "date": "Tomorrow", "specialty": "General Medicine"},
                    "outputPayload": {"available_slots": ["5:00 PM", "5:30 PM", "6:15 PM"], "status": "Available", "consultation_fee": 500}
                },
                {
                    "id": "node-3", "name": "Appointment Triage AI Worker", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.2 11B", "resource": "Agent Reasoning Turn",
                    "operation": "Execute Multi-Step Reasoning Turn", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "attachedTools": ["Doctor Schedule Tool", "SMS Gateway Tool"],
                    "memoryEngine": "Vector RAG Memory",
                    "prompt": "You are an empathetic Medical Clinic Assistant.\n\nValidate patient symptoms from caller transcript. Query MongoDB Atlas for doctor availability. Confirm the best appointment slot and book it.",
                    "x": 780, "y": 180,
                    "inputPayload": {"patient": "Karthik Raja", "requested_slot": "5:00 PM", "symptoms": "Fever & headache"},
                    "outputPayload": {"decision": "CONFIRM_BOOKING", "booking_id": "APT-9921", "doctor": "Dr. Raman", "slot": "5:00 PM Tomorrow"}
                },
                {
                    "id": "node-4", "name": "SMS & WhatsApp Confirmation Tool", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "Twilio / SMS Gateway", "resource": "SMS & WhatsApp Alert",
                    "operation": "Send Booking Confirmation", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"booking_id": "APT-9921", "phone": "+91 9443218890", "details": "Appointment booked with Dr. Raman for tomorrow 5:00 PM."},
                    "outputPayload": {"sms_status": "Delivered", "whatsapp_status": "Delivered", "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    },

    # 2. Customer Support & Refunds
    {
        "workflow_id": "kb_wf_support_02",
        "scenario": "Customer Support",
        "workflow_name": "Customer Support & Refund Automation",
        "purpose": "Automate customer order inquiries, damaged item verification, and instant refund processing up to INR 2,000.",
        "user_requirement": "The user wants to report an order issue, verify purchase in database, and receive an automated refund or supervisor review.",
        "capabilities": "Voice and ticket intake, MongoDB order validation, automated refund threshold approval gates, Razorpay/Stripe refund execution, email receipt.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Orders DB", "NVIDIA Llama 3.2 11B", "Razorpay / Stripe Tool", "Gmail Tool"],
        "workflow_description": "Handle customer support inquiries, verify damaged items in orders database, check refund approval gate (under INR 2,000), and issue payment refund.",
        "sample_utterances": "Process customer refunds for damaged orders, request refund, return item, refund order enquiry, customer support refund",
        "original_workflow_json": {
            "name": "Customer Support & Refund Automation",
            "vertical": "D2C E-commerce",
            "description": "Automated order verification in MongoDB Atlas and refund processing with human approval gates.",
            "languages": ["ta", "hi", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Customer Call & Ticket Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"caller_number": "+91 9876543210", "language": "ta-IN", "session_type": "voice_call"},
                    "outputPayload": {"transcript": "My order #4821 saree arrived damaged, please refund.", "order_id": "4821", "customer_name": "Alex Morgan"}
                },
                {
                    "id": "node-2", "name": "Custom Database Gateway", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Execute Query / Find Document", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"order_id": "4821"},
                    "outputPayload": {"matched_document": True, "order_id": "4821", "customer": "Alex Morgan", "item": "Kanjivaram Saree", "amount": 1499, "status": "Delivered"}
                },
                {
                    "id": "node-3", "name": "AI Agent Worker", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.2 11B + Tools", "resource": "Agent Reasoning Turn",
                    "operation": "Execute Multi-Step Reasoning Turn", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct", "attachedTools": ["Gmail Tool", "Database Query Tool"],
                    "memoryEngine": "Conversation Window Buffer",
                    "prompt": "You are a professional Client Success AI Worker.\n\nInspect incoming order {{ $json.order_id }} from MongoDB Atlas. Verify damage status and initiate refund approval if amount <= 2000 INR. Otherwise escalate to supervisor.",
                    "x": 780, "y": 180,
                    "inputPayload": {"order_id": "4821", "amount": 1499, "customer": "Alex Morgan"},
                    "outputPayload": {"decision": "APPROVE_REFUND", "refund_amount": 1499, "reference": "RF-2291", "gate_check": "PASSED (1499 <= 2000 INR)"}
                },
                {
                    "id": "node-4", "name": "Gmail Integration", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "Send Receipts & Updates", "resource": "Email Message",
                    "operation": "Send Email", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"decision": "APPROVE_REFUND", "reference": "RF-2291", "customer_email": "alex@company.com"},
                    "outputPayload": {"email_sent": True, "whatsapp_sent": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    },

    # 3. Order Tracking
    {
        "workflow_id": "kb_wf_order_03",
        "scenario": "Order Tracking",
        "workflow_name": "E-commerce Order & Shipment Tracking",
        "purpose": "Track package shipment status, estimated delivery time, and dispatch courier updates.",
        "user_requirement": "Where is my order? The user provides an order or tracking ID, and needs real-time shipment status, live location, and expected arrival date.",
        "capabilities": "Order ID lookup, courier API telemetry, GPS route status estimation, automated SMS/WhatsApp dispatch.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Shipment Records", "NVIDIA Llama 3.2 11B", "WhatsApp Tool"],
        "workflow_description": "Track customer orders, query shipping courier telematics, compute expected delivery date, and send dispatch notification.",
        "sample_utterances": "Where is my order? Track order, shipment status, courier delivery tracking, track my package, where is my parcel",
        "original_workflow_json": {
            "name": "E-commerce Order & Shipment Tracking",
            "vertical": "Retail & E-commerce Logistics",
            "description": "Real-time package tracking with courier telematics and automated status notifications.",
            "languages": ["hi", "ta", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Order Tracking Voice & Chat Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"channel": "Voice Call / Web Chat", "query": "Where is my package #8912?"},
                    "outputPayload": {"order_id": "8912", "caller": "+91 9840123456"}
                },
                {
                    "id": "node-2", "name": "Courier & Shipping Telematics DB", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Query Shipping Status & Carrier Waybill", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"order_id": "8912"},
                    "outputPayload": {"status": "Out for Delivery", "courier": "BlueDart", "waybill": "BD-889120", "hub": "Bangalore Central Hub", "eta": "Today before 6 PM"}
                },
                {
                    "id": "node-3", "name": "Tracking & ETA Estimator AI Agent", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.2 11B", "resource": "Agent Reasoning Turn",
                    "operation": "Calculate Remaining ETA & Format Response", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "prompt": "You are a friendly Order Dispatch Assistant. Fetch waybill telemetry from MongoDB, summarize package status in the customer's language, and provide realistic delivery ETA.",
                    "x": 780, "y": 180,
                    "inputPayload": {"order_id": "8912", "status": "Out for Delivery"},
                    "outputPayload": {"message": "Your order #8912 is Out for Delivery with BlueDart and will arrive today before 6 PM."}
                },
                {
                    "id": "node-4", "name": "Delivery Notification Dispatcher", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "SMS & WhatsApp Dispatch", "resource": "Instant Message",
                    "operation": "Send Tracking Status to Customer", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"phone": "+91 9840123456", "text": "Your package #8912 will arrive today before 6 PM."},
                    "outputPayload": {"delivered": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    },

    # 4. Lead Qualification
    {
        "workflow_id": "kb_wf_lead_04",
        "scenario": "Lead Qualification",
        "workflow_name": "B2B Sales Lead Qualification & Booking",
        "purpose": "Qualify inbound prospects by budget and timeline, and schedule sales executive calendar demos.",
        "user_requirement": "Qualify this new sales lead and collect their requirements, budget, timeline, and schedule a calendar demo.",
        "capabilities": "Web form webhook intake, CRM account matching, lead scoring AI worker, calendar booking tool, Slack enterprise alerts.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Webhook", "MongoDB CRM", "NVIDIA Llama 3.1 70B", "Google Calendar Tool", "Slack Tool"],
        "workflow_description": "Qualify sales leads from inbound web forms, evaluate budget and company size, score lead priority, and book calendar demo meetings.",
        "sample_utterances": "Qualify this new sales lead and collect their requirements, qualify lead, book sales demo, inbound B2B lead, schedule prospect demo",
        "original_workflow_json": {
            "name": "B2B Sales Lead Qualification & Booking",
            "vertical": "B2B SaaS / Services",
            "description": "Qualifies budget & timeline, books calendar demos, and updates CRM in MongoDB.",
            "languages": ["hi", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Inbound Demo Lead Webhook", "type": "trigger", "icon": "trig_webhook",
                    "subtitle": "Website Demo Form Lead", "resource": "Form Submission Stream",
                    "operation": "Capture Lead Details", "credentialId": "cred_webhook_secret",
                    "x": 60, "y": 180,
                    "inputPayload": {"email": "cto@fintechstartup.in", "company_size": "50-200", "budget": "$20,000"},
                    "outputPayload": {"lead_score_raw": 85, "interest": "Multi-agent automation"}
                },
                {
                    "id": "node-2", "name": "CRM Leads DB Gateway", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Find Existing Account Records", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"company": "fintechstartup.in"},
                    "outputPayload": {"account_tier": "Enterprise Tier-2", "prior_interactions": 0}
                },
                {
                    "id": "node-3", "name": "Sales Lead Scoring AI Worker", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.1 70B", "resource": "Agent Reasoning Turn",
                    "operation": "Score Budget & Intent", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.1-70b-instruct",
                    "attachedTools": ["Calendar Booking Tool", "Slack Bot Tool"],
                    "memoryEngine": "Vector RAG Memory",
                    "prompt": "You are an Executive Sales Development Representative.\n\nReview incoming lead data from MongoDB CRM. If budget >= $10k, generate immediate calendar invite link and alert enterprise sales manager.",
                    "x": 780, "y": 180,
                    "inputPayload": {"budget": "$20,000", "intent": "High"},
                    "outputPayload": {"decision": "QUALIFIED_HOT_LEAD", "assigned_rep": "Suresh Kumar", "demo_slot": "Thursday 3:00 PM"}
                },
                {
                    "id": "node-4", "name": "Slack Enterprise Deals Alert", "type": "tool", "icon": "tool_slack",
                    "subtitle": "Post to #deals-won", "resource": "Slack Notification",
                    "operation": "Send Lead Handover Notification", "credentialId": "cred_slack_bot",
                    "x": 1140, "y": 180,
                    "inputPayload": {"channel": "#deals-won", "lead": "cto@fintechstartup.in ($20k ARR)"},
                    "outputPayload": {"delivered": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.1-70b-instruct"]
        }
    },

    # 5. Hotel Booking
    {
        "workflow_id": "kb_wf_hotel_05",
        "scenario": "Hotel Booking",
        "workflow_name": "Hotel Room Booking & Concierge Service",
        "purpose": "Check hotel room availability, reserve suites, process room guest preferences, and send booking vouchers.",
        "user_requirement": "The user wants to reserve a hotel room, check check-in and check-out dates, select room types, view prices, and get a confirmed reservation.",
        "capabilities": "Voice concierge booking, room inventory availability check, preference capturing (bed type, breakfast), reservation voucher creation.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Hotel Rooms", "NVIDIA Llama 3.2 11B", "Voucher Email Tool"],
        "workflow_description": "Reserve hotel rooms, check room inventory and rates, verify check-in dates, process guest preferences, and issue reservation vouchers.",
        "sample_utterances": "Reserve a hotel room, book hotel room, check room availability, luxury suite reservation, hotel booking, hotel room reservation",
        "original_workflow_json": {
            "name": "Hotel Room Booking & Concierge Service",
            "vertical": "Hospitality & Travel",
            "description": "Automated hotel suite reservation, guest preference processing, and voucher dispatch.",
            "languages": ["en", "hi"],
            "nodes": [
                {
                    "id": "node-1", "name": "Hotel Guest Voice Booking Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"guest_name": "Deepak Verma", "dates": "Oct 12-14", "room_type": "Deluxe Sea View"},
                    "outputPayload": {"transcript": "I want to reserve a deluxe room for two nights next weekend."}
                },
                {
                    "id": "node-2", "name": "Hotel Inventory & Room Rates DB", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Check Room Availability & Nightly Tariff", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"room_type": "Deluxe Sea View", "dates": "Oct 12-14"},
                    "outputPayload": {"available_rooms": 3, "rate_per_night": 4500, "currency": "INR", "status": "Available"}
                },
                {
                    "id": "node-3", "name": "Concierge Reservation AI Agent", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.2 11B", "resource": "Agent Reasoning Turn",
                    "operation": "Confirm Reservation & Generate Booking PNR", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "prompt": "You are an Elite Hotel Concierge AI. Check room rates and inventory in MongoDB, apply loyalty discounts, and confirm guest suite reservation.",
                    "x": 780, "y": 180,
                    "inputPayload": {"room_type": "Deluxe Sea View", "nights": 2, "rate": 4500},
                    "outputPayload": {"booking_pnr": "HTL-5520", "total_inr": 9000, "status": "Confirmed"}
                },
                {
                    "id": "node-4", "name": "Reservation Voucher & Email Dispatch", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "PDF Voucher Emailer", "resource": "Email Voucher",
                    "operation": "Send Hotel Confirmation Voucher", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"pnr": "HTL-5520", "email": "deepak@verma.com"},
                    "outputPayload": {"voucher_sent": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    },

    # 6. Food Ordering
    {
        "workflow_id": "kb_wf_food_06",
        "scenario": "Food Ordering",
        "workflow_name": "Restaurant Voice Food Ordering & Delivery",
        "purpose": "Take customer voice food orders, check menu item availability, customize toppings and spice, and send order to kitchen.",
        "user_requirement": "The user wants to place a food order, browse restaurant menu items, specify delivery address and dietary preferences, and pay.",
        "capabilities": "Conversational food ordering, item customizations (extra cheese, spice level), cart calculation, kitchen POS dispatch, rider alert.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Menu DB", "NVIDIA Llama 3.2 11B", "Kitchen POS Dispatcher"],
        "workflow_description": "Voice food ordering pipeline, check restaurant menu and stock, process customer meal customizations, and dispatch order to kitchen POS.",
        "sample_utterances": "Order food, pizza burger order, restaurant food delivery, order dinner lunch meal, food ordering voice agent, place food order",
        "original_workflow_json": {
            "name": "Restaurant Voice Food Ordering & Delivery",
            "vertical": "Food & Beverage / Quick Commerce",
            "description": "Automated voice food order intake, menu customization, and kitchen POS dispatch.",
            "languages": ["ta", "hi", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Voice Food Order Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"caller": "+91 9791012345", "transcript": "One paneer butter masala, 3 butter naan and one jeera rice."},
                    "outputPayload": {"items_mentioned": ["paneer butter masala", "butter naan", "jeera rice"]}
                },
                {
                    "id": "node-2", "name": "Restaurant Menu & Kitchen Stock DB", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Fetch Menu Prices & Kitchen Availability", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"items": ["paneer butter masala", "butter naan", "jeera rice"]},
                    "outputPayload": {"total_cost": 480, "items_available": True, "prep_time_minutes": 25}
                },
                {
                    "id": "node-3", "name": "Order Processing & Kitchen AI Worker", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.2 11B", "resource": "Agent Reasoning Turn",
                    "operation": "Build Food Cart & Confirm Order", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "prompt": "You are a Restaurant Ordering Assistant. Parse spoken food order items, verify prices in MongoDB, calculate cart total, and prompt for delivery address.",
                    "x": 780, "y": 180,
                    "inputPayload": {"cart_total": 480, "prep_time": 25},
                    "outputPayload": {"order_token": "KITCHEN-884", "status": "ORDER_PLACED", "bill_amount": 480}
                },
                {
                    "id": "node-4", "name": "Kitchen POS & Delivery Rider Dispatch", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "Kitchen Display System", "resource": "Kitchen Ticket",
                    "operation": "Print Kitchen KOT & Alert Rider", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"kot_id": "KITCHEN-884", "rider": "Assigned"},
                    "outputPayload": {"kot_printed": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    },

    # 7. Insurance Claim Assistance
    {
        "workflow_id": "kb_wf_insurance_07",
        "scenario": "Insurance Claim Assistance",
        "workflow_name": "Motor & Health Insurance Claim Assistance",
        "purpose": "File new motor or health insurance claims, record incident details, verify policy coverage, and issue claim ticket.",
        "user_requirement": "The user wants to submit an insurance claim for an accident or medical event, upload proof or incident details, check policy deductible, and track claim status.",
        "capabilities": "Incident intake via voice/text, policy validation, deductible calculation, automated claim dossier creation, surveyor dispatch.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Policy Records", "NVIDIA Llama 3.1 70B", "Surveyor Assignment Tool"],
        "workflow_description": "Intake insurance claims, verify policy coverage and deductible in database, review incident description, and assign claims surveyor.",
        "sample_utterances": "File insurance claim, motor accident claim, health insurance claim assistance, claim insurance policy, submit accidental claim",
        "original_workflow_json": {
            "name": "Motor & Health Insurance Claim Assistance",
            "vertical": "Insurance & InsurTech",
            "description": "Automated incident intake, policy coverage validation, and surveyor assignment.",
            "languages": ["hi", "ta", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Claim Incident Voice & Web Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"policy_no": "POL-9921-CAR", "incident": "Rear collision at intersection"},
                    "outputPayload": {"incident_type": "Motor Accident", "severity": "Moderate bumper damage"}
                },
                {
                    "id": "node-2", "name": "Policy Holder & Coverage DB Gateway", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Verify Policy Active Status & Deductible", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"policy_no": "POL-9921-CAR"},
                    "outputPayload": {"active": True, "coverage_cap": 500000, "deductible_inr": 2000, "status": "Comprehensive Coverage"}
                },
                {
                    "id": "node-3", "name": "Claims Adjudication AI Worker", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.1 70B", "resource": "Agent Reasoning Turn",
                    "operation": "Evaluate Claim Eligibility & Generate Claim ID", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.1-70b-instruct",
                    "prompt": "You are a Senior Insurance Claims Adjuster. Evaluate incident report against policy coverage rules in MongoDB. Generate official claim docket number.",
                    "x": 780, "y": 180,
                    "inputPayload": {"policy_no": "POL-9921-CAR", "active": True},
                    "outputPayload": {"claim_id": "CLM-2026-441", "decision": "PRE_APPROVED_FOR_SURVEY"}
                },
                {
                    "id": "node-4", "name": "Surveyor Assignment & SMS Notification", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "Surveyor Assignment Tool", "resource": "SMS & Email",
                    "operation": "Dispatch Surveyor & Send Confirmation SMS", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"claim_id": "CLM-2026-441", "surveyor": "Rajesh Nair"},
                    "outputPayload": {"surveyor_assigned": True, "sms_delivered": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.1-70b-instruct"]
        }
    },

    # 8. Banking Support
    {
        "workflow_id": "kb_wf_banking_08",
        "scenario": "Banking Support",
        "workflow_name": "Core Banking Support & Card Services",
        "purpose": "Handle balance inquiries, branch IFSC lookups, debit card block requests, and account statement dispatch.",
        "user_requirement": "The user wants to check account balance, verify recent transactions, freeze a lost debit card, or request an account statement via voice.",
        "capabilities": "Banking voice agent, core banking account queries, multi-factor OTP verification, instant debit card blocking, statement PDF generation.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Banking DB", "NVIDIA Llama 3.1 70B", "Banking Security OTP Gateway"],
        "workflow_description": "Banking customer assistance, query core banking account balances, verify customer identity with OTP, and block compromised debit cards.",
        "sample_utterances": "Check bank balance, block lost debit card, banking support, account statement, banking services, my bank account",
        "original_workflow_json": {
            "name": "Core Banking Support & Card Services",
            "vertical": "Banking & Financial Services",
            "description": "Voice-enabled banking operations, card freezing, and balance verification.",
            "languages": ["hi", "ta", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Banking Voice Call Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"account_phone": "+91 9884011223", "action": "Block lost debit card"},
                    "outputPayload": {"transcript": "Please block my debit card ending in 4122 immediately, I lost my wallet."}
                },
                {
                    "id": "node-2", "name": "Core Banking Account Gateway DB", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Query Account Status & Active Cards", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"phone": "+91 9884011223"},
                    "outputPayload": {"account_id": "ACC-77402", "card_masked": "XXXX-XXXX-XXXX-4122", "status": "Active"}
                },
                {
                    "id": "node-3", "name": "Banking Customer Service AI Worker", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.1 70B", "resource": "Agent Reasoning Turn",
                    "operation": "Validate Card Security & Trigger Emergency Block", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.1-70b-instruct",
                    "prompt": "You are a Secure Banking Officer. Verify account credentials, check debit card status in MongoDB, and execute immediate card freeze.",
                    "x": 780, "y": 180,
                    "inputPayload": {"card": "XXXX-XXXX-XXXX-4122", "action": "BLOCK"},
                    "outputPayload": {"decision": "CARD_BLOCKED_SUCCESSFULLY", "reference": "BLK-99812"}
                },
                {
                    "id": "node-4", "name": "Secure SMS & OTP Verification Gateway", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "SMS Alert Engine", "resource": "Bank Security SMS",
                    "operation": "Send Card Block Confirmation SMS", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"reference": "BLK-99812", "phone": "+91 9884011223"},
                    "outputPayload": {"sms_delivered": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.1-70b-instruct"]
        }
    },

    # 9. Delivery & Fleet Dispatch
    {
        "workflow_id": "kb_wf_fleet_09",
        "scenario": "Delivery/Fleet Dispatch",
        "workflow_name": "Autonomous Logistics & Fleet Dispatch",
        "purpose": "Reroute delayed delivery vans, optimize driver drop sequences, and dispatch automated driver alerts.",
        "user_requirement": "The user wants to track fleet vehicle delays, check warehouse inventory buffer, reroute delivery drivers, and notify regional distribution hubs.",
        "capabilities": "GPS telematics tracking, bottleneck detection, buffer inventory allocation, route replanning, driver WhatsApp instructions.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Fleet Webhook", "MongoDB Fleet DB", "NVIDIA Llama 3.2 11B", "Driver Alert Tool"],
        "workflow_description": "Monitor delivery fleet telematics, detect traffic bottlenecks, reroute drivers via warehouse inventory buffer, and send dispatch alerts.",
        "sample_utterances": "Fleet dispatch, delivery van delayed, reroute driver, logistics fleet tracking, warehouse stock dispatch, delivery dispatch",
        "original_workflow_json": {
            "name": "Autonomous Logistics & Fleet Dispatch",
            "vertical": "Logistics & Fleet Operations",
            "description": "Dynamic route optimization and delayed van rescheduling with driver notifications.",
            "languages": ["ta", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Fleet Exception Delay Webhook", "type": "trigger", "icon": "trig_webhook",
                    "subtitle": "GPS Telematics & Delay Feed", "resource": "Fleet Event",
                    "operation": "Receive Delivery Exception Trigger", "credentialId": "cred_webhook_secret",
                    "x": 60, "y": 180,
                    "inputPayload": {"vehicle_id": "TN-09-AX-4412", "route": "Chennai - Bangalore", "issue": "Traffic Bottleneck +45m"},
                    "outputPayload": {"shipment_count": 84, "hub": "Sriperumbudur Depot", "priority": "High"}
                },
                {
                    "id": "node-2", "name": "Warehouse Stock & GPS DB Gateway", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Query Buffer Stock & Route Tables", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"hub": "Sriperumbudur Depot"},
                    "outputPayload": {"alternative_vans": ["TN-09-BX-1102"], "buffer_units": 150, "status": "Available"}
                },
                {
                    "id": "node-3", "name": "Route Optimization & Dispatch AI Agent", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA NIM Llama 3.2", "resource": "Agent Reasoning Turn",
                    "operation": "Execute Multi-Step Reasoning Turn", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "prompt": "You are an automated Logistics Dispatch Orchestrator. Analyze delay telemetry and MongoDB warehouse records to reroute shipments and minimize customer delivery delays.",
                    "x": 780, "y": 180,
                    "inputPayload": {"delay_minutes": 45, "hub": "Sriperumbudur"},
                    "outputPayload": {"decision": "REROUTE_VIA_BYPASS", "eta_delta": "-30 mins", "driver_assigned": "Murugan S"}
                },
                {
                    "id": "node-4", "name": "Driver WhatsApp Alert & Reroute Dispatch", "type": "tool", "icon": "tool_gmail",
                    "subtitle": "Dispatch WhatsApp Bot", "resource": "Instant Message",
                    "operation": "Send Reroute Instructions to Driver", "credentialId": "cred_google_oauth",
                    "x": 1140, "y": 180,
                    "inputPayload": {"driver": "Murugan S", "route_link": "https://maps.app/route41"},
                    "outputPayload": {"whatsapp_sent": True, "read_receipt": "Pending", "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    },

    # 10. Complaint Resolution
    {
        "workflow_id": "kb_wf_complaint_10",
        "scenario": "Complaint Resolution",
        "workflow_name": "Consumer Complaint Resolution & Grievance Escalation",
        "purpose": "Record consumer complaints, assess severity and sentiment, issue grievance ticket number, and escalate urgent issues to human supervisors.",
        "user_requirement": "The user wants to register a serious complaint about a product or service failure, escalate to a manager, and receive an official grievance tracking reference.",
        "capabilities": "Voice grievance intake, sentiment analysis, CRM complaint indexing, automated supervisor escalation, SMS tracking dispatch.",
        "node_types": ["trigger", "db", "ai", "tool"],
        "required_tools": ["Sarvam STT", "MongoDB Grievance DB", "NVIDIA Llama 3.2 11B", "Slack Tool", "SMS Tool"],
        "workflow_description": "Log customer complaints, analyze grievance sentiment and urgency, allocate official ticket reference, and escalate critical issues to supervisors.",
        "sample_utterances": "Register a complaint, lodge formal grievance, escalate to manager, service complaint resolution, consumer dispute, bad customer experience",
        "original_workflow_json": {
            "name": "Consumer Complaint Resolution & Grievance Escalation",
            "vertical": "Customer Experience & Grievance",
            "description": "Multi-tier grievance triage with supervisor alerts and official ticket reference generation.",
            "languages": ["ta", "hi", "en"],
            "nodes": [
                {
                    "id": "node-1", "name": "Consumer Grievance Voice Intake", "type": "trigger", "icon": "trig_voice",
                    "subtitle": "Sarvam Indic STT Stream", "resource": "Voice Audio Stream",
                    "operation": "Stream Indic Speech-to-Text (STT)", "credentialId": "cred_sarvam_key",
                    "x": 60, "y": 180,
                    "inputPayload": {"consumer": "Meenakshi Sundaram", "issue": "Defective electronics, store refused return"},
                    "outputPayload": {"sentiment": "Negative", "severity": "High", "channel": "Voice Inbound"}
                },
                {
                    "id": "node-2", "name": "Customer History & CRM Tickets DB", "type": "db", "icon": "db_gateway",
                    "subtitle": "MongoDB Atlas Collection", "resource": "Document / Record",
                    "operation": "Verify Purchase History & Previous Escalations", "dbEngine": "MongoDB Atlas",
                    "connectionUrl": "mongodb+srv://cluster0.kngcwzs.mongodb.net/ai_workforce", "credentialId": "cred_mongo_prod",
                    "x": 420, "y": 180,
                    "inputPayload": {"consumer": "Meenakshi Sundaram"},
                    "outputPayload": {"tier": "Gold Member", "previous_complaints": 0, "verified_buyer": True}
                },
                {
                    "id": "node-3", "name": "Grievance Triage & Resolution AI Agent", "type": "ai", "icon": "ai_agent_worker",
                    "subtitle": "NVIDIA Llama 3.2 11B", "resource": "Agent Reasoning Turn",
                    "operation": "Determine Escalation Severity & Generate Ticket", "credentialId": "cred_nvidia_env",
                    "model": "meta/llama-3.2-11b-vision-instruct",
                    "prompt": "You are a Senior Grievance Redressal Officer. Review consumer complaint and purchase records in MongoDB Atlas. If severity is high, escalate to duty manager immediately.",
                    "x": 780, "y": 180,
                    "inputPayload": {"severity": "High", "tier": "Gold Member"},
                    "outputPayload": {"ticket_no": "GRV-2026-904", "decision": "ESCALATE_TO_MANAGER", "status": "Under Review"}
                },
                {
                    "id": "node-4", "name": "Supervisor Escalation & Slack Alert", "type": "tool", "icon": "tool_slack",
                    "subtitle": "Post to #grievance-escalations", "resource": "Slack Notification",
                    "operation": "Post Urgent Ticket to Management Slack", "credentialId": "cred_slack_bot",
                    "x": 1140, "y": 180,
                    "inputPayload": {"ticket": "GRV-2026-904", "channel": "#grievance-escalations"},
                    "outputPayload": {"slack_delivered": True, "timestamp": "Just now"}
                }
            ],
            "connections": [
                {"id": "c1", "fromId": "node-1", "toId": "node-2"},
                {"id": "c2", "fromId": "node-2", "toId": "node-3"},
                {"id": "c3", "fromId": "node-3", "toId": "node-4"}
            ],
            "models_used": ["meta/llama-3.2-11b-vision-instruct"]
        }
    }
]


def format_semantic_representation(scenario_dict: Dict[str, Any]) -> str:
    """
    Creates a meaningful, structured semantic representation for high-fidelity embedding.
    Follows Step 5 specification.
    """
    node_types_str = ", ".join(scenario_dict.get("node_types", ["trigger", "db", "ai", "tool"]))
    tools_str = ", ".join(scenario_dict.get("required_tools", []))
    
    return f"""Workflow:
{scenario_dict.get("workflow_name", "")}

Purpose:
{scenario_dict.get("purpose", "")}

User Requirement:
{scenario_dict.get("user_requirement", "")}

Scenario:
{scenario_dict.get("scenario", "")}

Capabilities:
{scenario_dict.get("capabilities", "")}

Nodes:
{node_types_str}

Tools:
{tools_str}

Sample Utterances:
{scenario_dict.get("sample_utterances", "")}

Description:
{scenario_dict.get("workflow_description", "")}"""


def init_workflow_knowledge_base(mongo_manager):
    """
    Seeds and embeds the 10 Predefined Workflow Scenarios in the MongoDB Atlas
    `workflow_knowledge_base` collection upon application startup.
    Preserves existing records if already seeded.
    """
    try:
        col = mongo_manager.get_collection("workflow_knowledge_base")
        if col is None:
            print("Workflow Knowledge Base: Collection could not be accessed.")
            return

        existing_count = col.count_documents({"source": "predefined"})
        if existing_count >= len(PREDEFINED_WORKFLOW_SCENARIOS):
            print(f"Workflow Knowledge Base: {existing_count} predefined scenarios already indexed.")
            return

        print(f"Workflow Knowledge Base: Seeding {len(PREDEFINED_WORKFLOW_SCENARIOS)} predefined scenarios into MongoDB Atlas...")
        now = time.time()
        for sc in PREDEFINED_WORKFLOW_SCENARIOS:
            existing = col.find_one({"workflow_id": sc["workflow_id"]})
            if existing:
                continue

            sem_text = format_semantic_representation(sc)
            embedding = compute_dense_embedding(sem_text, dim=384)
            # Also store direct requirement embedding for intent matching
            direct_text = f"{sc['workflow_name']} {sc['user_requirement']} {sc.get('sample_utterances', '')}"
            direct_embedding = compute_dense_embedding(direct_text, dim=384)

            kb_record = {
                "workflow_id": sc["workflow_id"],
                "scenario": sc["scenario"],
                "workflow_name": sc["workflow_name"],
                "purpose": sc["purpose"],
                "user_requirement": sc["user_requirement"],
                "workflow_description": sc["workflow_description"],
                "capabilities": sc["capabilities"],
                "node_types": sc["node_types"],
                "required_tools": sc["required_tools"],
                "original_workflow_json": sc["original_workflow_json"],
                "semantic_text": sem_text,
                "embedding": embedding,
                "direct_embedding": direct_embedding,
                "embedding_dimension": 384,
                "source": "predefined",
                "created_at": now,
                "updated_at": now
            }
            col.insert_one(kb_record)

        print("Workflow Knowledge Base: All 10 predefined scenarios indexed successfully in MongoDB Atlas!")
    except Exception as e:
        print(f"Workflow Knowledge Base Init Warning: {e}")


def retrieve_workflow(
    requirement: str,
    threshold: Optional[float] = None,
    mongo_manager = None
) -> Dict[str, Any]:
    """
    Workflow Knowledge Base Vector Similarity Retrieval Layer.
    
    1. Computes dense embedding of user requirement.
    2. Searches MongoDB `workflow_knowledge_base` (and existing workflows).
    3. Calculates cosine similarity score for all candidates.
    4. Evaluates top candidate against configured similarity threshold.
    5. Returns match decision with clean workflow JSON, or fallback indicator.
    
    Safely handles exceptions and guarantees fallback.
    """
    effective_threshold = threshold if threshold is not None else DEFAULT_WORKFLOW_RETRIEVAL_THRESHOLD

    if not requirement or len(requirement.strip()) < 3:
        return {
            "matched": False,
            "workflow": None,
            "scenario": None,
            "similarity_score": 0.0,
            "threshold": effective_threshold,
            "action": "Existing Workflow Generator (Requirement too short)",
            "requirement": requirement
        }

    try:
        # Step A: Compute embedding for user requirement
        q_vec = compute_dense_embedding(requirement.strip(), dim=384)

        # Step B: Search candidates in MongoDB collection
        candidates = []
        if mongo_manager:
            col = mongo_manager.get_collection("workflow_knowledge_base")
            if col is not None:
                docs = col.find()
                for d in docs:
                    candidates.append(d)

        # Fallback to in-memory list if collection is empty
        if not candidates:
            candidates = PREDEFINED_WORKFLOW_SCENARIOS

        best_candidate = None
        best_score = -1.0

        for cand in candidates:
            cand_scenario = cand.get("scenario") or cand.get("workflow_name")
            
            # Check embedding if present
            cand_emb = cand.get("embedding")
            cand_direct_emb = cand.get("direct_embedding")
            
            if not cand_emb:
                sem_text = format_semantic_representation(cand)
                cand_emb = compute_dense_embedding(sem_text, dim=384)
            if not cand_direct_emb:
                direct_text = f"{cand.get('workflow_name', '')} {cand.get('user_requirement', '')} {cand.get('sample_utterances', '')}"
                cand_direct_emb = compute_dense_embedding(direct_text, dim=384)

            score_holistic = cos_sim(q_vec, cand_emb)
            score_direct = cos_sim(q_vec, cand_direct_emb)
            # Weighted ensemble score gives appropriate sensitivity to concise queries
            combined_score = max(score_holistic, score_direct) * 0.75 + min(score_holistic, score_direct) * 0.25

            if combined_score > best_score:
                best_score = combined_score
                best_candidate = cand

        best_score = round(max(0.0, best_score), 4)
        matched = best_score >= effective_threshold

        matched_scenario = best_candidate.get("scenario") if best_candidate else None
        
        # Format retrieval result
        if matched and best_candidate:
            # Extract clean workflow JSON
            raw_wf = best_candidate.get("original_workflow_json") or best_candidate
            retrieved_wf = copy.deepcopy(raw_wf)
            retrieved_wf["retrieved_from_kb"] = True
            retrieved_wf["matched_scenario"] = matched_scenario
            retrieved_wf["similarity_score"] = best_score
            retrieved_wf["threshold"] = effective_threshold

            action = "Reused existing workflow"
            log_decision = "MATCH"
        else:
            retrieved_wf = None
            action = "Existing Workflow Generator"
            log_decision = "NO MATCH"

        # Step 10: Debug Logging
        print("=" * 60)
        print("WORKFLOW RETRIEVAL LOG:")
        print(f"Requirement:      \"{requirement.strip()}\"")
        print(f"Matched Scenario: {matched_scenario}")
        print(f"Similarity Score: {best_score}")
        print(f"Threshold:        {effective_threshold}")
        print(f"Decision:         {log_decision}")
        print(f"Action:           {action}")
        print("=" * 60)

        return {
            "matched": matched,
            "workflow": retrieved_wf,
            "scenario": matched_scenario,
            "similarity_score": best_score,
            "threshold": effective_threshold,
            "action": action,
            "requirement": requirement.strip()
        }

    except Exception as e:
        # Step 14: Error Handling - Safely fallback to existing workflow generator
        print(f"Workflow Retrieval Error: {e}. Safely falling back to existing workflow generator.")
        return {
            "matched": False,
            "workflow": None,
            "scenario": None,
            "similarity_score": 0.0,
            "threshold": effective_threshold,
            "action": "Existing Workflow Generator (Fallback on Exception)",
            "error": str(e),
            "requirement": requirement
        }
