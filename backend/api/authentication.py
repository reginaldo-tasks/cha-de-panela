"""
Custom JWT authentication for DRF.
"""
import jwt
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.status import HTTP_401_UNAUTHORIZED
from django.contrib.auth.models import User
from datetime import datetime, timedelta


class JWTAuthentication(TokenAuthentication):
    """Custom JWT authentication using PyJWT"""
    
    keyword = 'Bearer'
    
    def authenticate(self, request):
        """
        Authenticate JWT token in request headers.
        """
        auth = request.META.get('HTTP_AUTHORIZATION', '').split()
        
        if not auth or auth[0].lower() != self.keyword.lower():
            return None
        
        if len(auth) == 1:
            raise AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(auth) > 2:
            raise AuthenticationFailed('Invalid token header. Token string should not contain spaces.')
        
        token = auth[1]
        
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token has expired.')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token.')
        
        try:
            user_id = payload.get('user_id')
            if not user_id:
                raise AuthenticationFailed('Invalid token payload.')
            
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')
        
        return (user, token)


def create_jwt_token(user):
    """
    Create a JWT token for a user.
    
    Args:
        user: Django User instance
        
    Returns:
        str: JWT token
    """
    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.utcnow() + settings.JWT_EXPIRATION_DELTA,
        'iat': datetime.utcnow(),
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return token
