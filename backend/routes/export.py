from flask import Blueprint, jsonify
from services.supabase_client import supabase

export_bp = Blueprint('export', __name__)

@export_bp.route('/vocabulary', methods=['GET'])
def export_vocabulary():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
    try:
        response = supabase.table('words').select('*, examples(*), collocations(*), synonyms(*), tags:word_tags(tag:tags(*))').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@export_bp.route('/collections', methods=['GET'])
def export_collections():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
    try:
        response = supabase.table('collections').select('*').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@export_bp.route('/review-progress', methods=['GET'])
def export_review_progress():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
    try:
        response = supabase.table('words').select('id, word, mastery, next_review, review_count, updated_at').execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@export_bp.route('/all', methods=['GET'])
def export_all():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
    try:
        words_res = supabase.table('words').select('*, examples(*), collocations(*), synonyms(*), tags:word_tags(tag:tags(*))').execute()
        collections_res = supabase.table('collections').select('*').execute()
        
        return jsonify({
            "vocabulary": words_res.data,
            "collections": collections_res.data
        })
    except Exception as e:
        return jsonify({"message": str(e)}), 500
