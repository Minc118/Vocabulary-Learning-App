import os
import sys
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL") or "http://127.0.0.1:54321"
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_KEY:
    print("ERROR: Environment variable SUPABASE_ANON_KEY must be set to run this script.")
    print("Please set it in your environment (e.g., export SUPABASE_ANON_KEY=...)")
    sys.exit(1)

client = create_client(SUPABASE_URL, SUPABASE_KEY)
