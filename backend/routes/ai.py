from flask import Blueprint, request, jsonify
from services.ai_service import enrich_word, bulk_enrich_words

ai_bp = Blueprint('ai', __name__)

def is_quota_error(e):
    err_str = str(e).lower()
    return "429" in err_str or "quota" in err_str or "rate limit" in err_str or "resource_exhausted" in err_str or "resource exhausted" in err_str

@ai_bp.route('/enrich', methods=['POST'])
def enrich():
    data = request.json
    word = data.get('word')
    language = data.get('language', 'English')
    native_language = data.get('native_language', 'Chinese')
    context = data.get('context', '')
    
    if not word:
        return jsonify({"message": "Word is required"}), 400
        
    try:
        enriched_data = enrich_word(word, language, context, native_language)
        return jsonify(enriched_data), 200
    except Exception as e:
        if is_quota_error(e):
            return jsonify({
                "message": "AI enrichment is temporarily unavailable. You can still save the word manually, or try again later. Please try again in about 1 minute."
            }), 429
        return jsonify({"message": "AI service is temporarily unavailable. Please try again later."}), 500

@ai_bp.route('/enrich-batch', methods=['POST'])
def enrich_batch():
    data = request.json
    words = data.get('words')
    language = data.get('language', 'English')
    native_language = data.get('native_language', 'Chinese')
    
    if not words or not isinstance(words, list):
        return jsonify({"message": "Words array is required"}), 400
        
    try:
        enriched_data = bulk_enrich_words(words, language, native_language)
        return jsonify(enriched_data), 200
    except Exception as e:
        if is_quota_error(e):
            return jsonify({
                "message": "AI enrichment is temporarily unavailable. You can still save the words manually, or try again later. Please try again in about 1 minute."
            }), 429
        return jsonify({"message": "AI service is temporarily unavailable. Please try again later."}), 500
