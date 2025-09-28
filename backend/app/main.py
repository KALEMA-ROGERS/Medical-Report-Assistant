from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Dict
import spacy
import re
import os
from dotenv import load_dotenv

from .database import SessionLocal, engine, Base
from .models import Report
from .translation import translate_text

# Load environment variables from .env
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)
print("[INFO] Database tables created (or already exist). If you see 'no such table' errors, delete reports.db and restart.")

app = FastAPI(title="Feyti Medical Report Assistant", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.environ.get("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def extract_drug_name(text: str) -> str:
    """Extract drug name using rule-based patterns"""
    # Pattern for drug names (typically capitalized words like "Drug X")
    drug_patterns = [
        r'Drug\s+[A-Z]',  # Matches "Drug X", "Drug Y"
        r'[A-Z][a-z]+\s*(?:[A-Z][a-z]*)*\s*\d*',  # Matches capitalized drug names
    ]
    
    for pattern in drug_patterns:
        matches = re.findall(pattern, text)
        if matches:
            return matches[0]
    
    # Fallback: look for words after "taking", "using", "administered"
    taking_pattern = r'(?:taking|using|administered)\s+([A-Za-z]+\s*[A-Za-z]*)'
    matches = re.search(taking_pattern, text, re.IGNORECASE)
    if matches:
        return matches.group(1)
    
    return "Unknown Drug"

def extract_adverse_events(text: str) -> List[str]:
    """Extract adverse events using NLP"""
    doc = nlp(text)
    adverse_events = []
    
    # Common adverse event keywords
    adverse_keywords = {
        'nausea', 'headache', 'dizziness', 'rash', 'fever', 'pain', 
        'vomiting', 'diarrhea', 'fatigue', 'insomnia', 'anxiety',
        'hypertension', 'hypotension', 'tachycardia', 'bradycardia'
    }
    
    # Extract medical conditions/symptoms
    for ent in doc.ents:
        if ent.label_ in ["SYMPTOM", "DISEASE"] or ent.text.lower() in adverse_keywords:
            adverse_events.append(ent.text.lower())
    
    # Fallback: look for words near "experienced", "reported", "symptoms"
    if not adverse_events:
        symptom_pattern = r'(?:experienced|reported|symptoms of|including)\s+([^.,]+)'
        matches = re.search(symptom_pattern, text, re.IGNORECASE)
        if matches:
            symptoms_text = matches.group(1)
            # Simple word-based extraction
            words = symptoms_text.lower().split()
            adverse_events = [word for word in words if word in adverse_keywords]
    
    return list(set(adverse_events)) if adverse_events else ["unknown symptoms"]

def determine_severity(text: str) -> str:
    """Determine severity based on keywords"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['severe', 'critical', 'life-threatening', 'emergency']):
        return "severe"
    elif any(word in text_lower for word in ['moderate', 'medium', 'significant']):
        return "moderate"
    elif any(word in text_lower for word in ['mild', 'minor', 'slight']):
        return "mild"
    else:
        return "unknown"

def determine_outcome(text: str) -> str:
    """Determine patient outcome"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['recovered', 'improved', 'resolved', 'discharged']):
        return "recovered"
    elif any(word in text_lower for word in ['fatal', 'died', 'death', 'deceased']):
        return "fatal"
    elif any(word in text_lower for word in ['ongoing', 'continuing', 'persistent', 'current']):
        return "ongoing"
    else:
        return "unknown"

@app.post("/process-report")
async def process_report(report_data: dict, db: Session = Depends(get_db)):
    """Process medical report and extract structured data"""
    try:
        report_text = report_data.get("report", "")
        
        if not report_text:
            raise HTTPException(status_code=400, detail="Report text is required")
        
        # Extract structured data
        drug = extract_drug_name(report_text)
        adverse_events = extract_adverse_events(report_text)
        severity = determine_severity(report_text)
        outcome = determine_outcome(report_text)
        
        # Save to database
        db_report = Report(
            report_text=report_text,
            drug=drug,
            adverse_events=",".join(adverse_events),
            severity=severity,
            outcome=outcome
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        response = {
            "id": db_report.id,
            "drug": drug,
            "adverse_events": adverse_events,
            "severity": severity,
            "outcome": outcome,
            "original_report": report_text
        }
        print("[DEBUG] Returning processed report:", response)
        return response
        
    except Exception as e:
        import traceback
        print("[ERROR] Exception in /process-report:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing report: {str(e)}")

@app.get("/reports")
async def get_reports(db: Session = Depends(get_db)):
    """Get all processed reports"""
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    
    return [
        {
            "id": report.id,
            "drug": report.drug,
            "adverse_events": report.adverse_events.split(","),
            "severity": report.severity,
            "outcome": report.outcome,
            "original_report": report.report_text,
            "created_at": report.created_at.isoformat()
        }
        for report in reports
    ]

@app.post("/translate")
async def translate_report(translation_data: dict):
    """Translate text to French or Swahili"""
    try:
        text = translation_data.get("text", "")
        target_lang = translation_data.get("target_lang", "fr")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text to translate is required")
        
        if target_lang not in ["fr", "sw"]:
            raise HTTPException(status_code=400, detail="Supported languages: fr (French), sw (Swahili)")
        
        translated_text = translate_text(text, target_lang)
        
        return {
            "original_text": text,
            "translated_text": translated_text,
            "target_language": "French" if target_lang == "fr" else "Swahili"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Feyti Medical Report Assistant API", "status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)