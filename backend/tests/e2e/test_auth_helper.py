import os
import sys
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from backend/.env if available
# This script can also read from root .env or shell environment variables.
load_dotenv()

API_BASE_URL = "http://127.0.0.1:5001/api"

def get_auth_token():
    email = os.environ.get("E2E_TEST_EMAIL")
    password = os.environ.get("E2E_TEST_PASSWORD")
    
    # Allow falling back to VITE_ variables if standard ones are not defined
    supabase_url = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

    if not email or not password:
        print("ERROR: Test authentication credentials are missing from the environment.", file=sys.stderr)
        print("Please ensure E2E_TEST_EMAIL and E2E_TEST_PASSWORD are set.", file=sys.stderr)
        sys.exit(1)

    if not supabase_url or not supabase_key:
        print("ERROR: Supabase URL or Anon Key is missing from the environment.", file=sys.stderr)
        print("Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.", file=sys.stderr)
        sys.exit(1)

    try:
        # Initialize Supabase client and sign in programmatically
        supabase: Client = create_client(supabase_url, supabase_key)
        session_data = supabase.auth.sign_in_with_password({"email": email, "password": password})
        
        if session_data and session_data.session:
            token = session_data.session.access_token
            # Safety check: ensure we never log/print the raw token
            print("INFO: Programmatic authentication successful. Token obtained in memory.", flush=True)
            return token
        else:
            print("ERROR: Supabase auth sign-in succeeded but returned no session.", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"ERROR: Failed programmatically to authenticate with Supabase: {str(e)}", file=sys.stderr)
        sys.exit(1)

def make_api_request(method, path, token, data=None):
    url = f"{API_BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
    
    if token:
        # Securely pass the in-memory token via the standard Bearer header
        req.add_header('Authorization', f"Bearer {token}")
        
    if data:
        json_data = json.dumps(data).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.data = json_data
        
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 0, str(e)
