from supabase import create_client, Client
from config import Config
from flask import g

def get_supabase() -> Client:
    url = Config.SUPABASE_URL
    key = Config.SUPABASE_KEY
    if not url or not key or url == "your_supabase_url":
        raise Exception("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY in backend/.env")
        
    client = create_client(url, key)
    token = getattr(g, 'token', None)
    if token:
        client.postgrest.auth(token)
        
    return client

from werkzeug.local import LocalProxy
supabase = LocalProxy(get_supabase)
