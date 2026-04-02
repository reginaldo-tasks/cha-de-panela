"""
Custom permissions for Gift Registry API.
"""
from rest_framework.permissions import BasePermission, IsAuthenticated


class IsCoupleOwner(BasePermission):
    """
    Permission to check if user is the owner of the couple.
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if request user is the couple owner"""
        return obj.user == request.user


class IsGiftOwner(BasePermission):
    """
    Permission to check if user owns the gift (through couple).
    """
    
    def has_object_permission(self, request, view, obj):
        """Check if request user owns the gift"""
        return obj.couple.user == request.user


class IsAuthenticatedForWrite(BasePermission):
    """
    Allow any access on safe methods.
    Require authentication for write methods.
    """
    
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user and request.user.is_authenticated
