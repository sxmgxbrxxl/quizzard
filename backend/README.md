# Quiz Generator Backend

backend/
├── venv/                          # virtual environment (auto-generated)
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI entry point
│   ├── routes/
│   │   ├── __init__.py
│   │   └── quiz_routes.py         # quiz generation routes
│   ├── services/
│   │   ├── __init__.py
│   │   └── gemini_service.py      # Gemini API logic
│   ├── utils/
│   │   ├── __init__.py
│   │   └── pdf_extractor.py       # PDF text extraction
│   └── config/
│       ├── __init__.py
│       └── settings.py            # environment config
├── uploads/                       # temporary PDF storage
├── .env                          # API keys
├── requirements.txt              # dependencies
├── .gitignore
└── README.md

FastAPI backend with Gemini AI integration for automatic quiz generation from PDFs.

## Setup

1. Create virtual environment:
```bash
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   source venv/Scripts/activate    # Windows

pip install -r requirements.txt

   ## to run the Backend
   uvicorn main:app --reload --port 8000