import os

from flask import Flask, jsonify, request, g, abort
from flask_cors import CORS
from services.supabase_client import get_supabase

from config import Config
from routes.words import words_bp
from routes.collections import collections_bp
from routes.tags import tags_bp
from routes.ai import ai_bp
from routes.import_text import import_bp
from routes.review import review_bp
from routes.stats import stats_bp
from routes.export import export_bp

def create_app() -> Flask:
    app = Flask(__name__)
    
    # Secure CORS configuration using FRONTEND_ORIGIN or fallback whitelists
    frontend_origin = os.getenv("FRONTEND_ORIGIN")
    allowed_origins = ["http://localhost:5173", "https://voca118.vercel.app"]
    if frontend_origin:
        allowed_origins.append(frontend_origin)
        
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    @app.get("/api/health")
    def health_check():
        return jsonify(
            {
                "ok": True,
                "service": "flask-vocabulary-service",
            }
        )

    @app.before_request
    def authenticate():
        if request.method == "OPTIONS":
            return
        if request.path.startswith("/api/health"):
            return
            
        auth_header = request.headers.get("Authorization")
        auth_header_present = auth_header is not None
        bearer_token_present = False
        if auth_header_present:
            bearer_token_present = auth_header.startswith("Bearer ")

        supabase_client_configured = False
        supabase_url = Config.SUPABASE_URL
        supabase_key = Config.SUPABASE_KEY
        if supabase_url and supabase_key and supabase_url != "your_supabase_url":
            supabase_client_configured = True

        print(f"[AUTH_DIAG] auth_header_present: {auth_header_present}")
        print(f"[AUTH_DIAG] bearer_token_present: {bearer_token_present}")
        print(f"[AUTH_DIAG] supabase_client_configured: {supabase_client_configured}")
        print(f"[AUTH_DIAG] auth_validation_method: get_user")

        if not auth_header or not auth_header.startswith("Bearer "):
            print(f"[AUTH_DIAG] supabase_get_user_success: False")
            print(f"[AUTH_DIAG] auth_failure_reason: missing_header" if not auth_header else "[AUTH_DIAG] auth_failure_reason: malformed_header")
            abort(401, "Missing or invalid Authorization header")
            
        token = auth_header.split(" ")[1]
        try:
            g.token = token
            supabase = get_supabase()
            user_response = supabase.auth.get_user(token)
            
            if not user_response or not user_response.user:
                print(f"[AUTH_DIAG] supabase_get_user_success: False")
                print(f"[AUTH_DIAG] auth_failure_reason: get_user_failed")
                abort(401, "Invalid token")
                
            g.user_id = user_response.user.id
            print(f"[AUTH_DIAG] supabase_get_user_success: True")
        except Exception as e:
            print(f"[AUTH_DIAG] supabase_get_user_success: False")
            print(f"[AUTH_DIAG] auth_failure_reason: get_user_failed")
            print(f"[AUTH_DIAG] Exception: {str(e)}")
            abort(401, f"Authentication error: {str(e)}")

    app.register_blueprint(words_bp, url_prefix='/api/words')
    app.register_blueprint(collections_bp, url_prefix='/api/collections')
    app.register_blueprint(tags_bp, url_prefix='/api/tags')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(import_bp, url_prefix='/api/import')
    app.register_blueprint(review_bp, url_prefix='/api/review')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    app.register_blueprint(export_bp, url_prefix='/api/export')

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host=Config.FLASK_HOST, port=Config.FLASK_PORT, debug=Config.FLASK_DEBUG)
