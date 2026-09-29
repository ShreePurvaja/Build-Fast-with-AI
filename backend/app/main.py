from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import intake, workforces, tools, runtime, escalations, knowledge, analytics

app = FastAPI(
    title="AI Workforce Platform - Modular API Service",
    version="1.0.0",
    description="Clean modular backend API supporting requirement intake, workforce generator, tool gateway, multi-agent runtime, human escalations, knowledge base, and telemetry."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Modular Routers
app.include_router(intake.router)
app.include_router(workforces.router)
app.include_router(tools.router)
app.include_router(runtime.router)
app.include_router(escalations.router)
app.include_router(knowledge.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Workforce Platform Modular API",
        "theme_mode": "light_only",
        "allowed_colors": "emerald_teal_amber_slate",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
