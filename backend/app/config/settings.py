import os
from pathlib import Path
from dotenv import load_dotenv

# Get the directory where settings.py is located
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Try to load .env from multiple possible locations
env_paths = [
    BASE_DIR / '.env',                    # Root directory
    BASE_DIR / 'backend' / '.env',        # backend folder
    Path.cwd() / '.env',                  # Current working directory
]

# Try loading from each path
env_loaded = False
for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        env_loaded = True
        break

class Settings:
    # Load API key from environment variable
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Other settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default
    
    # Production mode (less verbose logging)
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    def __init__(self):
        if self.DEBUG:
            self._debug_print()
        
        # Validate API key
        if not self.GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY not found in environment variables. "
                "Please create a .env file with GEMINI_API_KEY=your_key"
            )
        elif len(self.GEMINI_API_KEY) < 30:
            raise ValueError(
                f"GEMINI_API_KEY appears invalid (length: {len(self.GEMINI_API_KEY)}). "
                f"Expected ~39 characters."
            )
    
    def _debug_print(self):
        """Debug output - only shown when DEBUG=true"""
        print("\n" + "="*60)
        print("🔧 SETTINGS INITIALIZATION")
        print("="*60)
        
        print("\n📋 Environment Variables:")
        for key, value in os.environ.items():
            if 'GEMINI' in key.upper():
                masked = f"{value[:10]}...{value[-5:]}" if len(value) > 15 else value
                print(f"   {key} = {masked}")
        
        print(f"\n✅ Gemini API Key loaded successfully!")
        print(f"   Length: {len(self.GEMINI_API_KEY)} characters")
        print("="*60 + "\n")

# Create singleton instance
settings = Settings()