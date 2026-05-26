import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

# Load environment variables
load_dotenv()

app = FastAPI(title="OpsTwin AI Backend", version="1.0.0")

# Enable CORS for the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")
    return genai.Client(api_key=api_key)

# Input Schemas
class WeeklyMetricSchema(BaseModel):
    week: int
    demandUnits: int
    fulfilledUnits: int
    lostSalesUnits: int
    serviceLevel: float
    revenue: float
    grossMargin: float
    holdingCost: float
    expediteCost: float
    operatingCost: float
    profit: float
    cashBalance: float
    inventoryUnits: int
    inventoryValue: float
    stockoutIncidents: int
    delayDays: int
    riskScore: float
    dataQualityScore: float
    carbonIndex: float

class DecisionSchema(BaseModel):
    id: str
    type: str
    name: str
    week: int
    intensity: float
    description: str

class EventSchema(BaseModel):
    id: str
    type: str
    name: str
    week: int
    durationWeeks: int
    severity: float
    targetId: Optional[str] = None
    description: str

class ChatPayload(BaseModel):
    currentPlayWeek: int
    prompt: str
    metrics: List[WeeklyMetricSchema]
    decisions: List[DecisionSchema]
    events: List[EventSchema]

class SqlPayload(BaseModel):
    question: str

@app.get("/api/status")
def get_status():
    api_configured = bool(os.getenv("GEMINI_API_KEY"))
    return {
        "status": "online",
        "api_configured": api_configured
    }

@app.post("/api/chat")
async def chat_diagnostics(payload: ChatPayload):
    try:
        client = get_gemini_client()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Format context for system prompt
    latest_metrics = payload.metrics[-1] if payload.metrics else None
    
    system_instruction = f"""You are an expert Operations and Supply Chain Management AI Co-pilot running on the "OpsTwin Control Tower" dashboard.
Your job is to diagnose supply chain disruptions and offer tactical recommendations based on active telemetry.

Here is the active simulation context up to week {payload.currentPlayWeek}:
- Metric Summary of latest active week: {latest_metrics.model_dump() if latest_metrics else "No metrics yet"}
- Active/Historical Decisions Playbook: {[d.model_dump() for d in payload.decisions]}
- Disruption Events scheduled: {[e.model_dump() for e in payload.events]}

Instructions:
1. Auditing the telemetry history: reference specific metrics (Service Level, Profit, Stockouts, Risk, Cash).
2. Pinpoint issues chronologically (e.g. "By Week 6, logistics failures started causing...").
3. Suggest concrete playbook responses (e.g. increase safety stock, expedite shipping, diversify suppliers).
4. Be concise (2-4 sentences), professional, direct, and actionable. Do not use generic pleasantries or filler words.
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=payload.prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.3,
                max_output_tokens=300
            )
        )
        return {"text": response.text.strip()}
    except APIError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.post("/api/generate-sql")
async def generate_sql(payload: SqlPayload):
    try:
        client = get_gemini_client()
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    system_instruction = """You are a translation assistant that converts natural language operations queries into valid ANSI SQL for a DuckDB database.

Available Tables and Columns:
1. Table `weekly_metrics`:
   - week: integer (1 to 26)
   - demandUnits: integer
   - fulfilledUnits: integer
   - lostSalesUnits: integer
   - serviceLevel: double (0 to 100)
   - revenue: double
   - grossMargin: double
   - holdingCost: double
   - expediteCost: double
   - operatingCost: double
   - profit: double (can be negative)
   - cashBalance: double
   - inventoryUnits: integer
   - inventoryValue: double
   - stockoutIncidents: integer
   - delayDays: integer
   - riskScore: double (0 to 100)
   - dataQualityScore: double (0 to 100)
   - carbonIndex: double

2. Table `scenario_events`:
   - week: integer
   - name: varchar
   - type: varchar ('demand_spike', 'supplier_delay', 'logistics_failure', 'warehouse_capacity', 'cash_constraint', 'data_quality')
   - severity: double (0 to 1.0)
   - durationWeeks: integer
   - targetId: varchar
   - description: varchar

3. Table `decisions`:
   - week: integer
   - name: varchar
   - type: varchar ('increase_safety_stock', 'diversify_supplier', 'expedite_shipping', 'warehouse_rebalance', 'demand_shaping')
   - intensity: double
   - description: varchar

Strict Rules:
- Return ONLY the raw SQL query string. 
- Do NOT wrap it in markdown code blocks like ```sql or ```. No explanations, no comments.
- Keep the SQL query simple, correct, and compatible with standard DuckDB.
"""

    prompt = f"Convert this query to SQL: {payload.question}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                max_output_tokens=150
            )
        )
        sql_query = response.text.strip()
        # Clean any accidental markdown code blocks if the model ignored instructions
        if sql_query.startswith("```"):
            sql_query = sql_query.split("\n", 1)[1]
        if sql_query.endswith("```"):
            sql_query = sql_query.rsplit("\n", 1)[0]
        return {"sql": sql_query.strip()}
    except APIError as e:
        raise HTTPException(status_code=502, detail=f"Gemini API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
