import sys
import os
import time
from test_auth_helper import get_auth_token, make_api_request

def run_collection_flow_test():
    print("==============================================================")
    print("      VOCA AUTOMATED E2E TEST: COLLECTION RELATIONSHIP FLOW    ")
    print("==============================================================")
    
    # 1. Authenticate programmatically (JWT is kept strictly in-memory)
    token = get_auth_token()
    if not token:
        print("CRITICAL: Failed to obtain authentication token. Exiting.", file=sys.stderr)
        sys.exit(1)

    # 2. Setup run-scoped unique sandbox credentials and prefix
    timestamp = int(time.time())
    run_prefix = f"E2E_TEST_RUN_{timestamp}"
    test_collection_name = f"{run_prefix}_Collection"
    test_word_text = f"{run_prefix}_Word"
    
    print(f"INFO: Running test with sandboxed prefix: {run_prefix}")
    
    # Store IDs for clean-up
    created_collection_id = None
    created_word_id = None
    
    try:
        # STEP 1: AI Enrichment Flow Verification
        print("\n[STEP 1] Testing AI Enrichment API...")
        enrich_payload = {
            "word": "phenomenon",
            "language": "English",
            "native_language": "Chinese"
        }
        status, enrich_res = make_api_request("POST", "/ai/enrich", token, enrich_payload)
        
        if status != 200:
            print(f"ERROR: AI enrichment failed with status {status}. Response: {enrich_res}", file=sys.stderr)
            sys.exit(1)
            
        print("SUCCESS: AI Enrichment responded successfully.")
        print(f"  - Word: {enrich_res.get('word')}")
        print(f"  - Translation: {enrich_res.get('translation')}")
        print(f"  - Definition: {enrich_res.get('definition')}")
        
        # STEP 2: Create a Collection
        print("\n[STEP 2] Creating a new sandboxed collection...")
        collection_payload = {
            "name": test_collection_name,
            "description": "Programmatically created for collection relationship testing."
        }
        
        # Using trailing slash as registered in collections.py route
        status, collection_res = make_api_request("POST", "/collections/", token, collection_payload)
        if status != 201:
            print(f"ERROR: Failed to create collection (status {status}). Response: {collection_res}", file=sys.stderr)
            sys.exit(1)
            
        created_collection_id = collection_res.get("id")
        if not created_collection_id:
            print("ERROR: Response did not include collection ID.", file=sys.stderr)
            sys.exit(1)
            
        print(f"SUCCESS: Collection created with ID: {created_collection_id}")
        
        # STEP 3: Verify the collection is listed in Collection List
        print("\n[STEP 3] Verifying collection appears in collections list...")
        status, list_res = make_api_request("GET", "/collections", token)
        if status != 200:
            print(f"ERROR: Failed to list collections (status {status}). Response: {list_res}", file=sys.stderr)
            sys.exit(1)
            
        collections = list_res.get("items", [])
        matched_collection = next((c for c in collections if c.get("id") == created_collection_id), None)
        if not matched_collection:
            print(f"ERROR: Created collection with ID {created_collection_id} not found in listing.", file=sys.stderr)
            sys.exit(1)
            
        print(f"SUCCESS: Found collection '{matched_collection.get('name')}' in listing.")
        
        # STEP 4: Save a Word into this Collection
        print("\n[STEP 4] Saving a word associated with the collection...")
        word_payload = {
            "word": test_word_text,
            "translation": enrich_res.get("translation", "现象"),
            "pos": enrich_res.get("pos", "Noun"),
            "language": "English",
            "source": f"Article: {run_prefix}",
            "definition": enrich_res.get("definition", "A remarkable person, thing, or event."),
            "collection_id": created_collection_id,
            "examples": [
                {
                    "sentence": "Glaciers are a natural phenomenon.",
                    "translation": "冰川是一种自然现象。"
                }
            ],
            "collocations": ["natural phenomenon", "social phenomenon"],
            "synonyms": ["occurrence", "event", "marvel"]
        }
        
        status, word_res = make_api_request("POST", "/words", token, word_payload)
        if status != 201:
            print(f"ERROR: Failed to save word (status {status}). Response: {word_res}", file=sys.stderr)
            sys.exit(1)
            
        created_word_id = word_res.get("id")
        if not created_word_id:
            print("ERROR: Response did not include word ID.", file=sys.stderr)
            sys.exit(1)
            
        print(f"SUCCESS: Word '{word_res.get('word')}' successfully created with ID: {created_word_id}")
        
        # STEP 5: Verify general vocabulary list contains the word
        print("\n[STEP 5] Checking general vocabulary listing for the new word...")
        status, words_list_res = make_api_request("GET", "/words", token)
        if status != 200:
            print(f"ERROR: Failed to list words (status {status}). Response: {words_list_res}", file=sys.stderr)
            sys.exit(1)
            
        words = words_list_res.get("items", [])
        matched_word = next((w for w in words if w.get("id") == created_word_id), None)
        if not matched_word:
            print(f"ERROR: Saved word with ID {created_word_id} not found in general list.", file=sys.stderr)
            sys.exit(1)
            
        print(f"SUCCESS: Word '{matched_word.get('word')}' confirmed present in overall vocabulary.")
        
        # STEP 6: Verify Collection Detail Endpoint filtering (GET /api/words?collection_id=...)
        print("\n[STEP 6] Testing collection detail filtering (GET /api/words?collection_id=)...")
        status, col_words_res = make_api_request("GET", f"/words?collection_id={created_collection_id}", token)
        if status != 200:
            print(f"ERROR: Failed to query words by collection_id (status {status}). Response: {col_words_res}", file=sys.stderr)
            sys.exit(1)
            
        col_words = col_words_res.get("items", [])
        print(f"INFO: Collection detail endpoint returned {len(col_words)} words.")
        
        # Verify that all returned words belong to this collection
        for w in col_words:
            if w.get("collection_id") != created_collection_id:
                print(f"ERROR: Leak detected! Word {w.get('id')} with collection_id {w.get('collection_id')} returned inside query for collection {created_collection_id}.", file=sys.stderr)
                sys.exit(1)
                
        # Verify our specific word is in there
        matched_col_word = next((w for w in col_words if w.get("id") == created_word_id), None)
        if not matched_col_word:
            print(f"ERROR: Saved word with ID {created_word_id} was NOT returned by the collection detail filter.", file=sys.stderr)
            sys.exit(1)
            
        print(f"SUCCESS: Collection detail filtering verified. Correctly associated word '{matched_col_word.get('word')}' is present.")
        
        # STEP 7: Edit the Word inside the collection
        print("\n[STEP 7] Editing word details...")
        edited_translation = f"{run_prefix}_Translation_Edited"
        edit_payload = {
            "word": test_word_text,
            "translation": edited_translation,
            "pos": "Noun",
            "language": "English"
        }
        status, edit_res = make_api_request("PUT", f"/words/{created_word_id}", token, edit_payload)
        if status != 200:
            print(f"ERROR: Failed to edit word (status {status}). Response: {edit_res}", file=sys.stderr)
            sys.exit(1)
            
        print("SUCCESS: Word edit request returned status 200.")
        
        # STEP 8: Verify Edit
        print("\n[STEP 8] Verifying edit was saved...")
        status, detail_res = make_api_request("GET", f"/words/{created_word_id}", token)
        if status != 200:
            print(f"ERROR: Failed to fetch word detail (status {status}). Response: {detail_res}", file=sys.stderr)
            sys.exit(1)
            
        if detail_res.get("translation") != edited_translation:
            print(f"ERROR: Updated translation mismatch. Expected '{edited_translation}', got '{detail_res.get('translation')}'", file=sys.stderr)
            sys.exit(1)
            
        print(f"SUCCESS: Translation successfully updated to: {detail_res.get('translation')}")
        
        # STEP 9: Verify Review Queue works
        print("\n[STEP 9] Verifying review queue response...")
        status, queue_res = make_api_request("GET", "/review/queue?limit=10", token)
        if status != 200:
            print(f"ERROR: Review queue responded with status {status}. Response: {queue_res}", file=sys.stderr)
            sys.exit(1)
            
        queue_items = queue_res.get("items", [])
        print(f"SUCCESS: Review queue active. Returned {len(queue_items)} items.")
        
    finally:
        # STEP 10: Strict Sandboxed Clean-up Block
        print("\n==============================================================")
        print("                   SANDBOXED TEST DATA CLEANUP                ")
        print("==============================================================")
        
        # Cleanup word if created
        if created_word_id:
            print(f"-> Deleting test word with ID: {created_word_id}")
            # Confirm word text matches prefix before delete to act as a double safeguard
            status, detail_res = make_api_request("GET", f"/words/{created_word_id}", token)
            if status == 200 and detail_res.get("word", "").startswith("E2E_TEST_RUN_"):
                del_status, del_res = make_api_request("DELETE", f"/words/{created_word_id}", token)
                if del_status in (200, 204):
                    print("   OK. Word successfully deleted.")
                else:
                    print(f"   WARNING: Word deletion returned status {del_status}: {del_res}", file=sys.stderr)
            else:
                print(f"   WARNING: Skipped delete. Word did not match safe E2E_TEST_RUN_ prefix.", file=sys.stderr)
                
        # Cleanup collection if created
        if created_collection_id:
            print(f"-> Deleting test collection with ID: {created_collection_id}")
            status, col_res = make_api_request("GET", f"/collections/{created_collection_id}", token)
            if status == 200 and col_res.get("name", "").startswith("E2E_TEST_RUN_"):
                del_status, del_res = make_api_request("DELETE", f"/collections/{created_collection_id}", token)
                if del_status in (200, 204):
                    print("   OK. Collection successfully deleted.")
                else:
                    print(f"   WARNING: Collection deletion returned status {del_status}: {del_res}", file=sys.stderr)
            else:
                print(f"   WARNING: Skipped delete. Collection did not match safe E2E_TEST_RUN_ prefix.", file=sys.stderr)
                
        # Verification of complete cleanup
        print("-> Verifying cleanup was 100% successful...")
        if created_word_id:
            status, _ = make_api_request("GET", f"/words/{created_word_id}", token)
            if status == 200:
                print(f"   CRITICAL: Test word {created_word_id} still exists in the database!", file=sys.stderr)
                sys.exit(1)
        if created_collection_id:
            status, _ = make_api_request("GET", f"/collections/{created_collection_id}", token)
            if status == 200:
                print(f"   CRITICAL: Test collection {created_collection_id} still exists in the database!", file=sys.stderr)
                sys.exit(1)
                
        print("SUCCESS: Sandbox cleanup verified. All created rows successfully removed.")
        print("==============================================================")
        
    print("\nSUCCESS: VOCA AUTOMATED COLLECTION RELATIONSHIP FLOW PASSED!")
    print("==============================================================")

if __name__ == "__main__":
    run_collection_flow_test()
