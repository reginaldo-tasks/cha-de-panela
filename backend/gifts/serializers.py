"""
Serializers for Gift Registry API.
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from gifts.models import Couple, Gift
from api.authentication import create_jwt_token
from django.contrib.auth.hashers import make_password
from gifts.utils import generate_slug


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class CoupleSerializer(serializers.ModelSerializer):
    """Serializer for Couple model"""
    
    user = UserSerializer(read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Couple
        fields = [
            'id',
            'email',
            'couple_name',
            'list_title',
            'whatsapp',
            'pix_key',
            'wedding_date',
            'biography',
            'image_url',
            'qr_code_url',
            'user',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'email']
    
    def validate_couple_name(self, value):
        """Validate couple name uniqueness"""
        if not value or not value.strip():
            return value
        
        # Get current couple instance
        couple = self.instance
        
        # Check if another couple has the same name (case-insensitive)
        existing = Couple.objects.filter(couple_name__iexact=value).exclude(id=couple.id).first()
        if existing:
            raise serializers.ValidationError(
                "A couple with this name already exists. Please choose a different name."
            )
        
        return value


class GiftSerializer(serializers.ModelSerializer):
    """Serializer for Gift model"""
    
    couple_name = serializers.CharField(source='couple.couple_name', read_only=True)
    is_selected = serializers.SerializerMethodField()
    title = serializers.CharField(required=False, allow_blank=True, write_only=True)  # Accept 'title' as alias for 'name'
    
    class Meta:
        model = Gift
        fields = [
            'id',
            'couple',
            'couple_name',
            'name',
            'title',
            'description',
            'image_url',
            'category',
            'price',
            'priority',
            'status',
            'reserved_by',
            'url',
            'is_selected',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'couple', 'couple_name', 'created_at', 'updated_at']
    
    def get_is_selected(self, obj):
        """Return whether gift is selected (purchased)"""
        return obj.status == 'purchased'
    
    def to_internal_value(self, data):
        """Map 'title' field to 'name' field for internal processing"""
        if 'title' in data and 'name' not in data:
            data['name'] = data.pop('title')
        return super().to_internal_value(data)
    
    def validate(self, data):
        """Ensure name field is provided"""
        if 'name' not in data or not data['name']:
            raise serializers.ValidationError({"name": ["Este campo é obrigatório."]})
        return data
    
    def create(self, validated_data):
        """Create gift with couple from context"""
        validated_data['couple'] = self.context['couple']
        return super().create(validated_data)
    
    def validate_price(self, value):
        """Validate price is positive if provided"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Price must be positive.")
        return value
    
    def validate_priority(self, value):
        """Validate priority is positive"""
        if value < 1:
            raise serializers.ValidationError("Priority must be at least 1.")
        return value


class GiftMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for Gift model (used in couple detail)"""
    
    is_selected = serializers.SerializerMethodField()
    
    class Meta:
        model = Gift
        fields = [
            'id',
            'name',
            'category',
            'price',
            'status',
            'is_selected',
        ]
    
    def get_is_selected(self, obj):
        return obj.status == 'purchased'


class LoginSerializer(serializers.Serializer):
    """Serializer for login request"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    def validate(self, data):
        """Validate credentials"""
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email or password.")
        
        data['user'] = user
        return data


class LoginResponseSerializer(serializers.Serializer):
    """Serializer for login response"""
    
    token = serializers.CharField()
    couple = CoupleSerializer()


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, min_length=8)
    couple_name = serializers.CharField(required=False, allow_blank=True)
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value
    
    def validate_couple_name(self, value):
        """Validate couple name uniqueness (by slug)"""
        if value and value.strip():
            slug = generate_slug(value)
            # Check if any couple has the same slug
            existing_couple = Couple.objects.filter(couple_name__iexact=value).first()
            if existing_couple:
                raise serializers.ValidationError(
                    f"A couple with this name already exists. Please choose a different name."
                )
        return value
    
    def create(self, validated_data):
        """Create user and couple profile"""
        email = validated_data['email']
        password = validated_data['password']
        couple_name = validated_data.get('couple_name', '')
        
        # Create user
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
        )
        
        # Create couple profile
        couple = Couple.objects.create(
            user=user,
            couple_name=couple_name or email,
        )
        
        return {
            'user': user,
            'couple': couple,
        }


class ReserveGiftSerializer(serializers.Serializer):
    """Serializer for reserving a gift"""
    
    name = serializers.CharField(max_length=255)
    
    def validate_name(self, value):
        """Validate reserved_by name"""
        if not value or not value.strip():
            raise serializers.ValidationError("Name is required to reserve a gift.")
        return value.strip()
