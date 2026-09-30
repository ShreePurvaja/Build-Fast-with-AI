import os
import sys
import time
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Suppress headers/footers on page 1 (cover)
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#6E685E"))
            self.drawString(54, 755, "AI WORKFORCE PLATFORM")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#9B9488"))
            self.drawString(185, 755, "|   Complete System Architecture & Operational Guide")
            
            self.setStrokeColor(colors.HexColor("#E6E1D7"))
            self.setLineWidth(0.75)
            self.line(54, 747, 558, 747)

            # Footer
            self.setStrokeColor(colors.HexColor("#E6E1D7"))
            self.setLineWidth(0.75)
            self.line(54, 48, 558, 48)

            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#9B9488"))
            self.drawString(54, 36, "Confidential • Built for Advanced AI Workforce Automation")
            
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 36, page_text)

        self.restoreState()


def build_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=colors.HexColor("#2B2826")
    )
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        textColor=colors.HexColor("#D97757")
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=colors.HexColor("#2B2826"),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=colors.HexColor("#374151")
    )
    bullet_style = ParagraphStyle(
        'CustomBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#374151"),
        leftIndent=14,
        spaceAfter=4
    )
    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#0F766E")
    )
    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1F2937")
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1F2937")
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 40))
    story.append(Paragraph("AI WORKFORCE ENTERPRISE PLATFORM", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Complete Working System Architecture & Operational Guide", title_style))
    story.append(Spacer(1, 14))
    
    badge_data = [
        [
            Paragraph("<b>MongoDB Atlas</b><br/>Cloud Persistence", table_cell_style),
            Paragraph("<b>Sarvam AI</b><br/>Indic Voice STT", table_cell_style),
            Paragraph("<b>NVIDIA NIM</b><br/>Multi-Agent LLMs", table_cell_style),
            Paragraph("<b>Vector Database</b><br/>384-dim Similarity", table_cell_style)
        ]
    ]
    badge_table = Table(badge_data, colWidths=[126, 126, 126, 126])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FAF8F5")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E6E1D7")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E6E1D7")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 20))

    meta_text = (
        "<b>Status:</b> Fully Integrated & Operational (Production Grade)<br/>"
        "<b>Frontend:</b> Next.js 15 (App Router) • React 19 • TypeScript • Tailwind CSS<br/>"
        "<b>Backend:</b> FastAPI (Python) • Uvicorn • PyMongo • Requests<br/>"
        "<b>Author:</b> Technical Architecture Team<br/>"
        f"<b>Generated:</b> September 30, 2026 • Build Fast with AI"
    )
    story.append(Paragraph(meta_text, body_style))
    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#E6E1D7")))
    story.append(Spacer(1, 15))

    exec_summary = (
        "<b>Executive Summary:</b><br/>"
        "This platform is an enterprise-grade autonomous workforce orchestration system. "
        "It eliminates repetitive human operational overhead by letting business operators create, configure, "
        "and deploy specialized AI agents. Operators can speak their workflow requirements directly into a browser microphone "
        "in regional Indian languages (Tamil, Hindi, Telugu, Kannada, or Indian English) via Sarvam AI. "
        "The system automatically synthesizes a dedicated, tailored workflow canvas (custom nodes, tools, and prompts), "
        "indexes the pipeline into a high-dimensional Vector Database (MongoDB Atlas Vector Search), and executes multi-agent "
        "reasoning turns backed by NVIDIA NIM cloud inference."
    )
    story.append(Paragraph(exec_summary, body_style))
    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: ARCHITECTURE OVERVIEW & INTERCONNECTION
    # =========================================================================
    story.append(Paragraph("1. High-Level System Architecture & Flow", h1_style))
    story.append(Paragraph(
        "The entire system is 100% interconnected across the Client, Microservice API, Cloud Database, "
        "Vector Engine, and AI Foundation Model providers without any isolated mock states.",
        body_style
    ))
    story.append(Spacer(1, 8))

    arch_rows = [
        [Paragraph("Layer", table_header_style), Paragraph("Technology", table_header_style), Paragraph("Key Functional Responsibility", table_header_style)],
        [
            Paragraph("<b>Voice Intake</b>", table_cell_style),
            Paragraph("Sarvam AI (saaras:v2)", table_cell_style),
            Paragraph("Multilingual Indic speech-to-text. Code-switching support (Tamil, Hindi, English).", table_cell_style)
        ],
        [
            Paragraph("<b>Frontend Studio</b>", table_cell_style),
            Paragraph("Next.js 15, React 19, TS", table_cell_style),
            Paragraph("Studio Canvas, Dedicated Workflow Dashboards, Vector Knowledge Manager.", table_cell_style)
        ],
        [
            Paragraph("<b>Backend API</b>", table_cell_style),
            Paragraph("FastAPI, Python 3.11", table_cell_style),
            Paragraph("REST Endpoints, Canvas Topology Synthesizer, Vector Embedding Engine, Auth.", table_cell_style)
        ],
        [
            Paragraph("<b>Primary Database</b>", table_cell_style),
            Paragraph("MongoDB Atlas", table_cell_style),
            Paragraph("Replaces SQLite. Persists users, credentials, workflows, executions & logs.", table_cell_style)
        ],
        [
            Paragraph("<b>Vector Database</b>", table_cell_style),
            Paragraph("Atlas Vector Search / pgvector", table_cell_style),
            Paragraph("384-dimensional dense semantic vectors. Real-time Cosine Similarity search.", table_cell_style)
        ],
        [
            Paragraph("<b>Inference Engine</b>", table_cell_style),
            Paragraph("NVIDIA NIM (Cloud API)", table_cell_style),
            Paragraph("Meta Llama 3.2 11B Vision, Llama 3.1 70B, Nemotron 70B live reasoning.", table_cell_style)
        ]
    ]
    arch_table = Table(arch_rows, colWidths=[100, 130, 274])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B2826")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E6E1D7")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#FAF8F5")]),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 12))

    # =========================================================================
    # SECTION 2: SARVAM AI INDIC VOICE INTEGRATION
    # =========================================================================
    story.append(Paragraph("2. Sarvam AI Multilingual Indic Voice Intake", h1_style))
    story.append(Paragraph(
        "The voice engine is embedded directly inside the <b>Create New Workflow</b> dialog. "
        "It eliminates manual form typing by allowing users to speak naturally in Indic languages.",
        body_style
    ))
    story.append(Spacer(1, 6))

    voice_points = [
        "<b>Microphone Capture:</b> Uses the browser's native <code>MediaRecorder</code> API capturing audio chunks in high fidelity.",
        "<b>MIME Sanitization:</b> Browsers record as <code>audio/webm;codecs=opus</code>. The frontend and backend sanitize this to <code>audio/webm</code> to match Sarvam AI's strict whitelist.",
        "<b>API Communication:</b> FastAPI routes audio to <code>https://api.sarvam.ai/speech-to-text</code> with the <code>api-subscription-key</code> header.",
        "<b>Language Code-Switching:</b> Set to <code>language_code: unknown</code> by default for automatic code-switch detection (e.g. Tanglish/Hinglish), or specific regional targets (<code>ta-IN</code>, <code>hi-IN</code>, <code>te-IN</code>, <code>kn-IN</code>, <code>en-IN</code>).",
        "<b>Automatic Form Population:</b> The returned transcript populates the Description field, auto-generates a clean Workflow Title, and flags regional language settings."
    ]
    for vp in voice_points:
        story.append(Paragraph(f"• {vp}", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: DYNAMIC WORKFLOW TOPOLOGY SYNTHESIS
    # =========================================================================
    story.append(Paragraph("3. Unique Studio Canvas for Every Workflow", h1_style))
    story.append(Paragraph(
        "A critical innovation in our platform is that <b>no two workflows share the same generic canvas</b>. "
        "When an operator creates a workflow, the backend synthesizer evaluates the vertical and user requirements "
        "to construct a tailored, connected graph of triggers, database gateways, AI agents, and notification tools:",
        body_style
    ))
    story.append(Spacer(1, 8))

    wf_scenarios = [
        [
            Paragraph("Vertical / Domain", table_header_style),
            Paragraph("Synthesized Node Pipeline Architecture", table_header_style),
            Paragraph("Specialized Model & Role", table_header_style)
        ],
        [
            Paragraph("<b>Appointment Booking / Healthcare</b>", table_cell_style),
            Paragraph("1. Patient Voice Call Intake (Sarvam Indic)<br/>2. Doctor Slots DB Gateway (MongoDB Atlas)<br/>3. Appointment Triage AI Worker<br/>4. SMS & WhatsApp Confirmation Tool", table_cell_style),
            Paragraph("Meta Llama 3.2 11B<br/>Triage symptoms & allocate slots", table_cell_style)
        ],
        [
            Paragraph("<b>Customer Support & Refunds</b>", table_cell_style),
            Paragraph("1. Inbound Call Intake (Sarvam Indic)<br/>2. Orders & Invoices Collection (MongoDB Atlas)<br/>3. Refund Resolution AI Worker<br/>4. Payment Gateway (Razorpay/Stripe)<br/>5. WhatsApp Confirmation", table_cell_style),
            Paragraph("Meta Llama 3.2 11B<br/>Cap checks (under INR 2,000 auto-refund)", table_cell_style)
        ],
        [
            Paragraph("<b>Financial Services / Loan KYC</b>", table_cell_style),
            Paragraph("1. Loan Application Inbound Webhook<br/>2. CIBIL & Credit DB Gateway (MongoDB Atlas)<br/>3. Credit Underwriting AI Worker<br/>4. Slack Loan Officer Alert", table_cell_style),
            Paragraph("Meta Llama 3.1 70B<br/>Risk underwriting & credit checks", table_cell_style)
        ],
        [
            Paragraph("<b>Logistics & Fleet Dispatch</b>", table_cell_style),
            Paragraph("1. Fleet Delay Exception Webhook<br/>2. Warehouse Stock & Route DB (MongoDB Atlas)<br/>3. Route Optimization AI Agent<br/>4. Driver WhatsApp Alert Tool", table_cell_style),
            Paragraph("Meta Llama 3.2 11B<br/>Route recalculation & hub dispatch", table_cell_style)
        ],
        [
            Paragraph("<b>Custom Voice Requirement</b>", table_cell_style),
            Paragraph("Dynamically extracts spoken keywords to assemble matching triggers, custom collection gateways, AI workers with synthesized prompts, and delivery tools.", table_cell_style),
            Paragraph("NVIDIA NIM Dynamic<br/>Direct prompt fulfillment", table_cell_style)
        ]
    ]
    wf_table = Table(wf_scenarios, colWidths=[120, 240, 144])
    wf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#D97757")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E6E1D7")),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#FAF8F5")]),
    ]))
    story.append(wf_table)
    story.append(Spacer(1, 12))

    # =========================================================================
    # SECTION 4: VECTOR DATABASE & RETRIEVAL (MONGODB ATLAS VECTOR SEARCH)
    # =========================================================================
    story.append(Paragraph("4. Vector Database Architecture & Semantic Search", h1_style))
    story.append(Paragraph(
        "To enable semantic discovery, deduplication, and RAG knowledge retrieval, every created or edited workflow "
        "is converted into a normalized <b>384-dimensional dense vector</b> and stored in the <code>vector_store</code> "
        "collection in MongoDB Atlas.",
        body_style
    ))
    story.append(Spacer(1, 6))

    vector_points = [
        "<b>Dense Vector Projection:</b> Text (name, vertical, description, and node prompt topology) is projected into a 384-dimensional space using subword hashing, character trigram dispersion, and L2 unit-sphere normalization (||v|| = 1.0).",
        "<b>Storage Schema:</b> Documents in <code>vector_store</code> include <code>id</code> (e.g. <code>vec_proj_...</code>), <code>workflow_id</code>, <code>embedding</code> (array of 384 floats), <code>nodes_count</code>, <code>models_used</code>, and <code>status: 'Indexed & Vectorized'</code>.",
        "<b>Semantic Cosine Similarity:</b> The <code>POST /api/vector/search</code> endpoint computes dot-product cosine similarity against all indexed vectors in real time, returning percentage match rankings.",
        "<b>Interactive Vector UI:</b> In the <b>Knowledge Base</b> sidebar view, users can view all indexed records and test queries (e.g. searching 'doctor appointment' returns high similarity scores for healthcare pipelines while ignoring refund pipelines)."
    ]
    for vp in vector_points:
        story.append(Paragraph(f"• {vp}", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: DEDICATED WORKFLOW DASHBOARDS & REAL NVIDIA METRICS
    # =========================================================================
    story.append(Paragraph("5. Dedicated Workflow Dashboards & Real NVIDIA Metrics", h1_style))
    story.append(Paragraph(
        "Clicking any workflow card from the main dashboard navigates directly to a dedicated dashboard "
        "for that specific workflow, maintaining strict visual and architectural harmony:",
        body_style
    ))
    story.append(Spacer(1, 6))

    dash_points = [
        "<b>Workflow-Specific Metrics:</b> Total cost incurred (calculated in both USD and INR, e.g. INR 3.52 / $0.042), total runs, average latency, and success rate.",
        "<b>Model-Wise Breakdown:</b> Tracks exactly which foundation models are utilized in that pipeline (e.g., Meta Llama-3.2-11B vs Mistral Large vs Nemotron 70B) with token consumption.",
        "<b>Live NVIDIA Inference Playground:</b> Allows immediate prompt testing with live fallback to NVIDIA NIM API (<code>https://integrate.api.nvidia.com/v1/chat/completions</code>), returning live agent reasoning turns and token durations.",
        "<b>Direct Studio Access:</b> Seamless 'Open Studio Canvas' button transitions directly into the interactive node graph editor."
    ]
    for dp in dash_points:
        story.append(Paragraph(f"• {dp}", bullet_style))
    story.append(Spacer(1, 10))

    # =========================================================================
    # SECTION 6: COMPLETE END-TO-END OPERATIONAL WALKTHROUGH
    # =========================================================================
    story.append(Paragraph("6. Operational Walkthrough: Step-by-Step Guide", h1_style))
    story.append(Paragraph("Follow these exact steps to operate and demonstrate the live platform:", body_style))
    story.append(Spacer(1, 6))

    steps = [
        ("Step 1: Access Platform", "Open http://localhost:3000 in your browser. The Projects Dashboard displays all active enterprise workflows connected to MongoDB Atlas."),
        ("Step 2: Create Workflow via Voice", "Click '+ New Workflow'. Select vertical (or leave default). Click 'Click to Speak'. Speak requirements in Tamil, Hindi, or English (e.g., 'Book doctor appointments and send WhatsApp confirmations'). Click 'Stop & Transcribe'."),
        ("Step 3: Auto-Generated Pipeline", "Click 'Create Workflow'. The system creates the workflow in MongoDB Atlas, generates its unique tailored canvas, vectorizes it (384-dim), and opens its dedicated Workflow Dashboard."),
        ("Step 4: Inspect Metrics & Live Runs", "Review workflow token costs in INR and USD. Enter a test prompt in the Live Inference box to witness real-time NVIDIA NIM reasoning."),
        ("Step 5: Edit in Studio Canvas", "Click 'Open Studio Canvas'. Notice the 4 customized nodes tailored specifically to your requirement. Drag, configure, or connect nodes, then click 'Save Canvas' to sync changes back to MongoDB Atlas and update vector embeddings."),
        ("Step 6: Query Vector Database", "Click 'Knowledge Base' in the left navigation. View your newly created workflow indexed with its vector ID. Type search terms into the Semantic Vector Search bar to observe live cosine ranking!")
    ]

    for title, desc in steps:
        p_step = f"<b>{title}:</b> {desc}"
        story.append(Paragraph(p_step, bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 7: API ENDPOINTS SUMMARY & ENVIRONMENT CONFIGURATION
    # =========================================================================
    story.append(Paragraph("7. Key REST API Endpoints & Environment Configuration", h1_style))
    story.append(Spacer(1, 4))

    api_rows = [
        [Paragraph("HTTP Method & Route", table_header_style), Paragraph("Description", table_header_style), Paragraph("Payload / Query", table_header_style)],
        [
            Paragraph("<code>POST /api/sarvam/transcribe</code>", code_style),
            Paragraph("Uploads audio file & returns Indic speech transcript", table_cell_style),
            Paragraph("Multipart form: <code>file</code>, <code>language_code</code>", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/workflows</code>", code_style),
            Paragraph("Lists all workflows from MongoDB Atlas", table_cell_style),
            Paragraph("Header: <code>Authorization: Bearer &lt;token&gt;</code>", table_cell_style)
        ],
        [
            Paragraph("<code>POST /api/workflows</code>", code_style),
            Paragraph("Creates workflow, synthesizes canvas, stores in Vector DB", table_cell_style),
            Paragraph("JSON: <code>name</code>, <code>vertical</code>, <code>description</code>", table_cell_style)
        ],
        [
            Paragraph("<code>PUT /api/workflows/{id}</code>", code_style),
            Paragraph("Saves canvas nodes, edges, notes & syncs vector embedding", table_cell_style),
            Paragraph("JSON: <code>nodes</code>, <code>connections</code>, <code>name</code>", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/workflows/{id}/metrics</code>", code_style),
            Paragraph("Fetches workflow-specific costs, model usage & runs", table_cell_style),
            Paragraph("Path parameter: <code>workflow_id</code>", table_cell_style)
        ],
        [
            Paragraph("<code>GET /api/vector/store</code>", code_style),
            Paragraph("Lists all 384-dim vectorized workflows and documents", table_cell_style),
            Paragraph("None (Returns collection snapshot)", table_cell_style)
        ],
        [
            Paragraph("<code>POST /api/vector/search</code>", code_style),
            Paragraph("Semantic cosine similarity vector search", table_cell_style),
            Paragraph("JSON: <code>query</code>, <code>limit</code>", table_cell_style)
        ],
        [
            Paragraph("<code>POST /api/nvidia/infer</code>", code_style),
            Paragraph("Executes multi-agent reasoning turn via NVIDIA NIM", table_cell_style),
            Paragraph("JSON: <code>prompt</code>, <code>model</code>, <code>system_prompt</code>", table_cell_style)
        ]
    ]
    api_table = Table(api_rows, colWidths=[150, 184, 170])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B2826")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E6E1D7")),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#FAF8F5")]),
    ]))
    story.append(api_table)
    story.append(Spacer(1, 15))

    signoff = (
        "<b>Verification & Integrity Notice:</b> This document reflects the live code in branch <code>purvaja</code>. "
        "All services (FastAPI backend at port 8000 and Next.js frontend at port 3000) are operating live with active connections "
        "to MongoDB Atlas, Sarvam AI, and NVIDIA NIM."
    )
    story.append(Paragraph(signoff, callout_style))

    # Build the PDF using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {output_filename}")


if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(__file__), "AI_Workforce_Platform_System_Architecture_and_Working_Guide.pdf")
    build_pdf(out_path)
