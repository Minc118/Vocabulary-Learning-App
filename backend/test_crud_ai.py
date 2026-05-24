import sys
import json
import urllib.request
import urllib.error

# Focused CRUD + AI Verification Script
# This script targets the running Flask backend (port 5001) and requires an active JWT token.

API_BASE_URL = "http://127.0.0.1:5001/api"

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

def run_verify(token):
    print("========================================")
    print("STARTING FOCUSED CRUD + AI VERIFICATION")
    print("========================================")

    # 1. AI Enrichment
    print("\n[Step 1] Requesting AI enrichment for 'Zusammenarbeit' (German)...")
    enrich_payload = {
        "word": "Zusammenarbeit",
        "language": "German",
        "native_language": "Chinese"
    }
    status, enrich_res = make_api_request("POST", "/ai/enrich", token, enrich_payload)
    if status != 200:
        print(f"FAILED AI enrichment (code {status}): {enrich_res}")
        sys.exit(1)
    
    print("OK. AI Enrichment response received successfully:")
    print(f"  - Translation: {enrich_res.get('translation')}")
    print(f"  - Part of Speech: {enrich_res.get('pos')}")
    print(f"  - Definition: {enrich_res.get('definition')}")
    print(f"  - Examples count: {len(enrich_res.get('examples', []))}")
    print(f"  - Collocations count: {len(enrich_res.get('collocations', []))}")

    # 2. Save the word
    print("\n[Step 2] Saving the enriched word to the vocabulary list...")
    word_payload = {
        "word": "Zusammenarbeit",
        "language": "German",
        "translation": enrich_res.get("translation", "合作"),
        "pos": enrich_res.get("pos", "Noun"),
        "source": "E2E AI Test",
        "definition": enrich_res.get("definition", ""),
        "examples": enrich_res.get("examples", []),
        "collocations": enrich_res.get("collocations", []),
        "synonyms": enrich_res.get("synonyms", [])
    }
    status, save_res = make_api_request("POST", "/words", token, word_payload)
    if status != 201:
        print(f"FAILED saving word (code {status}): {save_res}")
        sys.exit(1)
    
    word_id = save_res.get("id")
    print(f"OK. Word successfully saved. Database ID: {word_id}")

    # 3. Retrieve list and verify existence
    print("\n[Step 3] Querying vocabulary list to verify existence...")
    status, list_res = make_api_request("GET", "/words", token)
    if status != 200:
        print(f"FAILED fetching vocabulary list (code {status}): {list_res}")
        sys.exit(1)
    
    words = list_res.get("items", [])
    if not any(w["id"] == word_id for w in words):
        print("FAILED: Saved word is not present in the vocabulary list.")
        sys.exit(1)
    print(f"OK. Word found in the list of {len(words)} total items.")

    # 4. Fetch details
    print("\n[Step 4] Fetching word details by ID...")
    status, detail_res = make_api_request("GET", f"/words/{word_id}", token)
    if status != 200:
        print(f"FAILED fetching word details (code {status}): {detail_res}")
        sys.exit(1)
    
    print("OK. Successfully retrieved detailed word record:")
    print(f"  - Word: {detail_res.get('word')}")
    print(f"  - Definition: {detail_res.get('definition')}")
    print(f"  - Saved Examples: {len(detail_res.get('examples', []))}")
    print(f"  - Saved Collocations: {len(detail_res.get('collocations', []))}")

    # 5. Edit word
    print("\n[Step 5] Editing the word's translation details...")
    edit_payload = {
        "word": "Zusammenarbeit",
        "translation": "密切合作 (Close cooperation)",
        "pos": enrich_res.get("pos", "Noun"),
        "language": "German"
    }
    status, edit_res = make_api_request("PUT", f"/words/{word_id}", token, edit_payload)
    if status != 200:
        print(f"FAILED editing word (code {status}): {edit_res}")
        sys.exit(1)
    print("OK. Word updated successfully.")

    # 6. Verify edit
    print("\n[Step 6] Verifying updated details on detail view...")
    status, verify_res = make_api_request("GET", f"/words/{word_id}", token)
    if verify_res.get("translation") != edit_payload["translation"]:
        print(f"FAILED: Edit verification mismatch. Expected '{edit_payload['translation']}', got '{verify_res.get('translation')}'")
        sys.exit(1)
    print("OK. Updated translation matches exactly.")

    # 7. Delete word
    print("\n[Step 7] Deleting the test word...")
    status, delete_res = make_api_request("DELETE", f"/words/{word_id}", token)
    if status not in (200, 204):
        print(f"FAILED deleting word (code {status}): {delete_res}")
        sys.exit(1)
    print("OK. Delete request returned success.")

    # 8. Verify deletion
    print("\n[Step 8] Verifying deletion from database...")
    status, check_res = make_api_request("GET", f"/words/{word_id}", token)
    if status == 200:
        print("FAILED: Word still exists in the database after delete!")
        sys.exit(1)
    print("OK. Deletion verified. Word is completely removed.")

    print("\n========================================")
    print("SUCCESS: FOCUSED CRUD + AI FLOW COMPLETELY VERIFIED!")
    print("========================================")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 test_crud_ai.py <JWT_TOKEN>")
        sys.exit(1)
    run_verify(sys.argv[1])
