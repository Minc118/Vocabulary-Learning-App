import os
from dotenv import load_dotenv

load_dotenv()
class Config:
    FLASK_HOST = os.getenv("FLASK_HOST", "127.0.0.1")
    FLASK_PORT = int(os.getenv("PORT") or os.getenv("FLASK_PORT") or "5001")
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    
    # Prioritized key selection
    _pub_key = os.getenv("SUPABASE_PUBLISHABLE_KEY")
    _anon_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
    _fallback_key = os.getenv("SUPABASE_KEY")
    
    if _pub_key:
        SUPABASE_KEY = _pub_key
        SUPABASE_KEY_SOURCE = "SUPABASE_PUBLISHABLE_KEY"
    elif _anon_key:
        SUPABASE_KEY = _anon_key
        SUPABASE_KEY_SOURCE = "SUPABASE_ANON_KEY"
    else:
        SUPABASE_KEY = _fallback_key
        SUPABASE_KEY_SOURCE = "SUPABASE_KEY"
    
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
