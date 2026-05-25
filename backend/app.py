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
    CORS(app, resources={r"/api/*": {"origins": "*"}})

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
        if not auth_header or not auth_header.startswith("Bearer "):
            abort(401, "Missing or invalid Authorization header")
            
        token = auth_header.split(" ")[1]
        try:
            g.token = token
            supabase = get_supabase()
            user_response = supabase.auth.get_user(token)
            if not user_response or not user_response.user:
                abort(401, "Invalid token")
            g.user_id = user_response.user.id
        except Exception as e:
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
