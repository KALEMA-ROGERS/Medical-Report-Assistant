import pytest
import httpx
import asyncio
import json
import os
from typing import Dict, Any

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_FILES_DIR = "test_files"

class TestFeytiMedicalAPI:
    """Test suite for Feyti Medical Report Assistant API"""
    
    def setup_method(self):
        """Setup test environment"""
        self.client = httpx.AsyncClient(base_url=BASE_URL)
        self.test_report_id = None
    
    def teardown_method(self):
        """Cleanup after tests"""
        if hasattr(self, 'client'):
            asyncio.run(self.client.aclose())
    
    @pytest.mark.asyncio
    async def test_health_check(self):
        """Test the health check endpoint"""
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "timestamp" in data
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        """Test the root endpoint"""
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.get("/")
            assert response.status_code == 200
            data = response.json()
            assert "message" in data
            assert "version" in data
    
    @pytest.mark.asyncio
    async def test_upload_text_file(self):
        """Test uploading a text medical report"""
        # Create a sample medical report
        sample_text = """
        Patient Name: John Doe
        Age: 45
        Gender: Male
        Date: 2023-12-01
        
        Chief Complaint: Chest pain and shortness of breath
        
        Diagnosis: Acute myocardial infarction
        
        Treatment: 
        - Aspirin 325mg daily
        - Lisinopril 10mg daily
        - Atorvastatin 40mg daily
        
        Recommendations: Follow up in 2 weeks
        """
        
        # Create temporary test file
        test_file_path = "test_medical_report.txt"
        with open(test_file_path, "w") as f:
            f.write(sample_text)
        
        try:
            async with httpx.AsyncClient(base_url=BASE_URL) as client:
                with open(test_file_path, "rb") as f:
                    files = {"file": ("test_report.txt", f, "text/plain")}
                    response = await client.post("/upload-report", files=files)
                
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "success"
                assert data["filename"] == "test_report.txt"
                assert "id" in data
                assert "extracted_text" in data
                assert "processed_data" in data
                
                # Store report ID for other tests
                self.test_report_id = data["id"]
        
        finally:
            # Cleanup test file
            if os.path.exists(test_file_path):
                os.remove(test_file_path)
    
    @pytest.mark.asyncio
    async def test_upload_invalid_file_type(self):
        """Test uploading an invalid file type"""
        # Create a test image file
        test_file_path = "test_image.jpg"
        with open(test_file_path, "wb") as f:
            f.write(b"fake image content")
        
        try:
            async with httpx.AsyncClient(base_url=BASE_URL) as client:
                with open(test_file_path, "rb") as f:
                    files = {"file": ("test_image.jpg", f, "image/jpeg")}
                    response = await client.post("/upload-report", files=files)
                
                assert response.status_code == 400
                data = response.json()
                assert "Invalid file type" in data["detail"]
        
        finally:
            if os.path.exists(test_file_path):
                os.remove(test_file_path)
    
    @pytest.mark.asyncio
    async def test_translation_endpoint(self):
        """Test the translation endpoint"""
        translation_request = {
            "text": "The patient has been diagnosed with hypertension and requires medication.",
            "target_language": "fr",
            "source_language": "en"
        }
        
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.post("/translate", json=translation_request)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["original_text"] == translation_request["text"]
            assert data["source_language"] == "en"
            assert data["target_language"] == "fr"
            assert "translated_text" in data
    
    @pytest.mark.asyncio
    async def test_translation_empty_text(self):
        """Test translation with empty text"""
        translation_request = {
            "text": "",
            "target_language": "fr"
        }
        
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.post("/translate", json=translation_request)
            assert response.status_code == 400
            data = response.json()
            assert "Text cannot be empty" in data["detail"]
    
    @pytest.mark.asyncio
    async def test_get_reports(self):
        """Test retrieving all reports"""
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.get("/reports")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
    
    @pytest.mark.asyncio
    async def test_get_reports_with_pagination(self):
        """Test retrieving reports with pagination"""
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.get("/reports?limit=5&offset=0")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) <= 5
    
    @pytest.mark.asyncio
    async def test_get_nonexistent_report(self):
        """Test retrieving a non-existent report"""
        fake_id = "nonexistent-report-id"
        async with httpx.AsyncClient(base_url=BASE_URL) as client:
            response = await client.get(f"/reports/{fake_id}")
            assert response.status_code == 404
            data = response.json()
            assert "Report not found" in data["detail"]


class TestMedicalTextProcessing:
    """Test medical text processing functions"""
    
    def test_patient_info_extraction(self):
        """Test patient information extraction"""
        from app.utils import extract_patient_info
        
        sample_text = """
        Patient Name: Jane Smith
        Age: 32
        Gender: Female
        DOB: 01/15/1991
        """
        
        patient_info = extract_patient_info(sample_text)
        assert patient_info["name"] == "Jane Smith"
        assert patient_info["age"] == "32"
        assert patient_info["gender"] == "Female"
        assert patient_info["date_of_birth"] == "01/15/1991"
    
    def test_medication_extraction(self):
        """Test medication extraction"""
        from app.utils import extract_medications
        
        sample_text = """
        Medications: Aspirin 325mg daily, Lisinopril 10mg daily
        Patient is taking ibuprofen for pain relief.
        """
        
        medications = extract_medications(sample_text)
        assert len(medications) > 0
        
        # Check if common medications are found
        medication_texts = [med["text"].lower() for med in medications]
        assert any("aspirin" in text for text in medication_texts)
        assert any("ibuprofen" in text for text in medication_texts)
    
    def test_diagnosis_extraction(self):
        """Test diagnosis extraction"""
        from app.utils import extract_diagnoses
        
        sample_text = """
        Primary Diagnosis: Type 2 Diabetes Mellitus
        Secondary Diagnosis: Hypertension
        Patient diagnosed with chronic kidney disease.
        """
        
        diagnoses = extract_diagnoses(sample_text)
        assert len(diagnoses) > 0
        
        diagnosis_texts = [diag["text"].lower() for diag in diagnoses]
        assert any("diabetes" in text for text in diagnosis_texts)


class TestTranslationServices:
    """Test translation functionality"""
    
    def test_language_detection(self):
        """Test language detection"""
        from app.translation import detect_language
        
        english_text = "The patient has been diagnosed with diabetes and needs medication."
        detected_lang = detect_language(english_text)
        assert detected_lang == "en"
    
    def test_supported_languages(self):
        """Test supported languages"""
        from app.translation import get_supported_languages, validate_language_code
        
        languages = get_supported_languages()
        assert isinstance(languages, dict)
        assert "en" in languages
        assert "fr" in languages
        assert "es" in languages
        
        assert validate_language_code("en") is True
        assert validate_language_code("xyz") is False
    
    def test_mock_translation(self):
        """Test mock translation function"""
        from app.translation import mock_translate
        
        text = "The patient needs treatment."
        translated = mock_translate(text, "fr", "en")
        
        assert translated is not None
        assert len(translated) > len(text)  # Should include language prefix


def run_performance_tests():
    """Run performance tests"""
    import time
    
    print("Running performance tests...")
    
    # Test file processing speed
    from app.utils import process_medical_file
    
    sample_text = """
    Patient Name: Test Patient
    Age: 50
    Diagnosis: Hypertension, Type 2 Diabetes
    Medications: Metformin, Lisinopril, Aspirin
    """ * 100  # Repeat to make it larger
    
    start_time = time.time()
    result = process_medical_file(sample_text)
    end_time = time.time()
    
    processing_time = end_time - start_time
    print(f"Medical text processing time: {processing_time:.2f} seconds")
    
    assert processing_time < 5.0, "Processing took too long"
    assert result is not None


if __name__ == "__main__":
    # Run basic functionality tests
    print("Starting Feyti Medical Report Assistant API Tests")
    
    # Run performance tests
    run_performance_tests()
    
    # Run pytest for comprehensive testing
    print("\nRunning comprehensive tests with pytest...")
    pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--asyncio-mode=auto"
    ])