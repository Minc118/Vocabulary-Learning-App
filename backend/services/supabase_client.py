from supabase import create_client, Client, ClientOptions
from config import Config
from flask import g

def get_supabase() -> Client:
    url = Config.SUPABASE_URL
    key = Config.SUPABASE_KEY
    if not url or not key or url == "your_supabase_url":
        raise Exception("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY in backend/.env")
        
    token = getattr(g, 'token', None)
    if token:
        options = ClientOptions(headers={
            "Authorization": f"Bearer {token}",
            "apikey": key
        })
        return create_client(url, key, options=options)
        
    return create_client(url, key)

from werkzeug.local import LocalProxy
supabase = LocalProxy(get_supabase)
