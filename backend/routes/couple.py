from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Couple
from datetime import datetime

couple_bp = Blueprint('couple', __name__, url_prefix='/api/couple')

@couple_bp.route('/public', methods=['GET'])
def get_public_couple_info():
    """Get public couple information (without authentication)"""
    # Get the first couple in the database
    couple = Couple.query.first()
    
    if not couple:
        return jsonify({'message': 'No couple found'}), 404
    
    return jsonify(couple.to_dict(include_email=False)), 200

@couple_bp.route('', methods=['PUT'])
@jwt_required()
def update_couple():
    """Update couple information (requires authentication)"""
    couple_id = get_jwt_identity()
    couple = Couple.query.get(couple_id)
    
    if not couple:
        return jsonify({'message': 'Couple not found'}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'coupleName' in data:
        couple.couple_name = data['coupleName']
    if 'listTitle' in data:
        couple.list_title = data['listTitle']
    if 'whatsapp' in data:
        couple.whatsapp = data['whatsapp']
    if 'pixKey' in data:
        couple.pix_key = data['pixKey']
    if 'weddingDate' in data:
        try:
            couple.wedding_date = datetime.fromisoformat(data['weddingDate']).date() if data['weddingDate'] else None
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid wedding date format'}), 400
    if 'biography' in data:
        couple.biography = data['biography']
    if 'imageUrl' in data:
        couple.image_url = data['imageUrl']
    if 'qrCodeUrl' in data:
        couple.qr_code_url = data['qrCodeUrl']
    
    couple.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(couple.to_dict(include_email=True)), 200
