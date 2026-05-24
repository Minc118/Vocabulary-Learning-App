import sys
import os
import json
import urllib.request
import urllib.error
from supabase import create_client, Client

# We targets Supabase Cloud for real credentials test in this scripted verify script.
# This script will log in via signInWithPassword, get a token, and run e2e API verification on the running Flask backend.

API_BASE_URL = "http://127.0.0.1:5001/api"
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Environment variables SUPABASE_URL and SUPABASE_ANON_KEY must be set to run this script.")
    print("Please set them in your environment (e.g., export SUPABASE_URL=... and export SUPABASE_ANON_KEY=...)")
    sys.exit(1)

EMAIL = "tester@voca.com"
PASSWORD = "voca_dev_password"

def get_auth_token():
    print(f"-> Authenticating with Supabase Cloud ({SUPABASE_URL}) for user: {EMAIL}...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        session_data = supabase.auth.sign_in_with_password({"email": EMAIL, "password": PASSWORD})
        if session_data and session_data.session:
            token = session_data.session.access_token
            print("OK. Successfully authenticated.")
            return token
        else:
            print("FAILED: No session returned from Supabase Auth.")
            return None
    except Exception as e:
        print(f"FAILED to authenticate with Supabase Cloud: {str(e)}")
        return None

def make_api_request(method, path, token, data=None):
    url = f"{API_BASE_URL}{path}"
    req = urllib.request.Request(url, method=method)
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

def run_e2e_tests():
    token = get_auth_token()
    if not token:
        print("CRITICAL: Skipping API tests due to authentication failure.")
        sys.exit(1)

    print("\n========================================")
    # Test 1: Unauthenticated request should block with 401
    print("Testing Unauthenticated request...")
    req = urllib.request.Request(f"{API_BASE_URL}/words", method="GET")
    try:
        urllib.request.urlopen(req)
        print("FAILED: Unauthenticated request succeeded!")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        if e.code == 401:
            print("OK. Unauthenticated request rejected with 401.")
        else:
            print(f"FAILED: Expected 401 but got {e.code}")
            sys.exit(1)

    # Test 2: Health check (no auth needed)
    print("\nTesting Health check endpoint...")
    req_health = urllib.request.Request(f"{API_BASE_URL}/health", method="GET")
    try:
        with urllib.request.urlopen(req_health) as res:
            body = json.loads(res.read().decode('utf-8'))
            if body.get('ok') is True:
                print("OK. Health check passes.")
            else:
                print(f"FAILED: Health check returned {body}")
                sys.exit(1)
    except Exception as e:
        print(f"FAILED: Health check failed: {str(e)}")
        sys.exit(1)

    # Test 3: Create Word
    print("\n========================================")
    print("Testing Vocabulary CRUD Flow")
    print("========================================")
    print("-> Adding a new word...")
    word_data = {
        "word": "resilient",
        "language": "English",
        "translation": "有韧性的，适应力强的",
        "pos": "adjective",
        "source": "E2E Test Script",
        "definition": "Able to withstand or recover quickly from difficult conditions.",
        "examples": [{"sentence": "Local businesses have proven resilient in the face of economic challenges.", "translation": "面对经济挑战，当地企业已被证明极具韧性。"}],
        "collocations": ["resilient system", "resilient nature"],
        "synonyms": ["strong", "tough", "buoyant"],
        "relatedWords": ["elastic", "rebound"]
    }

    status, res = make_api_request("POST", "/words", token, word_data)
    if status != 201:
        print(f"FAILED to add word (code {status}): {res}")
        sys.exit(1)
    
    word_id = res.get('id')
    print(f"OK. Added word '{res.get('word')}' with ID: {word_id}")

    # Test 4: Retrieve List
    print("-> Checking vocabulary list...")
    status, res = make_api_request("GET", "/words", token)
    if status != 200:
        print(f"FAILED GET /words: {res}")
        sys.exit(1)
    words = res.get('items', [])
    if not any(w['id'] == word_id for w in words):
        print("FAILED: Added word not found in the list.")
        sys.exit(1)
    print(f"OK. Word is present in the list of {len(words)} words.")

    # Test 5: Word Detail
    print("-> Fetching word details...")
    status, detail = make_api_request("GET", f"/words/{word_id}", token)
    if status != 200:
        print(f"FAILED to fetch word details: {detail}")
        sys.exit(1)
    print(f"OK. Retrieved word detail for: {detail.get('word')}")

    # Test 6: Edit Word
    print("-> Editing word...")
    edit_data = {
        "word": "resilient",
        "translation": "有弹性的，极具韧性的",
        "pos": "adjective",
        "language": "English"
    }
    status, res = make_api_request("PUT", f"/words/{word_id}", token, edit_data)
    if status != 200:
        print(f"FAILED to edit word: {res}")
        sys.exit(1)
    print("OK. Word updated successfully.")

    # Test 7: Verify Edit
    print("-> Verifying edit in details...")
    status, detail = make_api_request("GET", f"/words/{word_id}", token)
    if detail.get('translation') != edit_data['translation']:
        print(f"FAILED: Edit was not saved correctly. Expected '{edit_data['translation']}', got '{detail.get('translation')}'")
        sys.exit(1)
    print("OK. Edit verified.")

    # Test 8: AI Enrichment
    print("\n========================================")
    print("Testing AI Enrichment Flow")
    print("========================================")
    print("-> Requesting AI enrichment for 'nuanced'...")
    enrich_payload = {
        "word": "nuanced",
        "language": "English",
        "native_language": "Chinese"
    }
    status, res = make_api_request("POST", "/ai/enrich", token, enrich_payload)
    if status != 200:
        print(f"FAILED to enrich word: {res}")
        sys.exit(1)
    print(f"OK. AI successfully enriched 'nuanced':")
    print(f"  - Part of Speech: {res.get('pos')}")
    print(f"  - Translation: {res.get('translation')}")
    print(f"  - Definition: {res.get('definition')}")
    
    # Test 9: Review Queue & Session
    print("\n========================================")
    print("Testing Review System Flow")
    print("========================================")
    print("-> Fetching review queue...")
    status, res = make_api_request("GET", "/review/queue?limit=10", token)
    if status != 200:
        print(f"FAILED to fetch review queue: {res}")
        sys.exit(1)
    queue = res.get('items', [])
    print(f"OK. Review queue contains {len(queue)} items.")

    # Test 10: Delete Word
    print("\n========================================")
    print("Testing Vocabulary Deletion Flow")
    print("========================================")
    print("-> Deleting test word...")
    status, res = make_api_request("DELETE", f"/words/{word_id}", token)
    if status not in (200, 204):
        print(f"FAILED to delete word: {res}")
        sys.exit(1)
    print("OK. Word deleted successfully.")

    # Test 11: Verify Deletion
    print("-> Verifying deletion...")
    status, res = make_api_request("GET", f"/words/{word_id}", token)
    if status == 200:
        print("FAILED: Word still exists after deletion!")
        sys.exit(1)
    print("OK. Deletion verified. Word is completely removed.")

    print("\nSUCCESS: All automated End-to-End API verification tests passed successfully!")

if __name__ == "__main__":
    run_e2e_tests()
