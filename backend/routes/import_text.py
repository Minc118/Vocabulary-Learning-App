from flask import Blueprint, request, jsonify
from services.ai_service import analyze_text_for_words, extract_text_from_file, check_typo

import_bp = Blueprint('import_text', __name__)

@import_bp.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text')
    language = data.get('language', 'English')
    level = data.get('level', 'Intermediate')
    goal = data.get('goal', 'General')
    count = data.get('count', 10)
    native_language = data.get('native_language', 'Chinese')
    
    if not text:
        return jsonify({"message": "Text is required"}), 400
        
    try:
        candidates = analyze_text_for_words(text, language, level, goal, count, native_language)
        return jsonify({"candidates": candidates}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@import_bp.route('/extract-text', methods=['POST'])
def extract_text():
    data = request.json
    file_data = data.get('fileData')
    mime_type = data.get('mimeType')
    
    if not file_data or not mime_type:
        return jsonify({"message": "File data and mimeType are required"}), 400
        
    try:
        text = extract_text_from_file(file_data, mime_type)
        return jsonify({"text": text}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@import_bp.route('/check-typo', methods=['POST'])
def verify_typo():
    data = request.json
    text = data.get('text')
    typed_word = data.get('typed_word')
    
    if not text or not typed_word:
        return jsonify({"message": "text and typed_word are required"}), 400
        
    try:
        result = check_typo(text, typed_word)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
