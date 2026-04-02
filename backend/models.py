from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class Couple(db.Model):
    """Model for couple/admin users"""
    __tablename__ = 'couples'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    couple_name = db.Column(db.String(255), nullable=True)
    list_title = db.Column(db.String(255), nullable=True)
    whatsapp = db.Column(db.String(20), nullable=True)
    pix_key = db.Column(db.String(255), nullable=True)
    wedding_date = db.Column(db.Date, nullable=True)
    biography = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    qr_code_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    gifts = db.relationship('Gift', backref='couple', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_email=False):
        """Convert model to dictionary"""
        data = {
            'id': self.id,
            'coupleName': self.couple_name,
            'listTitle': self.list_title,
            'whatsapp': self.whatsapp,
            'pixKey': self.pix_key,
            'weddingDate': self.wedding_date.isoformat() if self.wedding_date else None,
            'biography': self.biography,
            'imageUrl': self.image_url,
            'qrCodeUrl': self.qr_code_url,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
        }
        if include_email:
            data['email'] = self.email
        return data

class Gift(db.Model):
    """Model for gifts"""
    __tablename__ = 'gifts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    couple_id = db.Column(db.String(36), db.ForeignKey('couples.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    category = db.Column(db.String(100), nullable=True)
    price = db.Column(db.Float, nullable=True)
    priority = db.Column(db.Integer, default=1)
    status = db.Column(db.String(50), default='available')  # available, reserved, purchased
    reserved_by = db.Column(db.String(255), nullable=True)
    url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary"""
        return {
            'id': self.id,
            'coupleId': self.couple_id,
            'title': self.name,  # Map 'name' to 'title' for frontend compatibility
            'name': self.name,  # Keep both for compatibility
            'description': self.description,
            'imageUrl': self.image_url,
            'category': self.category,
            'price': self.price,
            'priority': self.priority,
            'status': self.status,
            'reservedBy': self.reserved_by,
            'url': self.url,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat(),
            'isSelected': self.status == 'purchased',
            'selectedAt': None,  # TODO: Add selectedAt field if needed
        }
