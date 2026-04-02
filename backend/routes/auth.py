from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, Couple

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint for couples"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    couple = Couple.query.filter_by(email=data['email']).first()
    
    if not couple or not check_password_hash(couple.password_hash, data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=couple.id)
    
    return jsonify({
        'token': access_token,
        'couple': couple.to_dict(include_email=True)
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user"""
    couple_id = get_jwt_identity()
    couple = Couple.query.get(couple_id)
    
    if not couple:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify(couple.to_dict(include_email=True)), 200
