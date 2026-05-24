from flask import Blueprint, request, jsonify, g
from services.supabase_client import supabase

collections_bp = Blueprint('collections', __name__)

@collections_bp.route('', methods=['GET'])
def list_collections():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    try:
        response = supabase.table('collections').select('*').execute()
        return jsonify({"items": response.data, "count": len(response.data)})
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@collections_bp.route('/<collection_id>', methods=['GET'])
def get_collection(collection_id):
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    try:
        response = supabase.table('collections').select('*').eq('id', collection_id).execute()
        if not response.data:
            return jsonify({"message": f"Collection {collection_id} not found"}), 404
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@collections_bp.route('/', methods=['POST'])
def create_collection():
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    data = request.json
    try:
        insert_data = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "user_id": g.user_id
        }
        
        response = supabase.table('collections').insert(insert_data).execute()
        return jsonify(response.data[0]), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@collections_bp.route('/<collection_id>', methods=['PUT'])
def update_collection(collection_id):
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    data = request.json
    try:
        update_data = {}
        for key in ["name", "description"]:
            if key in data:
                update_data[key] = data[key]
                
        response = supabase.table('collections').update(update_data).eq('id', collection_id).execute()
        if not response.data:
            return jsonify({"message": f"Collection {collection_id} not found"}), 404
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@collections_bp.route('/<collection_id>', methods=['DELETE'])
def delete_collection(collection_id):
    if not supabase:
        return jsonify({"message": "Supabase client not initialized"}), 500
        
    try:
        response = supabase.table('collections').delete().eq('id', collection_id).execute()
        if not response.data:
            return jsonify({"message": f"Collection {collection_id} not found"}), 404
        return jsonify({"message": f"Collection {collection_id} deleted successfully"})
    except Exception as e:
        return jsonify({"message": str(e)}), 500
