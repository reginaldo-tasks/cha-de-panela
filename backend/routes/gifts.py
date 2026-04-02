from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Gift, Couple
from datetime import datetime

gifts_bp = Blueprint('gifts', __name__, url_prefix='/api/gifts')

@gifts_bp.route('', methods=['GET'])
def get_all_gifts():
    """Get all gifts (public)"""
    gifts = Gift.query.all()
    return jsonify([gift.to_dict() for gift in gifts]), 200

@gifts_bp.route('/<gift_id>', methods=['GET'])
def get_gift(gift_id):
    """Get a specific gift (public)"""
    gift = Gift.query.get(gift_id)
    
    if not gift:
        return jsonify({'message': 'Gift not found'}), 404
    
    return jsonify(gift.to_dict()), 200

@gifts_bp.route('', methods=['POST'])
@jwt_required()
def create_gift():
    """Create a new gift (requires authentication)"""
    couple_id = get_jwt_identity()
    couple = Couple.query.get(couple_id)
    
    if not couple:
        return jsonify({'message': 'Couple not found'}), 404
    
    data = request.get_json()
    
    # Accept both 'title' and 'name' for flexibility
    gift_name = data.get('title') or data.get('name')
    if not gift_name:
        return jsonify({'message': 'Gift title/name is required'}), 400
    
    try:
        price = float(data.get('price', 0)) if data.get('price') else None
    except (ValueError, TypeError):
        return jsonify({'message': 'Invalid price format'}), 400
    
    gift = Gift(
        couple_id=couple_id,
        name=gift_name,
        description=data.get('description'),
        image_url=data.get('imageUrl') or data.get('image_url'),
        category=data.get('category'),
        price=price,
        priority=int(data.get('priority', 1)),
        status=data.get('status', 'available'),
        url=data.get('url')
    )
    
    db.session.add(gift)
    db.session.commit()
    
    return jsonify(gift.to_dict()), 201

@gifts_bp.route('/<gift_id>', methods=['PUT'])
@jwt_required()
def update_gift(gift_id):
    """Update a gift (requires authentication)"""
    couple_id = get_jwt_identity()
    gift = Gift.query.get(gift_id)
    
    if not gift:
        return jsonify({'message': 'Gift not found'}), 404
    
    if gift.couple_id != couple_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    # Update fields - accept both 'title' and 'name'
    if 'title' in data or 'name' in data:
        gift.name = data.get('title') or data.get('name') or gift.name
    if 'description' in data:
        gift.description = data['description']
    if 'imageUrl' in data or 'image_url' in data:
        gift.image_url = data.get('imageUrl') or data.get('image_url')
    if 'category' in data:
        gift.category = data['category']
    if 'price' in data:
        try:
            gift.price = float(data['price']) if data['price'] else None
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid price format'}), 400
    if 'priority' in data:
        try:
            gift.priority = int(data['priority'])
        except (ValueError, TypeError):
            return jsonify({'message': 'Invalid priority format'}), 400
    if 'status' in data:
        gift.status = data['status']
    if 'isSelected' in data:
        gift.status = 'purchased' if data['isSelected'] else 'available'
    if 'reservedBy' in data:
        gift.reserved_by = data['reservedBy']
    if 'url' in data:
        gift.url = data['url']
    
    gift.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(gift.to_dict()), 200

@gifts_bp.route('/<gift_id>', methods=['DELETE'])
@jwt_required()
def delete_gift(gift_id):
    """Delete a gift (requires authentication)"""
    couple_id = get_jwt_identity()
    gift = Gift.query.get(gift_id)
    
    if not gift:
        return jsonify({'message': 'Gift not found'}), 404
    
    if gift.couple_id != couple_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    db.session.delete(gift)
    db.session.commit()
    
    return jsonify({'message': 'Gift deleted'}), 200

@gifts_bp.route('/<gift_id>/select', methods=['POST'])
def select_gift(gift_id):
    """Mark a gift as selected/purchased (public)"""
    gift = Gift.query.get(gift_id)
    
    if not gift:
        return jsonify({'message': 'Gift not found'}), 404
    
    if gift.status == 'purchased':
        return jsonify({'message': 'Gift is already purchased'}), 400
    
    gift.status = 'purchased'
    gift.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(gift.to_dict()), 200

@gifts_bp.route('/<gift_id>/reserve', methods=['POST'])
def reserve_gift(gift_id):
    """Reserve a gift (public)"""
    data = request.get_json()
    gift = Gift.query.get(gift_id)
    
    if not gift:
        return jsonify({'message': 'Gift not found'}), 404
    
    if gift.status != 'available':
        return jsonify({'message': 'Gift is not available'}), 400
    
    if not data or not data.get('name'):
        return jsonify({'message': 'Name is required'}), 400
    
    gift.status = 'reserved'
    gift.reserved_by = data['name']
    gift.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(gift.to_dict()), 200
