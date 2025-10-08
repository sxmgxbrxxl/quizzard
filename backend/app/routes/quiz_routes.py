from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
from app.config.settings import settings
from app.utils.pdf_extractor import extract_text_from_pdf
from app.services.gemini_service import generate_quiz_from_text, format_quiz_for_frontend

router = APIRouter()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/generate-from-pdf")
async def generate_quiz_from_pdf(
    file: UploadFile = File(...),
    title: str = Form("Generated Quiz"),
    num_multiple_choice: int = Form(5),
    num_true_false: int = Form(5),
    num_identification: int = Form(5)
):
    """
    Generate quiz from uploaded PDF using Gemini AI.
    """
    file_path = None
    try:
        # Validate file type
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Save uploaded file
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if not extracted_text:
            raise HTTPException(status_code=400, detail="Failed to extract text from PDF")
        
        # Generate quiz using Gemini
        quiz_data = generate_quiz_from_text(
            extracted_text,
            num_multiple_choice,
            num_true_false,
            num_identification
        )
        
        # Format for frontend
        formatted_quiz = format_quiz_for_frontend(quiz_data, title)
        
        return JSONResponse(content={
            "success": True,
            "quiz": formatted_quiz,
            "message": "Quiz generated successfully"
        })
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error generating quiz: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e)
            }
        )
    finally:
        # Clean up uploaded file
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "quiz-generator"}