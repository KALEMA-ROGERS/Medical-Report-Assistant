import io
import re
import logging
from typing import Dict, List, Any, Optional
import PyPDF2
import docx
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)


def extract_text_from_file(file_content: bytes, content_type: str) -> str:
    """
    Extract text from various file formats
    Supports PDF, DOC, DOCX, and TXT files
    """
    try:
        if content_type == "application/pdf":
            return extract_text_from_pdf(file_content)
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return extract_text_from_docx(file_content)
        elif content_type == "application/msword":
            # For .doc files, you might need python-docx2txt or similar
            # For now, we'll treat it as plain text
            return file_content.decode('utf-8', errors='ignore')
        elif content_type == "text/plain":
            return file_content.decode('utf-8', errors='ignore')
        else:
            raise ValueError(f"Unsupported file type: {content_type}")
    
    except Exception as e:
        logger.error(f"Error extracting text from file: {str(e)}")
        raise


def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = io.BytesIO(file_content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        return text.strip()
    
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        raise


def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    try:
        doc_file = io.BytesIO(file_content)
        doc = docx.Document(doc_file)
        
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        
        return text.strip()
    
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {str(e)}")
        raise


def process_medical_file(text: str) -> Dict[str, Any]:
    """
    Process extracted text and identify medical entities
    This is a simplified version - in production, you'd use NLP libraries like spaCy or BERT models
    """
    try:
        processed_data = {
            "patient_info": extract_patient_info(text),
            "diagnoses": extract_diagnoses(text),
            "medications": extract_medications(text),
            "symptoms": extract_symptoms(text),
            "procedures": extract_procedures(text),
            "lab_results": extract_lab_results(text),
            "summary": generate_summary(text),
            "key_findings": extract_key_findings(text),
            "recommendations": extract_recommendations(text),
            "processed_at": datetime.now().isoformat(),
            "text_hash": generate_text_hash(text)
        }
        
        return processed_data
    
    except Exception as e:
        logger.error(f"Error processing medical file: {str(e)}")
        raise


def extract_patient_info(text: str) -> Dict[str, str]:
    """Extract patient information from text"""
    patient_info = {}
    
    # Extract patient name (simple pattern matching)
    name_patterns = [
        r"Patient Name:?\s*([A-Za-z\s]+)",
        r"Name:?\s*([A-Za-z\s]+)",
        r"Patient:?\s*([A-Za-z\s]+)"
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            patient_info["name"] = match.group(1).strip()
            break
    
    # Extract age
    age_patterns = [
        r"Age:?\s*(\d+)",
        r"(\d+)\s*years?\s*old",
        r"(\d+)\s*y/?o"
    ]
    
    for pattern in age_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            patient_info["age"] = match.group(1).strip()
            break
    
    # Extract gender
    gender_patterns = [
        r"Gender:?\s*(Male|Female|M|F)",
        r"Sex:?\s*(Male|Female|M|F)"
    ]
    
    for pattern in gender_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            gender = match.group(1).strip().upper()
            if gender in ["M", "MALE"]:
                patient_info["gender"] = "Male"
            elif gender in ["F", "FEMALE"]:
                patient_info["gender"] = "Female"
            break
    
    # Extract date of birth
    dob_patterns = [
        r"DOB:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        r"Date of Birth:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        r"Born:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"
    ]
    
    for pattern in dob_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            patient_info["date_of_birth"] = match.group(1).strip()
            break
    
    return patient_info


def extract_diagnoses(text: str) -> List[Dict[str, Any]]:
    """Extract medical diagnoses from text"""
    diagnoses = []
    
    # Common diagnosis patterns
    diagnosis_patterns = [
        r"Diagnosis:?\s*([^.\n]+)",
        r"Diagnosed with:?\s*([^.\n]+)",
        r"Condition:?\s*([^.\n]+)",
        r"Primary Diagnosis:?\s*([^.\n]+)",
        r"Secondary Diagnosis:?\s*([^.\n]+)"
    ]
    
    for pattern in diagnosis_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            diagnosis_text = match.group(1).strip()
            if diagnosis_text and len(diagnosis_text) > 3:
                diagnoses.append({
                    "text": diagnosis_text,
                    "type": "diagnosis",
                    "start_pos": match.start(),
                    "end_pos": match.end(),
                    "confidence": 0.8
                })
    
    return diagnoses


def extract_medications(text: str) -> List[Dict[str, Any]]:
    """Extract medications from text"""
    medications = []
    
    # Common medication patterns
    medication_patterns = [
        r"Medications?:?\s*([^.\n]+)",
        r"Prescribed:?\s*([^.\n]+)",
        r"Taking:?\s*([^.\n]+)",
        r"Rx:?\s*([^.\n]+)"
    ]
    
    # Common medication names (simplified list)
    common_medications = [
        "aspirin", "ibuprofen", "acetaminophen", "metformin", "lisinopril",
        "atorvastatin", "omeprazole", "amlodipine", "levothyroxine", "albuterol"
    ]
    
    for pattern in medication_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            med_text = match.group(1).strip()
            medications.append({
                "text": med_text,
                "type": "medication",
                "start_pos": match.start(),
                "end_pos": match.end(),
                "confidence": 0.7
            })
    
    # Look for specific medication names
    for med_name in common_medications:
        pattern = rf"\b{re.escape(med_name)}\b"
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            medications.append({
                "text": match.group(0),
                "type": "medication",
                "start_pos": match.start(),
                "end_pos": match.end(),
                "confidence": 0.9
            })
    
    return medications


def extract_symptoms(text: str) -> List[Dict[str, Any]]:
    """Extract symptoms from text"""
    symptoms = []
    
    # Common symptom patterns
    symptom_patterns = [
        r"Symptoms?:?\s*([^.\n]+)",
        r"Complaints?:?\s*([^.\n]+)",
        r"Presenting with:?\s*([^.\n]+)",
        r"Chief Complaint:?\s*([^.\n]+)"
    ]
    
    # Common symptoms
    common_symptoms = [
        "fever", "cough", "headache", "nausea", "vomiting", "diarrhea",
        "fatigue", "dizziness", "chest pain", "shortness of breath",
        "abdominal pain", "back pain", "joint pain", "rash"
    ]
    
    for pattern in symptom_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            symptom_text = match.group(1).strip()
            symptoms.append({
                "text": symptom_text,
                "type": "symptom",
                "start_pos": match.start(),
                "end_pos": match.end(),
                "confidence": 0.7
            })
    
    # Look for specific symptoms
    for symptom in common_symptoms:
        pattern = rf"\b{re.escape(symptom)}\b"
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            symptoms.append({
                "text": match.group(0),
                "type": "symptom",
                "start_pos": match.start(),
                "end_pos": match.end(),
                "confidence": 0.8
            })
    
    return symptoms


def extract_procedures(text: str) -> List[Dict[str, Any]]:
    """Extract medical procedures from text"""
    procedures = []
    
    # Common procedure patterns
    procedure_patterns = [
        r"Procedure:?\s*([^.\n]+)",
        r"Surgery:?\s*([^.\n]+)",
        r"Operation:?\s*([^.\n]+)",
        r"Treatment:?\s*([^.\n]+)"
    ]
    
    for pattern in procedure_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            procedure_text = match.group(1).strip()
            procedures.append({
                "text": procedure_text,
                "type": "procedure",
                "start_pos": match.start(),
                "end_pos": match.end(),
                "confidence": 0.8
            })
    
    return procedures


def extract_lab_results(text: str) -> Dict[str, Any]:
    """Extract laboratory results from text"""
    lab_results = {}
    
    # Common lab value patterns
    lab_patterns = [
        (r"Blood Pressure:?\s*(\d+/\d+)", "blood_pressure"),
        (r"Temperature:?\s*(\d+\.?\d*)", "temperature"),
        (r"Heart Rate:?\s*(\d+)", "heart_rate"),
        (r"Weight:?\s*(\d+\.?\d*)", "weight"),
        (r"Height:?\s*(\d+\.?\d*)", "height"),
        (r"BMI:?\s*(\d+\.?\d*)", "bmi")
    ]
    
    for pattern, key in lab_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            lab_results[key] = match.group(1).strip()
    
    return lab_results


def extract_key_findings(text: str) -> List[str]:
    """Extract key medical findings"""
    findings = []
    
    # Look for sections that might contain findings
    finding_patterns = [
        r"Findings?:?\s*([^.\n]+)",
        r"Results?:?\s*([^.\n]+)",
        r"Impression:?\s*([^.\n]+)",
        r"Assessment:?\s*([^.\n]+)"
    ]
    
    for pattern in finding_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            finding_text = match.group(1).strip()
            if finding_text and len(finding_text) > 10:
                findings.append(finding_text)
    
    return findings


def extract_recommendations(text: str) -> List[str]:
    """Extract medical recommendations"""
    recommendations = []
    
    # Look for recommendation sections
    rec_patterns = [
        r"Recommendations?:?\s*([^.\n]+)",
        r"Plan:?\s*([^.\n]+)",
        r"Follow[- ]?up:?\s*([^.\n]+)",
        r"Next Steps?:?\s*([^.\n]+)"
    ]
    
    for pattern in rec_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            rec_text = match.group(1).strip()
            if rec_text and len(rec_text) > 5:
                recommendations.append(rec_text)
    
    return recommendations


def generate_summary(text: str) -> str:
    """Generate a simple summary of the medical report"""
    # This is a very basic summary generator
    # In production, you'd use more sophisticated NLP techniques
    
    lines = text.split('\n')
    important_lines = []
    
    keywords = [
        'diagnosis', 'diagnosed', 'condition', 'symptoms', 'treatment',
        'medication', 'prescribed', 'findings', 'results', 'impression',
        'recommendation', 'plan', 'follow-up'
    ]
    
    for line in lines:
        line = line.strip()
        if len(line) > 20:  # Skip very short lines
            for keyword in keywords:
                if keyword.lower() in line.lower():
                    important_lines.append(line)
                    break
    
    # Take first few important lines as summary
    summary_lines = important_lines[:3]
    
    if summary_lines:
        return ' '.join(summary_lines)
    else:
        # Fallback: take first few lines of the document
        first_lines = [line.strip() for line in lines[:3] if line.strip()]
        return ' '.join(first_lines)


def generate_text_hash(text: str) -> str:
    """Generate a hash of the text for deduplication"""
    return hashlib.md5(text.encode('utf-8')).hexdigest()


def sanitize_text(text: str) -> str:
    """Clean and sanitize extracted text"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters that might cause issues
    text = re.sub(r'[^\w\s\-.,;:()/?!]', '', text)
    
    return text.strip()


def validate_file_size(file_content: bytes, max_size_mb: int = 10) -> bool:
    """Validate file size"""
    file_size_mb = len(file_content) / (1024 * 1024)
    return file_size_mb <= max_size_mb