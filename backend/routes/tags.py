from flask import Blueprint, request, jsonify, g
from services.supabase_client import supabase

tags_bp = Blueprint('tags', __name__)

@tags_bp.route('', methods=['GET'])
def list_tags():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    try:
        response = supabase.table('tags').select('*').execute()
        return jsonify({"items": response.data, "count": len(response.data)})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@tags_bp.route('/', methods=['POST'])
def create_tag():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    data = request.json
    try:
        insert_data = {
            "name": data.get("name"),
            "color": data.get("color", ""),
            "user_id": g.user_id
        }
        
        response = supabase.table('tags').insert(insert_data).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@tags_bp.route('/<tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    try:
        response = supabase.table('tags').delete().eq('id', tag_id).execute()
        if not response.data:
            return jsonify({"message": f"Tag {tag_id} not found"}), 404
        return jsonify({"message": f"Tag {tag_id} deleted successfully"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500
