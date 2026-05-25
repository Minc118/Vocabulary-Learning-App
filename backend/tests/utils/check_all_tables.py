import urllib.request
import json
import os
import sys

# Inspections of all table schemas on Supabase Cloud to find missing user_id columns.
# Targets: Supabase Cloud database (https://tpkqrodztgwkebionqbv.supabase.co)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: Environment variables SUPABASE_URL and SUPABASE_ANON_KEY must be set to run this script.")
    print("Please set them in your environment (e.g., export SUPABASE_URL=... and export SUPABASE_ANON_KEY=...)")
    sys.exit(1)

def check_all():
    print(f"-> Fetching openapi schema for: {SUPABASE_URL}...")
    try:
        req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/", headers={"apikey": SUPABASE_KEY})
        with urllib.request.urlopen(req) as response:
            schema_info = json.loads(response.read().decode('utf-8'))
            definitions = schema_info.get('definitions', {})
            
            tables_to_check = [
                'words', 'examples', 'collocations', 'synonyms', 
                'collections', 'tags', 'word_tags', 'imported_text'
            ]
            
            for table in tables_to_check:
                table_def = definitions.get(table)
                if table_def:
                    properties = table_def.get('properties', {})
                    cols = list(properties.keys())
                    has_user_id = 'user_id' in cols
                    print(f"Table '{table}':")
                    print(f"  - Columns: {cols}")
                    print(f"  - Has 'user_id' column: {'🟢 YES' if has_user_id else '🔴 NO'}")
                else:
                    print(f"Table '{table}': ❌ DOES NOT EXIST IN DATABASE!")
                    
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    check_all()
