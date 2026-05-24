from flask import Blueprint, request, jsonify
from services.ai_service import enrich_word, bulk_enrich_words

ai_bp = Blueprint('ai', __name__)

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
        return jsonify({"message": str(e)}), 500

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
        return jsonify({"message": str(e)}), 500
