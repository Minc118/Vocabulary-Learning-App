import sys
from supabase import create_client, Client

# This script queries the Supabase Cloud database system tables to inspect the actual column schema of 'words'.
# Targets: Supabase Cloud database (https://tpkqrodztgwkebionqbv.supabase.co)

SUPABASE_URL = "https://tpkqrodztgwkebionqbv.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwa3Fyb2R6dGd3a2ViaW9ucWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjM0OTIsImV4cCI6MjA5MTYzOTQ5Mn0.PhYB-EFNRqMac0KFOo5piWnS5-xOfM8SJdxzyiVpMrM"

def check_schema():
    print(f"-> Connecting to Supabase Cloud: {SUPABASE_URL}...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Test basic select to see what fields are returned
        print("-> Attempting to fetch a single row from 'words' to inspect column keys...")
        res = supabase.table('words').select('*').limit(1).execute()
        print(f"Success! Status: 200. Returned data size: {len(res.data)}")
        if res.data:
            print(f"Actual columns in 'words' table: {list(res.data[0].keys())}")
        else:
            print("The 'words' table is currently empty. Fetching table structure from PostgREST openapi schema...")
            # We can read columns by checking the REST API definition or via a RPC if defined.
            # Let's inspect via an HTTP request to the swagger / openapi endpoint of PostgREST
            import urllib.request
            import json
            req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/", headers={"apikey": SUPABASE_KEY})
            with urllib.request.urlopen(req) as response:
                schema_info = json.loads(response.read().decode('utf-8'))
                definitions = schema_info.get('definitions', {})
                words_def = definitions.get('words', {})
                properties = words_def.get('properties', {})
                print(f"Registered PostgREST schema columns for 'words': {list(properties.keys())}")
                
                collections_def = definitions.get('collections', {})
                coll_properties = collections_def.get('properties', {})
                print(f"Registered PostgREST schema columns for 'collections': {list(coll_properties.keys())}")
                
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    check_schema()
